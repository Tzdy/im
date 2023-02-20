import { ref, computed, reactive, nextTick, defineComponent, set } from '../public/js/vue.esm.js'
import { join } from '../util/path.js'
import { postUploadAvatar, putInfo } from '../api/auth.js'
import { exit, userStore } from '../store/user.js'
import { chatStore, initMessage, sendMessage, chatType, sendUploadMessage, fetchFriendList, userMap, setLatestChatTimeOne, getMessage, sliceMessage } from '../store/chat.js'
import { openWs, eventBus, STATUS, EVENT } from '../ws.js'
import { goLogin } from '../router.js'
import { notify } from '../util/notify.js'
import { VUE_BASE } from '../config.js'
import { getToken } from '../util/storage.js'
import { throttling } from '../util/throttling.js'
import { relativeTimeFormat } from '../util/timeFormat.js'
import UserCard from '../components/UserCard.js'
import BDialog from '../components/BDialog.js'
import BNavTab from '../components/BNavTab.js'
import { getChat } from '../api/chat.js'

export default defineComponent({
    template: '#index-main',
    components: {
        UserCard,
        BDialog,
        BNavTab,
    },
    setup() {
        openWs()

        function onReOpenWs() {
            openWs()
        }

        const info = computed(() => userStore.userInfo)
        const isAlive = computed(() => userStore.isAlive)
        const editInfo = reactive({
            nickname: '',
            avatarType: -1,
            avatar: '',
            avatarFile: null,
        })

        const friendList = computed(() => chatStore.friendList)

        const friendListComputed = computed(() => {
            const onlineList = friendList.value.filter(item => item.isOnline)
            const offlineList = friendList.value.filter(item => !item.isOnline)
            return onlineList.concat(offlineList).map(item => {
                let hasNewAlert = false
                const timeNumber = new Date(item.contentCreatedTime).getTime()
                if (chatStore.latestChatTime[item.userId]) {
                    if (timeNumber > chatStore.latestChatTime[item.userId]) {
                        hasNewAlert = true
                    }
                }
                return {
                    hasNewAlert,
                    ...item
                }
            })
        })


        fetchFriendList()


        const hasNewMsg = ref(false)

        const onScrollChat = function () {
            if (chatBoxElement.value.scrollTop < 200) {
                fetchChatList()
            }
            if (!hasNewMsg.value) {
                return
            }
            if (chatBoxElement.value.scrollHeight - chatBoxElement.value.scrollTop < 1.5 * chatBoxElement.value.offsetHeight) {
                hasNewMsg.value = false
            }
        }

        function onScrollChatToBottom() {
            hasNewMsg.value = false
            chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
        }

        eventBus.$on(EVENT.CHAT, async function (response) {
            const data = response.data
            // 这是对方发送的信息，user_id是friend的id
            const userId = data.user_id
            const friendId = data.friend_id
            if (response.code === 20000 && friendId === userStore.userInfo.userId) {
                // 更新好友栏最新消息
                const friendIndex = chatStore.friendList.findIndex(item => item.userId === userId)
                if (friendIndex !== -1) {
                    chatStore.friendList[friendIndex].content = data.content
                    chatStore.friendList[friendIndex].contentCreatedTime = data.created_time
                    // 如果处于会话中，就直接更新，不在头像上显示红点。
                    if (selectUserId.value === userId) {
                        setLatestChatTimeOne(userId, data.created_time)
                    }
                }
                if (!chatStore.userChat[userId]) {
                    // 对方可能是新用户
                    if (!friendList.value.find(it => it.userId === userId)) {
                        // 刷新一下好友列表
                        set(chatStore.userChat, userId, [])
                        await fetchFriendList()
                    } else {
                        // 只有用户点击过的，才会实时存储消息。
                        return
                    }
                }
                chatStore.userChat[userId].push({
                    nickname: userMap.value[data.user_id].nickname,
                    avatarType: userMap.value[data.user_id].avatarType,
                    avatarVersion: userMap.value[data.user_id].avatarVersion,
                    __load: false,
                    ...data
                })
                if (chatBoxElement.value.scrollHeight - chatBoxElement.value.scrollTop < 1.5 * chatBoxElement.value.offsetHeight) {
                    nextTick(() => {
                        chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
                    })
                } else {
                    hasNewMsg.value = true
                }
                const friendNickname = (friendList.value.find(user => user.userId === userId) || { nickname: '未命名' }).nickname
                notify(`${friendNickname}，发送消息。`)
            }
        })

        eventBus.$on(EVENT.NOTIFY_STATE_CHANGE, response => {
            const { userId, status } = response.data
            const friend = friendList.value.find(item => item.userId === userId)
            if (friend) {
                friend.isOnline = status === STATUS.ONLINE ? true : false
            }
        })

        let page = 1
        const pageSize = 20
        const scrollSmooth = ref(true)
        let fetchChatListInited = false
        let fetchChatListLoadEnd = false
        const fetchChatListLoading = ref(false)
        // 初次点击，或者切换会话
        function fetchChatList() {
            if (fetchChatListLoading.value || fetchChatListLoadEnd) {
                return
            }
            fetchChatListLoading.value = true
            if (!fetchChatListInited) {
                return initMessage(selectUserId.value, page, pageSize)
                    .then(list => {
                        if (list && list.length !== 0) {
                            page++
                            fetchChatListInited = true
                            scrollSmooth.value = false
                            nextTick(() => {
                                chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
                                scrollSmooth.value = true
                            })

                        } else {
                            fetchChatListLoadEnd = true
                        }
                    })
                    .finally(() => {
                        fetchChatListLoading.value = false
                    })
            } else {
                getMessage(selectUserId.value, page, pageSize)
                    .then(chatList => {
                        if (chatList.length !== 0) {
                            page++
                        } else {
                            fetchChatListLoadEnd = true
                        }
                    })
                    .finally(() => {
                        fetchChatListLoading.value = false
                    })
            }
        }
        const selectUserId = ref(null)

        const content = ref('')
        const chatBoxElement = ref(null) // Element

        async function onSendMessage() {
            const _content = content.value
            const _selectUserId = selectUserId.value
            if (!_content || !_selectUserId) {
                return
            }
            content.value = ''
            await sendMessage(_selectUserId, _content)
            chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
        }

        function onResetMessage() {
            content.value = ''
        }


        function onSelect(id, time) {
            if (selectUserId.value === id) {
                return
            }
            fetchChatListInited = false
            fetchChatListLoadEnd = false
            sliceMessage(selectUserId.value, pageSize)
            page = 1
            selectUserId.value = id
            // 清除头像上红点
            setLatestChatTimeOne(selectUserId.value, time)
            fetchChatList()
        }
        const isSelectChat = computed(() => {
            return selectUserId.value !== null
        })


        const contentClass = function (userId, type) {
            if (type === chatType.TEXT) {
                return {
                    'text-bg-mine': userId === info.value.userId,
                    'text-bg-anyone': userId !== info.value.userId,
                }
            } else if (type === chatType.FILE || type === chatType.IMAGE) {
                return {
                    'border': true
                }
            }
        }



        const visibleSetting = ref(false)
        function onOpenSetting() {
            editInfo.nickname = info.value.nickname
            editInfo.avatarType = info.value.avatarType
            editInfo.avatar = (info.value.avatarType === 1 && info.value.avatarVersion !== 0) ? generateAvatarUrl(info.value.userId, info.value.avatarVersion) : ''
            visibleSetting.value = true
        }

        function onEditInfoAvatarTypeChange(e) {
            if (e.target.checked) {
                editInfo.avatarType = 1
            } else {
                editInfo.avatarType = 0
            }
        }

        function onUploadAvatar() {
            const input = document.createElement('input')
            input.onchange = function () {
                const url = URL.createObjectURL(input.files[0])
                editInfo.avatarFile = input.files[0]
                postUploadAvatar(editInfo.avatarFile).then(response => {
                    if (response.code === 20000) {
                        const version = response.data.version
                        editInfo.avatar = url
                        userStore.userInfo.avatarVersion = version
                    }
                })
            }
            input.setAttribute('type', 'file')
            input.click()
        }

        function onExit() {
            exit()
            goLogin()
        }


        function onEditSubmit() {
            putInfo(editInfo.nickname, editInfo.avatarType)
                .then(response => {
                    if (response.code === 20000) {
                        userStore.userInfo.nickname = editInfo.nickname
                        userStore.userInfo.avatarType = editInfo.avatarType
                        visibleSetting.value = false
                        editInfo.nickname = ''
                    }
                })
        }


        /**
         * 
         * @param {chatType} type 
         */
        function onUploadFile(type) {
            const input = document.createElement('input')
            input.onchange = function () {
                sendUploadMessage(selectUserId.value, input.files[0], type)
                nextTick(() => {
                    chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
                })
            }
            input.setAttribute('type', 'file')
            input.click()
        }

        function generateFileUrl(chatId, type) {
            return join(VUE_BASE, `/chat/upload?token=${getToken()}&friendId=${selectUserId.value}&chatId=${chatId}&type=${type}`)
        }

        function generateAvatarUrl(userId, avatarVersion) {
            return join(VUE_BASE, `/upload/avatar?id=${userId}&v=${avatarVersion}`)
        }

        const isDragenter = ref(false)
        function onDrop(e) {
            isDragenter.value = false
            const file = e.dataTransfer.files[0]
            if (file) {
                let type = chatType.FILE
                if (file.type.includes('image')) {
                    type = chatType.IMAGE
                }
                sendUploadMessage(selectUserId.value, file, type)
            }
        }

        function onDragenter() {
            isDragenter.value = true
            console.log('enter')
        }

        function onDragleave() {
            isDragenter.value = false
            console.log('leave')
        }


        function isDisplayTime(chatList, index) {
            if (chatList.length === 0) {
                return false
            }
            if (chatList.length === 1 || index === 0) {
                return true
            }
            const a = new Date(chatList[index].created_time).getTime()
            const b = new Date(chatList[index - 1].created_time).getTime()
            if (a - b >= 1000 * 60 * 5) {
                return true
            }
        }

        // 聊天记录
        const chatTabList = ["全部", '文件', '图片']
        const chatTabIndex = ref(0)
        const chatNoteVisible = ref(false)
        const chatNoteSearchInput = ref('')
        const chatNoteList = ref([])
        const chatNotePage = ref(1)
        const chatNotePageSize = ref(20)
        const chatNoteContentElement = ref(null)
        const chatNoteLoading = ref(false)
        let fetchEnd = false
        function fetchChatNoteList() {
            chatNoteLoading.value = true
            let type = undefined
            if (chatTabIndex.value === 0) {
                type = undefined
            } else if (chatTabIndex.value === 1) {
                type = chatType.FILE
            } else if (chatTabIndex.value === 2) {
                type = chatType.IMAGE
            }
            getChat(selectUserId.value, chatNotePage.value, chatNotePageSize.value, type)
                .then(res => {
                    if (res.code === 20000) {
                        if (res.data.list.length === 0) {
                            fetchEnd = true
                            return
                        }
                        chatNotePage.value++
                        const isFirstFetch = chatNoteList.value.length === 0
                        chatNoteList.value = res.data.list.map(item => {
                            return {
                                avatar: generateAvatarUrl(item.user_id),
                                nickname: userMap.value[item.user_id].nickname,
                                avatarType: userMap.value[item.user_id].avatarType,
                                avatarVersion: userMap.value[item.user_id].avatarVersion,
                                ...item
                            }
                        }).concat(chatNoteList.value)
                        // 第一次请求才需要到底部
                        if (isFirstFetch) {
                            nextTick(() => {
                                chatNoteContentElement.value.scrollTop = chatNoteContentElement.value.scrollHeight
                            })
                        }

                    }
                })
                .finally(() => {
                    chatNoteLoading.value = false
                })
        }
        function onOpenChatNote() {
            fetchEnd = false
            chatNoteList.value = []
            chatTabIndex.value = 0
            chatNotePage.value = 1
            fetchChatNoteList()
            chatNoteVisible.value = true
        }
        function onChatTabSelect(index) {
            fetchEnd = false
            chatNoteList.value = []
            chatNotePage.value = 1
            chatTabIndex.value = index
            fetchChatNoteList()
        }
        function onChatNoteScroll() {
            if (chatNoteLoading.value || fetchEnd) {
                return
            }
            if (chatNoteContentElement.value.scrollTop < 200) {
                fetchChatNoteList()
            }
        }

        // clipboard
        function onClipboard(item, e) {
            let timer = null
            return function () {
                const preClipElement = e.currentTarget.parentElement.parentElement.querySelector('.content-clip')
                const selection = window.getSelection()
                const range = document.createRange()
                range.selectNode(preClipElement)
                selection.removeAllRanges()
                selection.addRange(range)
                document.execCommand('copy')
                set(item, 'clipboardActive', true)
                if (Number.isInteger(timer)) {
                    clearTimeout(timer)
                    timer = null
                }
                timer = setTimeout(() => {
                    item.clipboardActive = false
                }, 4000)
            }
        }
        // 预览
        const textViewVisible = ref(false)
        const textViewContent = ref('')
        function onViewText(item) {
            textViewVisible.value = true
            textViewContent.value = item.content
        }

        return {
            fetchChatListLoading,

            relativeTimeFormat,
            isDisplayTime,

            info,
            editInfo,
            onEditInfoAvatarTypeChange,
            onUploadAvatar,
            onEditSubmit,
            friendList,
            friendListComputed,
            selectUserId,
            isSelectChat,
            onSelect,
            scrollSmooth,
            contentClass,
            visibleSetting,
            onOpenSetting,

            content,
            chatBoxElement,
            hasNewMsg,
            onScrollChat,
            onScrollChatToBottom,
            onSendMessage,
            onResetMessage,
            onUploadFile,
            chatType,
            generateFileUrl,
            generateAvatarUrl,

            onExit,

            onDrop,
            onDragenter,
            onDragleave,
            isDragenter,

            chatStore,

            isAlive,
            onReOpenWs,

            chatNoteVisible,
            chatNoteSearchInput,
            onOpenChatNote,
            chatTabIndex,
            onChatTabSelect,
            chatTabList,
            chatNoteList,
            chatNoteLoading,
            chatNoteContentElement,
            onChatNoteScroll,

            onClipboard,
            onViewText,
            textViewVisible,
            textViewContent,
        }
    }
})
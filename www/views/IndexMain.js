import { ref, computed, reactive, nextTick, defineComponent, set } from '../public/js/vue.esm.js'
import { join } from '../util/path.js'
import { putInfo } from '../api/auth.js'
import { exit, userStore } from '../store/user.js'
import { chatStore, getMessage, sendMessage, chatType, sendUploadMessage, fetchFriendList } from '../store/chat.js'
import { openWs, eventBus, STATUS, EVENT } from '../ws.js'
import { goLogin } from '../router.js'
import { notify } from '../util/notify.js'
import { VUE_BASE } from '../config.js'
import { getToken } from '../util/storage.js'
import { throttling } from '../util/throttling.js'
import { relativeTimeFormat } from '../util/timeFormat.js'
import UserCard from '../components/UserCard.js'

export default defineComponent({
    template: '#index-main',
    components: {
        UserCard,
    },
    setup() {
        openWs()
        const info = computed(() => userStore.userInfo)
        const editInfo = reactive({
            nickname: ''
        })

        const friendList = computed(() => chatStore.friendList)

        const friendListComputed = computed(() => {
            const onlineList = friendList.value.filter(item => item.isOnline)
            const offlineList = friendList.value.filter(item => !item.isOnline)
            return onlineList.concat(offlineList)
        })


        fetchFriendList()


        const hasNewMsg = ref(false)

        const onScrollChat = throttling(() => {
            if (!hasNewMsg.value) {
                return
            }
            if (chatBoxElement.value.scrollHeight - chatBoxElement.value.scrollTop < 1.5 * chatBoxElement.value.offsetHeight) {
                hasNewMsg.value = false
            }
        }, 400)

        function onScrollChatToBottom() {
            hasNewMsg.value = false
            chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
        }

        eventBus.$on(EVENT.CHAT, async function (response) {
            const data = response.data
            // 这是对方发送的信息，user_id是我friend的id
            const userId = data.user_id
            const friendId = data.friend_id
            if (response.code === 20000 && friendId === userStore.userInfo.userId) {
                // 更新好友栏最新消息
                const friendIndex = chatStore.friendList.findIndex(item => item.userId === userId)
                if (friendIndex !== -1) {
                    chatStore.friendList[friendIndex].content = data.content
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
                chatStore.userChat[userId].push(data)
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

        // 初次点击，或者切换会话
        function fetchChatList() {
            return getMessage(selectUserId.value, page, pageSize)
                .then(list => {
                    if (list) {
                        scrollSmooth.value = false
                        nextTick(() => {
                            chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
                            scrollSmooth.value = true
                        })
                    }
                })
        }
        const selectUserId = ref(null)

        const content = ref('')
        const chatBoxElement = ref(null) // Element

        async function onSendMessage() {
            const _content = content.value
            const _selectUserId = selectUserId.value
            if (!_content) {
                return
            }
            await sendMessage(_selectUserId, _content)
            // 更新好友栏最新消息
            const friendIndex = chatStore.friendList.findIndex(item => item.userId === _selectUserId)
            if (friendIndex) {
                chatStore.friendList[friendIndex].content = _content
            }
            chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
            content.value = ''
        }

        function onResetMessage() {
            content.value = ''
        }


        function onSelect(id) {
            if (selectUserId.value === id) {
                return
            }
            page = 1
            selectUserId.value = id
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
            visibleSetting.value = true
        }

        function onExit() {
            exit()
            goLogin()
        }


        function onEditSubmit() {
            putInfo(editInfo.nickname)
                .then(response => {
                    if (response.code === 20000) {
                        userStore.userInfo.nickname = editInfo.nickname
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
            }
            input.setAttribute('type', 'file')
            input.click()
        }

        function generateFileUrl(chatId, type) {
            return join(VUE_BASE, `/chat/upload?token=${getToken()}&friendId=${selectUserId.value}&chatId=${chatId}&type=${type}`)
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

        return {
            relativeTimeFormat,
            isDisplayTime,

            info,
            editInfo,
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

            onExit,

            onDrop,
            onDragenter,
            onDragleave,
            isDragenter,

            chatStore,
        }
    }
})
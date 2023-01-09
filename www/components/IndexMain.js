import { ref, computed, reactive, nextTick, defineComponent, set } from '../public/js/vue.esm.js'
import { getAllUserNotMyself, putInfo } from '../api/auth.js'
import { exit, userStore } from '../store/user.js'
import { chatStore, getMessage, sendMessage } from '../store/chat.js'
import { openWs, eventBus, STATUS, EVENT } from '../ws.js'
import { goLogin } from '../router.js'
import { notify } from '../util/notify.js'

export default defineComponent({
    template: '#index-main',
    setup() {
        openWs()
        const info = computed(() => userStore.userInfo)
        const editInfo = reactive({
            nickname: ''
        })

        const friendList = ref([])

        function fetchFriendList() {
            return getAllUserNotMyself()
                .then(response => {
                    if (response.code === 20000) {
                        friendList.value = response.data.userList
                    }
                })
        }

        fetchFriendList()

        eventBus.$on(EVENT.CHAT, async function (response) {
            const data = response.data
            // 这是对方发送的信息，user_id是我friend的id
            const userId = data.user_id
            const friendId = data.friend_id
            if (response.code === 20000 && friendId === userStore.userInfo.userId) {
                // 对方可能是新用户
                if (!chatStore.userChat[userId]) {
                    set(chatStore.userChat, userId, [])
                    // 刷新一下好友列表
                    await fetchFriendList()
                }
                chatStore.userChat[userId].push(data)
                const friendNickname = (friendList.value.find(user => user.userId === userId) || { nickname: '未命名' }).nickname
                notify(`${friendNickname}，发送消息。`)
            }
        })

        eventBus.$on(EVENT.NOTIFY_STATE_CHANGE, response => {
            const { userId, status } = response.data
            const friend = friendList.value.find(item => item.userId === userId)
            console.log(friend)
            if (friend) {
                friend.isOnline = status === STATUS.ONLINE ? true : false
            }
        })

        const nicknameMap = computed(() => {
            return friendList.value.concat(info.value).reduce((a, b) => {
                a[b.userId] = b.nickname
                return a
            }, {})
        })


        const page = 1
        const pageSize = 20
        const scrollSmooth = ref(true)

        function fetchChatList() {
            getMessage(selectUserId.value, page, pageSize)
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

        const chatListComputed = computed(() => {
            if (!selectUserId.value) {
                return []
            }
            if (!chatStore.userChat[selectUserId.value]) {
                return []
            }
            nextTick(() => {
                chatBoxElement.value.scrollTop = chatBoxElement.value.scrollHeight
            })
            return chatStore.userChat[selectUserId.value].map(item => ({
                nickname: nicknameMap.value[item.user_id],
                ...item,
            }))
        })

        const content = ref('')
        const chatBoxElement = ref(null) // Element

        function onSendMessage() {
            const _content = content.value
            if (!_content) {
                return
            }
            sendMessage(selectUserId.value, _content)
            content.value = ''
        }

        function onResetMessage() {
            content.value = ''
        }

        const selectUserId = ref(null)
        function onSelect(id) {
            selectUserId.value = id
            fetchChatList()
        }
        const isSelectChat = computed(() => {
            return selectUserId.value !== null
        })
        function selectStyle(id) {
            if (selectUserId.value === id) {
                return {
                    backgroundColor: 'rgba(208,215,222,.32)'
                }
            }
            return {}
        }



        const contentClass = function (userId) {
            return {
                'bg-info': userId === info.value.userId,
                'bg-body-secondary': userId !== info.value.userId,
                'text-light': userId === info.value.userId,
                'text-black': userId !== info.value.userId,
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


        return {

            info,
            editInfo,
            onEditSubmit,
            friendList,
            nicknameMap,
            chatListComputed,
            selectUserId,
            selectStyle,
            isSelectChat,
            onSelect,
            scrollSmooth,
            contentClass,
            visibleSetting,
            onOpenSetting,

            content,
            chatBoxElement,
            onSendMessage,
            onResetMessage,

            onExit,
        }
    }
})
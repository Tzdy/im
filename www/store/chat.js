import { reactive, set, computed } from '../public/js/vue.esm.js'
import { postChat, getChat, postChatUpload } from '../api/chat.js'
import { getAllUserNotMyself } from '../api/auth.js'
import { userStore } from './user.js'

export const chatStore = reactive({
    friendList: [],
    userChat: {}
})

const nicknameMap = computed(() => {
    return chatStore.friendList.concat(userStore.userInfo).reduce((a, b) => {
        a[b.userId] = b.nickname
        return a
    }, {})
})

export function fetchFriendList() {
    return getAllUserNotMyself()
        .then(async response => {
            if (response.code === 20000) {
                chatStore.friendList = response.data.userList
            }
        })
}

export function getMessage(friendId, page, pageSize) {
    if (chatStore.userChat[friendId]) {
        chatStore.userChat[friendId].forEach(item => {
            item.__load = false
        })
        return Promise.resolve(chatStore.userChat[friendId])
    } else {
        return getChat(friendId, page, pageSize)
            .then(response => {
                if (response.code === 20000) {
                    set(chatStore.userChat, friendId, response.data.list.map(item => ({
                        nickname: nicknameMap.value[item.user_id],
                        __load: false,
                        ...item
                    })))
                }
                return Promise.resolve(chatStore.userChat[friendId])
            })
    }
}

export const chatType = {
    TEXT: 0,
    IMAGE: 1,
    FILE: 2,
}

export function sendMessage(friendId, content, type = chatType.TEXT) {
    return postChat(friendId, content)
        .then(response => {
            if (response.code === 20000) {
                // 更新好友栏最新消息
                const friendIndex = chatStore.friendList.findIndex(item => item.userId === friendId)
                if (friendIndex !== -1) {
                    chatStore.friendList[friendIndex].content = content
                }
                chatStore.userChat[friendId].push({
                    id: response.data.chatId,
                    user_id: userStore.userInfo.userId,
                    friend_id: friendId,
                    content: content,
                    type,
                    "created_time": Date.now(),
                })
            }
        })
}

export function sendUploadMessage(friendId, file, type = chatType.IMAGE) {
    const item = {
        id: undefined,
        user_id: userStore.userInfo.userId,
        friend_id: friendId,
        content: file.name,
        type,
        "created_time": Date.now(),
        loaded: 0
    }
    chatStore.userChat[friendId].push(item)
    function loadCallback(e) {
        item.loaded = `${parseInt((e.loaded / e.total) * 100, 0)}%`
    }
    return postChatUpload(type, friendId, file, loadCallback)
        .then(response => {
            if (response.code === 20000) {
                item.id = response.data.chatId
                // 上传图片的时候可以继续聊天
                if (chatStore.userChat[friendId][chatStore.userChat[friendId].length - 1].id !== item.id) {
                    const oldIndex = chatStore.userChat[friendId].findIndex(it => it.id === item.id)
                    chatStore.userChat[friendId].splice(oldIndex, 1)
                    chatStore.userChat[friendId].push(item)
                }
                // 更新好友栏最新消息
                const friendIndex = chatStore.friendList.findIndex(item => item.userId === friendId)
                if (friendIndex !== -1) {
                    chatStore.friendList[friendIndex].content = file.name
                }
            }
        })
}
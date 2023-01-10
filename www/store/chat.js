import { reactive, set } from '../public/js/vue.esm.js'
import { postChat, getChat, postChatUpload } from '../api/chat.js'
import { userStore } from './user.js'

export const chatStore = reactive({
    userChat: {}
})

export function getMessage(friendId, page, pageSize) {
    if (chatStore.userChat[friendId]) {
        return Promise.resolve(chatStore.userChat[friendId])
    } else {
        return getChat(friendId, page, pageSize)
            .then(response => {
                if (response.code === 20000) {
                    set(chatStore.userChat, friendId, response.data.list)
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
    return postChatUpload(type, friendId, file)
        .then(response => {
            if (response.code === 20000) {
                chatStore.userChat[friendId].push({
                    id: response.data.chatId,
                    user_id: userStore.userInfo.userId,
                    friend_id: friendId,
                    content: '',
                    type,
                    "created_time": Date.now(),
                })
            }
        })
}
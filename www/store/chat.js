import { reactive, set } from '../public/js/vue.esm.js'
import { postChat, getChat } from '../api/chat.js'
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

export function sendMessage(friendId, content) {
    return postChat(friendId, content)
        .then(response => {
            if (response.code === 20000) {
                chatStore.userChat[friendId].push({
                    id: response.data.id,
                    user_id: userStore.userInfo.userId,
                    friend_id: friendId,
                    content: content,
                    "created_time": Date.now(),
                })
            }
        })
}
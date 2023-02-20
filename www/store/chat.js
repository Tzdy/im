import { reactive, set, computed } from '../public/js/vue.esm.js'
import { postChat, getChat, postChatUpload } from '../api/chat.js'
import { getAllUserNotMyself } from '../api/auth.js'
import { userStore } from './user.js'
import { getLatestChatTime, setLatestChatTime } from '../util/storage.js'
export const chatStore = reactive({
    friendList: [],
    latestChatTime: {},
    userChat: {},
})

export const userMap = computed(() => {
    return chatStore.friendList.concat(userStore.userInfo).reduce((a, b) => {
        a[b.userId] = b
        return a
    }, {})
})

export function setLatestChatTimeOne(friendId, time) {
    const timeNumber = new Date(time).getTime()
    set(chatStore.latestChatTime, friendId, timeNumber)
    setLatestChatTime(userStore.userInfo.userId, chatStore.latestChatTime)
}

export function fetchFriendList() {
    return getAllUserNotMyself()
        .then(async response => {
            if (response.code === 20000) {
                chatStore.latestChatTime = getLatestChatTime(userStore.userInfo.userId)
                chatStore.friendList = response.data.userList
                chatStore.friendList.forEach(item => {
                    if (item.contentCreatedTime) {
                        const timeNumber = new Date(item.contentCreatedTime).getTime()
                        // 没有赋值的初始化，赋值的只有用户点击了，才能覆盖。
                        if (chatStore.latestChatTime[item.userId] === undefined) {
                            set(chatStore.latestChatTime, item.userId, timeNumber)
                        }
                    } else {
                        // 没有会话的赋0，不然任何数字 > undefined都是false
                        if (chatStore.latestChatTime[item.userId] === undefined) {
                            set(chatStore.latestChatTime, item.userId, 0)
                        }
                    }
                })
                setLatestChatTime(userStore.userInfo.userId, chatStore.latestChatTime)
            }
        })
}

export function initMessage(friendId, page, pageSize) {
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
                        nickname: userMap.value[item.user_id].nickname,
                        avatarType: userMap.value[item.user_id].avatarType,
                        avatarVersion: userMap.value[item.user_id].avatarVersion,
                        __load: false,
                        ...item
                    })))
                }
                return Promise.resolve(chatStore.userChat[friendId])
            })
    }
}
export function getMessage(friendId, page, pageSize) {
    return getChat(friendId, page, pageSize)
        .then(response => {
            if (response.code === 20000) {
                const list = response.data.list.map(item => ({
                    nickname: userMap.value[item.user_id].nickname,
                    avatarType: userMap.value[item.user_id].avatarType,
                    avatarVersion: userMap.value[item.user_id].avatarVersion,
                    __load: false,
                    ...item
                }))
                chatStore.userChat[friendId] = list.concat(chatStore.userChat[friendId])
                return Promise.resolve(list)
            }
            return Promise.resolve([])
        })
}

// 切换到其他friend的会话时，要清理当前会话
export function sliceMessage(friendId, size) {
    if (chatStore.userChat[friendId] instanceof Array) {
        const chatList = chatStore.userChat[friendId]
        chatStore.userChat[friendId] = chatList.slice(chatList.length - size < 0 ? 0 : chatList.length - size, chatList.length)
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
                    chatStore.friendList[friendIndex].contentCreatedTime = response.data.createdTime
                }
                const item = {
                    id: response.data.chatId,
                    user_id: userStore.userInfo.userId,
                    friend_id: friendId,
                    content: content,
                    type,
                    "created_time": response.data.createdTime,
                }
                chatStore.userChat[friendId].push({
                    nickname: userMap.value[item.user_id].nickname,
                    avatarType: userMap.value[item.user_id].avatarType,
                    avatarVersion: userMap.value[item.user_id].avatarVersion,
                    __load: false,
                    ...item
                })
                setLatestChatTimeOne(friendId, response.data.createdTime)
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
        loaded: 0,
        nickname: userMap.value[userStore.userInfo.userId].nickname,
        avatarType: userMap.value[userStore.userInfo.userId].avatarType,
        avatarVersion: userMap.value[userStore.userInfo.userId].avatarVersion,
        __load: false,
    }
    chatStore.userChat[friendId].push(item)
    function loadCallback(e) {
        item.loaded = `${parseInt((e.loaded / e.total) * 100, 0)}%`
    }
    return postChatUpload(type, friendId, file, loadCallback)
        .then(response => {
            if (response.code === 20000) {
                item.id = response.data.chatId
                item.created_time = response.data.createdTime
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
                    chatStore.friendList[friendIndex].contentCreatedTime = response.data.createdTime
                }
                setLatestChatTimeOne(friendId, response.data.createdTime)
            }
        })
}
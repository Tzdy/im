const TOKEN_KEY = 'token'

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
    return localStorage.removeItem(TOKEN_KEY)
}

const CHAT_TIME_PREFIX = 'chat'

export function setLatestChatTime(userId, obj = {}) {
    const key = `${CHAT_TIME_PREFIX}-${userId}`
    localStorage.setItem(key, JSON.stringify(obj))
}

export function getLatestChatTime(userId) {
    const key = `${CHAT_TIME_PREFIX}-${userId}`
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : {}
}
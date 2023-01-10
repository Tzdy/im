import request from '../util/request.js'

export function getChat(friendId, page, pageSize) {
    return request({
        url: '/chat',
        method: 'get',
        params: {
            friendId,
            page,
            pageSize
        }
    })
}

export function postChat(friendId, content) {
    return request({
        url: '/chat',
        method: 'post',
        data: {
            friendId,
            content,
        }
    })
}

export function postChatUpload(type, friendId, file) {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('friendId', friendId)
    formData.append('file', file)

    return request({
        url: '/chat/upload',
        method: 'post',
        data: formData,
    })
}
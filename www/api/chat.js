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

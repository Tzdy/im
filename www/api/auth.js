import request from '../util/request.js'

export function login(username, password) {
    return request({
        url: '/login',
        method: 'post',
        data: {
            username,
            password,
        }
    })
}

export function register(nickname, username, password) {
    return request({
        url: '/register',
        method: 'post',
        data: {
            nickname,
            username,
            password,
        }
    })
}

export function info() {
    return request({
        url: '/info',
        method: 'get',
    })
}

export function putInfo(nickname) {
    return request({
        url: '/info',
        method: 'put',
        data: {
            nickname,
        }
    })
}

export function getAllUserNotMyself() {
    return request({
        url: '/user/all',
        method: 'get',
    })
}

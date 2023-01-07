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
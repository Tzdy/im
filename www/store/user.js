import { reactive } from '../public/js/vue.esm.js'
import { login as loginApi, register as registerApi, info as infoApi } from '../api/auth.js'
import { removeToken, setToken } from '../util/storage.js'
import { closeWs } from '../ws.js'

export const userStore = reactive({
    userInfo: {
        userId: -1,
        nickname: '',
    }
})

export function login(username, password) {
    return loginApi(username, password)
        .then(response => {
            const data = response.data
            if (response.code === 20000) {
                setToken(data.token)

                return Promise.resolve(response)
            } else {
                return Promise.reject(response)
            }
        })
}

export function register(nickname, username, password) {
    return registerApi(nickname, username, password)
}

export function info() {
    return infoApi()
        .then(response => {
            if (response.code === 20000) {
                userStore.userInfo.userId = response.data.info.id
                userStore.userInfo.nickname = response.data.info.nickname
            }
        })
}

export function exit() {
    userStore.userInfo = {
        userId: -1,
        nickname: '',
    }
    removeToken()
    closeWs()
}
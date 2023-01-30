import { VUE_WS_URL } from "./config.js"
import Vue from "./public/js/vue.esm.js"
import { getToken } from "./util/storage.js"
import { userStore } from './store/user.js'

/**
 * @type { WebSocket | null }
 */
let ws = null

const PING_TIME = 1000 * 60 * 5
const TIMEOUT = 1000 * 10
const RE_OPEN_TIME = 1000 * 60 * 5

let timer = -1
let timeouter = -1
export const eventBus = new Vue()
export const TYPE = {
    AUTHORIZATION: 0,
    CHAT: 1,
    NOTIFY_STATE_CHANGE: 2, // 上下线通知
    PING: 3,
    PONG: 4,
}

export const EVENT = {
    AUTHORIZATION: 'AUTHORIZATION',
    CHAT: 'CHAT',
    NOTIFY_STATE_CHANGE: 'NOTIFY_STATE_CHANGE',
    PONG: "PONG",
}

export const STATUS = {
    ONLINE: 0,
    OFFLINE: 1,
}

export function openWs() {
    const token = getToken()
    return new Promise((resolve, reject) => {
        ws = new WebSocket(VUE_WS_URL)
        ws.onerror = function () {
            reject()
        }
        // 只有第一次连上了，才会自动重连。
        ws.onopen = function () {
            userStore.isAlive = true
            ws.send(JSON.stringify({
                type: TYPE.AUTHORIZATION,
                data: {
                    token,
                }
            }))
            clearInterval(timer)
            timer = setInterval(() => {
                ws.send(JSON.stringify({
                    type: TYPE.PING,
                }))
                let isAlive = false
                function judgeFn(response) {
                    console.log('judge')
                    isAlive = true
                }
                eventBus.$once(EVENT.PONG, judgeFn)
                timeouter = setTimeout(() => {
                    eventBus.$off(EVENT.PONG, judgeFn)
                    if (!isAlive) {
                        clearInterval(timer)
                        timer = setInterval(() => {
                            openWs()
                        }, RE_OPEN_TIME)
                    }
                }, TIMEOUT)
            }, PING_TIME)
            resolve(ws)
        }
        ws.onmessage = function (e) {
            const response = JSON.parse(e.data)
            Object.keys(TYPE).forEach(key => {
                if (TYPE[key] === response.type) {
                    eventBus.$emit(EVENT[key], response)
                }
            })
        }
        ws.onclose = function () {
            userStore.isAlive = false
        }
    })
}

function clearState() {
    clearInterval(timer)
    clearTimeout(timeouter)
    eventBus.$off(EVENT.PONG)
}

export function closeWs() {
    if (ws) {
        clearState()
        ws.close()
        ws = null
    }
}

export function getWs() {
    return ws
}


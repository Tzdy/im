import { VUE_WS_URL } from "./config.js"
import Vue from "./public/js/vue.esm.js"
import { getToken } from "./util/storage.js"

/**
 * @type { WebSocket | null }
 */
let ws = null

const PING_TIME = 1000 * 60 * 10
const TIMEOUT = 1000 * 10
const RE_OPEN_TIME = 1000 * 60

let timer = -1

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
    return new Promise(resolve => {
        ws = new WebSocket(VUE_WS_URL)
        ws.onopen = function () {
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
                    eventBus.$off(EVENT.PONG, judgeFn)
                }
                eventBus.$on(EVENT.PONG, judgeFn)
                setTimeout(() => {
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
    })
}

export function closeWs() {
    if (ws) {
        ws.close()
        ws = null
    }
}

export function getWs() {
    return ws
}


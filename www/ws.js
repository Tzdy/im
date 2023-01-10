import { WS_URL } from "./config.js"
import Vue from "./public/js/vue.esm.js"
import { getToken } from "./util/storage.js"

/**
 * @type { WebSocket | null }
 */
let ws = null

export const eventBus = new Vue()
export const TYPE = {
    AUTHORIZATION: 0,
    CHAT: 1,
    NOTIFY_STATE_CHANGE: 2, // 上下线通知
}

export const EVENT = {
    AUTHORIZATION: 'AUTHORIZATION',
    CHAT: 'CHAT',
    NOTIFY_STATE_CHANGE: 'NOTIFY_STATE_CHANGE'
}

export const STATUS = {
    ONLINE: 0,
    OFFLINE: 1,
}

export function openWs() {
    const token = getToken()
    return new Promise(resolve => {
        ws = new WebSocket(WS_URL)
        ws.onopen = function () {
            ws.send(JSON.stringify({
                type: TYPE.AUTHORIZATION,
                data: {
                    token,
                }
            }))
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


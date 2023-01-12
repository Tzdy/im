import { WebSocketServer } from 'ws'
import { verify } from '../util/jwt.mjs'

export const TYPE = {
    AUTHORIZATION: 0,
    CHAT: 1,
    NOTIFY_STATE_CHANGE: 2, // 上下线通知
    PING: 3,
    PONG: 4,
}

export const STATUS = {
    ONLINE: 0,
    OFFLINE: 1,
}

/**
 * @type { WebSocketServer | null }
 */
export let wss = null

export function wsInit(server) {

    wss = new WebSocketServer({
        path: '/ws',
        server
    })
    function heartbeat() {
        this.isAlive = true;
    }

    wss.on('error', err => {
        console.log('wss', err)
    })

    wss.on('connection', function connection(ws) {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
        ws.on('error', err => {
            console.log(ws.userId, err)
        })
        ws.on('message', async function message(msg) {
            msg = msg.toString('utf-8')
            let json = {
                type: -1,
                data: {}
            }
            try {
                json = JSON.parse(msg)
            } catch {
                return;
            }
            const { data, type } = json

            if (type === TYPE.AUTHORIZATION) {
                const token = data.token
                let jwtData = {
                    payload: {
                        id: -1
                    }
                }
                try {
                    jwtData = verify(token)
                } catch {
                    return;
                }
                const { id: userId } = jwtData.payload
                ws.userId = userId

                Array.from(wss.clients).forEach(item => {
                    if (item.userId !== userId) {
                        item.send(JSON.stringify({
                            type: TYPE.NOTIFY_STATE_CHANGE,
                            data: {
                                status: STATUS.ONLINE,
                                userId,
                            },
                        }))
                    }
                })
            } else if (type === TYPE.PING) {
                const userId = ws.userId
                if (userId) {
                    ws.send(JSON.stringify({
                        type: TYPE.PONG
                    }))
                }
            }
        });

        ws.on('close', () => {
            Array.from(wss.clients).forEach(item => {
                if (item.userId !== ws.userId) {
                    item.send(JSON.stringify({
                        type: TYPE.NOTIFY_STATE_CHANGE,
                        data: {
                            status: STATUS.OFFLINE,
                            userId: ws.userId,
                        },
                    }))
                }
            })
        })

    })

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                return ws.terminate()
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
}


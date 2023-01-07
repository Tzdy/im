import { WebSocketServer } from 'ws'
import { verify } from '../util/jwt.mjs'

export const TYPE = {
    AUTHORIZATION: 0
}

export let wss = null

export function wsInit(server) {

    wss = new WebSocketServer({
        path: '/ws',
        server
    })
    function heartbeat() {
        this.isAlive = true;
    }

    wss.on('connection', function connection(ws) {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
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
            }
        });
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


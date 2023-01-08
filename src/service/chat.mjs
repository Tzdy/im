import { createOneChat, findChatByUserId } from "../model/chat.mjs";
import { TYPE, wss } from "../ws/index.mjs";

export async function postChat(userId, friendId, content) {
    const item = await createOneChat(userId, friendId, content)
    const { insertId } = item
    const clients = Array.from(wss.clients)
    const friend = clients.find(item => item.userId === friendId)
    // 如果在线
    if (friend) {
        friend.send(JSON.stringify({
            type: TYPE.CHAT,
            code: 20000,
            data: {
                id: insertId,
                user_id: userId,
                friend_id: friendId,
                content,
                created_time: Date.now(),
            }
        }))
    }
    return {
        code: 20000,
        data: {
            chatId: insertId,
        }
    }
}
export async function getChat(userId, friendId, page, pageSize) {
    return {
        code: 20000,
        data: {
            list: (await findChatByUserId(userId, friendId, page, pageSize)).reverse()
        }
    }
}
import { chatType, createOneChat, createOneFileChat, createOneImageChat, findChatByUserId } from "../model/chat.mjs";
import { startTransaction } from "../model/index.mjs";
import { createOneUpload } from "../model/upload.mjs";
import { HttpOKException } from "../util/exception.mjs";
import { TYPE, wss } from "../ws/index.mjs";

function notifyChatToFriend(chatId, userId, friendId, content, type) {
    const clients = Array.from(wss.clients)
    const friend = clients.find(item => item.userId === friendId)
    // 如果在线
    if (friend) {
        friend.send(JSON.stringify({
            type: TYPE.CHAT,
            code: 20000,
            data: {
                id: chatId,
                user_id: userId,
                friend_id: friendId,
                content,
                type,
                created_time: Date.now(),
            }
        }))
    }
}

export async function postChat(userId, friendId, content) {
    const item = await createOneChat(userId, friendId, content)
    const { insertId } = item
    notifyChatToFriend(insertId, userId, friendId, content, chatType.TEXT)
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

export async function postChatUpload(userId, friendId, uuid, originFilename, mimetype, type) {
    await startTransaction(async (connection) => {
        let item = null
        let chatId = null
        if (type === chatType.IMAGE) {
            item = await createOneImageChat(userId, friendId, connection)
        } else if (type === chatType.FILE) {
            item = await createOneFileChat(userId, friendId, connection)
        } else {
            throw new HttpOKException(20001, '上传类型CODE错误')
        }
        chatId = item.insertId
        await createOneUpload(uuid, chatId, originFilename, mimetype, connection)
        notifyChatToFriend(chatId, userId, friendId, '', type)
    })
    return {
        code: 20000
    }
}
import { chatType, createOneChat, findChatByUserId } from "../model/chat.mjs";
import { startTransaction } from "../model/index.mjs";
import { createOneUpload, findOneUpload } from "../model/upload.mjs";
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
    const item = await createOneChat(userId, friendId, content, chatType.TEXT)
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
    let item = null
    let chatId = null
    await startTransaction(async (connection) => {
        if (type === chatType.IMAGE) {
            item = await createOneChat(userId, friendId, originFilename, chatType.IMAGE, connection)
        } else if (type === chatType.FILE) {
            item = await createOneChat(userId, friendId, originFilename, chatType.FILE, connection)
        } else {
            throw new HttpOKException(20001, '上传类型CODE错误')
        }
        chatId = item.insertId
        await createOneUpload(uuid, userId, friendId, chatId, originFilename, mimetype, connection)
        notifyChatToFriend(chatId, userId, friendId, originFilename, type)
    })
    return {
        code: 20000,
        data: {
            chatId,
        }
    }
}

export async function getChatUpload(userId, friendId, chatId) {
    return (await findOneUpload(userId, friendId, chatId))[0]
}
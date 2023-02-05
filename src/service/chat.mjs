import { chatType, createOneChat, findChatByUserId, findChatNotPage, findChatNotPageCase1 } from "../model/chat.mjs";
import { startTransaction } from "../model/index.mjs";
import { createOneUpload, findOneUpload } from "../model/upload.mjs";
import { HttpOKException } from "../util/exception.mjs";
import { TYPE, wss } from "../ws/index.mjs";

function notifyChatToFriend(chatId, userId, friendId, content, type, createdTime) {
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
                created_time: createdTime,
            }
        }))
    }
}

export async function postChat(userId, friendId, content) {
    // 数据库中Date不精确到毫秒。
    const createdTime = new Date(new Date().toUTCString())
    const item = await createOneChat(userId, friendId, content, chatType.TEXT, createdTime)
    const { insertId } = item
    notifyChatToFriend(insertId, userId, friendId, content, chatType.TEXT, createdTime)
    return {
        code: 20000,
        data: {
            chatId: insertId,
            createdTime,
        }
    }
}
export async function getChat(userId, friendId, page, pageSize, type) {
    let list = []
    if (Number.isInteger(page) && Number.isInteger(pageSize)) {
        list = (await findChatByUserId(userId, friendId, page, pageSize)).reverse()
    } else if (Number.isInteger(type)) {
        list = await findChatNotPage(userId, friendId, type)
    } else if (type === null) {
        list = await findChatNotPageCase1(userId, friendId)
    }
    return {
        code: 20000,
        data: {
            list,
        }
    }
}

export async function postChatUpload(userId, friendId, uuid, originFilename, mimetype, type) {
    let item = null
    let chatId = null
    const createdTime = new Date(new Date().toUTCString())
    await startTransaction(async (connection) => {
        if (type === chatType.IMAGE) {
            item = await createOneChat(userId, friendId, originFilename, chatType.IMAGE, createdTime, connection)
        } else if (type === chatType.FILE) {
            item = await createOneChat(userId, friendId, originFilename, chatType.FILE, createdTime, connection)
        } else {
            throw new HttpOKException(20001, '上传类型CODE错误')
        }
        chatId = item.insertId
        await createOneUpload(uuid, userId, friendId, chatId, originFilename, mimetype, createdTime, connection)
        notifyChatToFriend(chatId, userId, friendId, originFilename, type, createdTime)
    })
    return {
        code: 20000,
        data: {
            chatId,
            createdTime,
        }
    }
}

export async function getChatUpload(userId, friendId, chatId) {
    return (await findOneUpload(userId, friendId, chatId))[0]
}
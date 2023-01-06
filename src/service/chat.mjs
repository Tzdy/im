import { createOneChat, findChatByUserId } from "../model/chat.mjs";

export async function postChat(userId, friendId, content) {
    const item = await createOneChat(userId, friendId, content)
    const { insertId } = item
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
            list: await findChatByUserId(userId, friendId, page, pageSize)
        }
    }
}
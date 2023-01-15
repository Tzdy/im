import { HttpException } from "@tsdy/express-plugin-exception";
import { createOneUser, findOneUserByUsername, findOneUserById, findUserNotUserId, updateOneById } from "../model/user.mjs";
import { HttpOKException } from "../util/exception.mjs";
import { wss } from "../ws/index.mjs";
import { sign } from "../util/jwt.mjs";
import { findLastChatByUserId } from "../model/user_chat.mjs";

export async function login(username, password) {
    const user = (await findOneUserByUsername(username))[0]
    console.log(user)
    if (!user) {
        throw new HttpOKException(10000, '用户不存在')
    }
    if (user.password !== password) {
        throw new HttpOKException(10001, '密码错误')
    }
    return {
        code: 20000,
        data: {
            token: sign({
                id: user.id,
            })
        },
        message: 'ok'
    }
}

export async function register(nickname, username, password) {
    try {
        await createOneUser(nickname, username, password)
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new HttpOKException(10001, '用户名重复')
        }
        throw new HttpException(500, err)
    }
    return {
        code: 20000,
        message: 'ok'
    }
}
export async function info(userId) {
    return {
        code: 20000,
        data: {
            info: (await findOneUserById(userId))[0]
        }
    }
}

export async function putInfo(userId, nickname) {
    await updateOneById(userId, nickname)
    return {
        code: 20000
    }
}

export async function listAllUserNotMyself(userId) {
    let list = await findUserNotUserId(userId)
    const userLastChatList = await findLastChatByUserId(userId)
    const userMap = {}
    userLastChatList.forEach(item => {
        if (!userMap[item.user_id]) {
            userMap[item.user_id] = item
        }
        if (!userMap[item.friend_id]) {
            userMap[item.friend_id] = item
        }
    })
    const clients = Array.from(wss.clients)
    list = list.map(user => {
        const { id, ...item } = user
        return {
            isOnline: !!clients.find(ws => ws.userId === user.id),
            userId: user.id,
            content: userMap[user.id].content,
            ...item,
        }
    })
    return {
        code: 20000,
        data: {
            userList: list
        }
    }
}
import { HttpException } from "@tsdy/express-plugin-exception";
import { createOneUser, findOneUserByUsername, findOneUserById } from "../model/user.mjs";
import { HttpOKException } from "../util/exception.mjs";
import { sign } from "../util/jwt.mjs";

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

export async function register(username, password) {
    try {
        await createOneUser(username, password)
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
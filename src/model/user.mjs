import { query } from "./index.mjs";

const TABLE_NAME = 'user'

export function findOneUserByUsername(username) {
    return query(`SELECT id,username,password FROM ${TABLE_NAME} WHERE username=? LIMIT 1`, [username])
}

export function findOneUserById(userId) {
    return query(`SELECT id,username,nickname FROM ${TABLE_NAME} WHERE id=? LIMIT 1`, [userId])
}

export function createOneUser(nickname, username, password) {
    return query(`INSERT INTO ${TABLE_NAME}(username, password, nickname) VALUES(?, ?, ?)`, [username, password, nickname])
}


export function findUserNotUserId(userId) {
    return query(`SELECT id,username,nickname FROM ${TABLE_NAME} WHERE id!=?`, [userId])
}

export function updateOneById(userId, nickname) {
    const hasUpdate = !!(nickname)
    if (!hasUpdate) {
        return Promise.resolve({})
    }
    const map = { nickname }
    return query(`UPDATE ${TABLE_NAME} SET ${Object.keys(map).map(key => `${key}=?`).join(',')} WHERE id=?`, [...Object.values(map), userId])
}
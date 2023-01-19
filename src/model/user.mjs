import { assign } from "../util/assign.mjs";
import { query } from "./index.mjs";

const TABLE_NAME = 'user'

export function findOneUserByUsername(username) {
    return query(`SELECT id,username,password FROM ${TABLE_NAME} WHERE username=? LIMIT 1`, [username])
}

export function findOneUserById(userId) {
    return query(`SELECT id,username,nickname,avatar_version,avatar_type FROM ${TABLE_NAME} WHERE id=? LIMIT 1`, [userId])
}

export function createOneUser(nickname, username, password) {
    return query(`INSERT INTO ${TABLE_NAME}(username, password, nickname) VALUES(?, ?, ?)`, [username, password, nickname])
}


export function findUserNotUserId(userId) {
    return query(`SELECT id,username,nickname,avatar_version,avatar_type FROM ${TABLE_NAME} WHERE id!=?`, [userId])
}

export function updateOneById(userId, nickname, avatar_type) {
    const hasUpdate = !!(nickname) || !(avatar_type === undefined || avatar_type === null)
    if (!hasUpdate) {
        return Promise.resolve({})
    }
    const map = {}
    assign(map, 'nickname', nickname)
    assign(map, 'avatar_type', avatar_type)
    return query(`UPDATE ${TABLE_NAME} SET ${Object.keys(map).map(key => `${key}=?`).join(',')} WHERE id=?`, [...Object.keys(map).map(key => map[key]), userId])
}

export const avatarType = {
    TEXT: 0,
    IMAGE: 1,
}

export function updateOneAvatarTypeById(userId, avatar_type) {
    return query(`UPDATE ${TABLE_NAME} SET avatar_type=? WHERE id=?`, [avatar_type, userId])
}

export function updateOneAvatarVersionById(userId, avatar_version) {
    return query(`UPDATE ${TABLE_NAME} SET avatar_version=? WHERE id=?`, [avatar_version, userId])
}
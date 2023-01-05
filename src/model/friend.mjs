import { query } from "./index.mjs";

const TABLE_NAME = 'user_friend'

export function createDirectOneFriend(myselfId, otherId) {
    return query(`INSERT INTO ${TABLE_NAME}(user_id, friend_id) VALUES(?, ?),(?, ?)`, [myselfId, otherId, otherId, myselfId])
}

export function findFriend(userId) {
    return query(`SELECT u.id,u.username FROM ${TABLE_NAME} uf LEFT JOIN user u ON uf.friend_id=u.id WHERE uf.user_id=?`, [userId])
}
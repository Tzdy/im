import { query } from "./index.mjs";

const TABLE_NAME = 'user_friend_chat'
export const chatType = {
    TEXT: 0,
    IMAGE: 1,
    FILE: 2,
}

export function createOneChat(userId, friendId, content, type, date, connection) {
    return query(`INSERT INTO ${TABLE_NAME}(user_id, friend_id, content, type, created_time) VALUES(?, ?, ?, ?, ?)`, [userId, friendId, content, type, date], connection)
}

export function findChatByUserId(userId, friendId, page, pageSize) {
    return query(`SELECT id, user_id, friend_id, content, type, created_time FROM ${TABLE_NAME} WHERE id <= (SELECT id FROM ${TABLE_NAME} WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) ORDER BY id DESC LIMIT ?,1) AND ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) ORDER BY id DESC LIMIT ?`, [userId, friendId, friendId, userId, (page - 1) * pageSize, userId, friendId, friendId, userId, pageSize])
}

export function findChatNotPage(userId, friendId, type) {
    return query(
        `SELECT id, user_id, friend_id, content, type, created_time 
        FROM ${TABLE_NAME}
        WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?))
        AND type=?`,
        [userId, friendId, friendId, userId, type]
    )
}

export function findChatNotPageCase1(userId, friendId) {
    return query(
        `SELECT id, user_id, friend_id, content, type, created_time 
        FROM ${TABLE_NAME}
        WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?))`,
        [userId, friendId, friendId, userId]
    )
}
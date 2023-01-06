import { query } from "./index.mjs";

const TABLE_NAME = 'user_friend_chat'

export function createOneChat(userId, friendId, content) {
    return query(`INSERT INTO ${TABLE_NAME}(user_id, friend_id, content) VALUES(?, ?, ?)`, [userId, friendId, content])
}

export function findChatByUserId(userId, friendId, page, pageSize) {
    return query(`SELECT id, user_id, friend_id, content, created_time FROM ${TABLE_NAME} WHERE id <= (SELECT id FROM ${TABLE_NAME} WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?) ORDER BY id DESC LIMIT ?,1) ORDER BY id DESC LIMIT ?`, [userId, friendId, friendId, userId, (page - 1) * pageSize, pageSize])
}


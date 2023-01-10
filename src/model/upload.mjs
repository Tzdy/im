import { query } from "./index.mjs";

const TABLE_NAME = 'user_friend_upload'

export function createOneUpload(uuid, userId, friendId, chat_id, originFilename, mimetype, connection) {
    return query(`INSERT INTO ${TABLE_NAME}(id, user_id, friend_id, chat_id, filename, mimetype) VALUES(?, ?, ?, ?, ?, ?)`, [uuid, userId, friendId, chat_id, originFilename, mimetype], connection)
}

export function findOneUpload(userId, friendId, chatId) {
    return query(`SELECT id,mimetype,filename FROM ${TABLE_NAME} WHERE chat_id=? AND ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) LIMIT 1`, [chatId, userId, friendId, friendId, userId])
}
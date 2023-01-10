import { query } from "./index.mjs";

const TABLE_NAME = 'user_friend_upload'

export function createOneUpload(uuid, chat_id, originFilename, mimetype, connection) {
    return query(`INSERT INTO ${TABLE_NAME}(id, chat_id, filename, mimetype) VALUES(?, ?, ?, ?)`, [uuid, chat_id, originFilename, mimetype], connection)
}
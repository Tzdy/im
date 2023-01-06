import { query } from "./index.mjs";

const TABLE_NAME = 'user'

export function findOneUserByUsername(username) {
    return query(`SELECT id,username,password FROM ${TABLE_NAME} WHERE username=? LIMIT 1`, [username])
}

export function findOneUserById(userId) {
    return query(`SELECT id,username FROM ${TABLE_NAME} WHERE id=? LIMIT 1`, [userId])
}

export function createOneUser(username, password) {
    return query(`INSERT INTO ${TABLE_NAME}(username, password) VALUES(?, ?)`, [username, password])
}

export function updateOneUserOnline(userId, isOnline) {
    return query(`UPDATE ${TABLE_NAME} SET is_online=? WHERE id=? LIMIT 1`, [isOnline, userId])
}
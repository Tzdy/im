import { query } from "./index.mjs";

const TABLE_NAME = 'user'

export function findOneUserByUsername(username) {
    return query(`SELECT id,username,password FROM ${TABLE_NAME} WHERE username=? LIMIT 1`, [username])
}

export function findOneUserById(userId) {
    return query(`SELECT id,username FROM ${TABLE_NAME} WHERE id=? LIMIT 1`, [userId])
}

export function createOneUser(username, password) {
    return query(`INSERT INTO ${TABLE_NAME}(username, password, nickname) VALUES(?, ?)`, [username, password, username])
}


export function findUserNotUserId(userId) {
    return query(`SELECT id,username,nickname WHERE id!=? FROM ${TABLE_NAME}`, [userId])
}
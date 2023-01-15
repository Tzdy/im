import { query } from "./index.mjs";
const USER = 'user'
const USER_FRIEND_CHAT = 'user_friend_chat'


export function findLastChatByUserId(userId) {
    return query(`SELECT u.id user_id, ufc.friend_id, ufc.id chat_id, u.nickname, ufc.content, ufc.created_time FROM ${USER} u LEFT JOIN (SELECT * FROM ${USER_FRIEND_CHAT} WHERE id IN (SELECT MAX(id) FROM ${USER_FRIEND_CHAT} WHERE user_id=? OR friend_id=? GROUP BY user_id, friend_id)) ufc ON ufc.user_id=u.id ORDER BY chat_id desc`,
        [userId, userId]
    )
}

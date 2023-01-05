import { createDirectOneFriend, findFriend } from "../model/friend.mjs";

export async function postFriend(myselfId, otherId) {
    await createDirectOneFriend(myselfId, otherId)

    return {
        code: 20000
    }
}

export async function getFriend(userId) {
    return {
        code: 20000,
        data: {
            userList: await findFriend(userId)
        }
    }
}
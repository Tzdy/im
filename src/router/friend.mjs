import { asyncException } from '@tsdy/express-plugin-exception'
import { Router } from 'express'
import { TokenMiddleWare } from '../middleware/jwt.mjs'
import { getFriend, postFriend } from '../service/friend.mjs'

const router = Router()

router.post('/friend', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    const { friendId } = req.body
    res.send(await postFriend(userId, friendId))
}))

router.delete('/friend', (req, res) => {

})

router.put('/friend', (req, res) => {

})

router.get('/friend', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    res.send(await getFriend(userId))
}))

export default router
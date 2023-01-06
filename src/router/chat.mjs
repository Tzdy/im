import { asyncException } from '@tsdy/express-plugin-exception'
import { Router } from 'express'
import { TokenMiddleWare } from '../middleware/jwt.mjs'
import { getChat, postChat } from '../service/chat.mjs'

const router = Router()

router.post('/chat', TokenMiddleWare, asyncException(async (req, res) => {
    const id = req.user.id
    const { friendId, content } = req.body
    res.send(await postChat(id, friendId, content))
}))

router.delete('/chat', (req, res) => {

})

router.get('/chat', TokenMiddleWare, asyncException(async (req, res) => {
    const id = req.user.id
    const friendId = Number(req.query.friendId)
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    res.send(await getChat(id, friendId, page, pageSize))
}))

export default router
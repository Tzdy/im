import { Router } from 'express'
import { asyncException } from '@tsdy/express-plugin-exception'
import { login, register, info } from '../service/auth.mjs'
import { TokenMiddleWare } from '../middleware/jwt.mjs'
const router = Router()

router.post('/login', asyncException(async (req, res) => {
    const { username, password } = req.body
    res.send(await login(username, password))
}))

router.post('/register', asyncException(async (req, res) => {
    const { username, password } = req.body
    res.send(await register(username, password))
}))

router.get('/info', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    res.send(await info(userId))
}))

export default router
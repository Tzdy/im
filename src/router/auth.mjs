import { Router } from 'express'
import { asyncException } from '@tsdy/express-plugin-exception'
import { login, register, info, listAllUserNotMyself, putInfo, uploadAvatar } from '../service/auth.mjs'
import { TokenMiddleWare } from '../middleware/jwt.mjs'
import multer from "multer";
import { join } from 'path'
import { HttpOKException } from '../util/exception.mjs';
const router = Router()

router.post('/login', asyncException(async (req, res) => {
    const { username, password } = req.body
    res.send(await login(username, password))
}))

router.post('/register', asyncException(async (req, res) => {
    const { username, password, nickname } = req.body
    res.send(await register(nickname, username, password))
}))

router.get('/info', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    res.send(await info(userId))
}))

router.put('/info', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    const { nickname, avatarType } = req.body

    res.send(await putInfo(userId, nickname, avatarType))
}))

router.get('/user/all', TokenMiddleWare, asyncException(async (req, res) => {
    const userId = req.user.id
    res.send(await listAllUserNotMyself(userId))
}))

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, process.env.UPLOAD_AVATAR_PATH)
        },
        filename(req, file, cb) {
            cb(null, req.user.id + '')
        },
    })
})

router.post('/upload/avatar', TokenMiddleWare, upload.fields([{ name: 'avatar' }]), asyncException(async (req, res) => {
    const userId = req.user.id
    res.send(await uploadAvatar(userId))
}))

router.get('/upload/avatar', asyncException(async (req, res) => {
    const userId = Number(req.query.id)
    if (!Number.isInteger(userId)) {
        throw new HttpOKException(20001, 'not exist')
    }
    res.setHeader('Content-Type', 'image/png')
    res.sendFile(join(process.env.UPLOAD_AVATAR_PATH, userId + ''))
}))

export default router
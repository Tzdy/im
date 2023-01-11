import { asyncException } from '@tsdy/express-plugin-exception'
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path'
import { Router } from 'express'
import { TokenMiddleWare } from '../middleware/jwt.mjs'
import { getChat, getChatUpload, postChat, postChatUpload } from '../service/chat.mjs'
import { chatType } from '../model/chat.mjs';
import { verify } from '../util/jwt.mjs';

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

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, process.env.UPLOAD_PATH)
        },
        filename(req, file, cb) {
            // file.filename 传送方可能没起名字。。。
            const uuid = uuidv4()
            req.uuid = uuid
            cb(null, uuid)
        },
    })
})

router.post('/chat/upload', TokenMiddleWare, upload.fields([{ name: 'file' }, { name: 'friendId' }, { name: 'type' }]), asyncException(async (req, res) => {
    /**
     * @type { Express.Multer.File }
     */
    const file = req.files.file && req.files.file[0]
    if (file) {
        const userId = req.user.id
        const friendId = Number(req.body.friendId)
        const uuid = req.uuid
        const type = Number(req.body.type)
        res.send(await postChatUpload(userId, friendId, uuid, Buffer.from(file.originalname, 'latin1').toString('utf-8'), file.mimetype, type))
    } else {
        res.send({
            code: 20003,
            message: '没有文件'
        })
    }
}))

router.get('/chat/upload', asyncException(async (req, res) => {
    const { payload } = verify(req.query.token)
    const userId = payload.id
    const friendId = Number(req.query.friendId)
    const chatId = Number(req.query.chatId)
    const type = Number(req.query.type)
    const info = await getChatUpload(userId, friendId, chatId)
    if (info) {
        const { id, mimetype, filename } = info
        res.setHeader('Content-Type', type === chatType.IMAGE ? mimetype : 'application/octet-stream')
        if (type === chatType.FILE) {
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
        }
        res.sendFile(join(process.env.UPLOAD_PATH, id))
    }
}))


export default router
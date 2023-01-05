import { Router } from 'express'
import Auth from './auth.mjs'
import Friend from './friend.mjs'
import Chat from './chat.mjs'

const router = Router()
router.use(Auth)
router.use(Friend)
router.use(Chat)

export default router

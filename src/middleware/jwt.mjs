import jwt from 'jsonwebtoken'
import { verify } from '../util/jwt.mjs'
import { HttpAuthException } from '../util/exception.mjs'
export function TokenMiddleWare(
    req,
    res,
    next,
) {
    const token = req.headers.authorization
    req.user = {}
    if (typeof token === 'string') {
        let json = null
        try {
            json = verify(token)
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return next(new HttpAuthException(100, 'token expires'))
            }
        }
        if (json) {
            const { id } = json.payload
            req.user = {
                id,
                token,
            }
            return next()
        }
    }
    next(new HttpAuthException(101, '重新登陆'))
}

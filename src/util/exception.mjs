import { HttpException } from '@tsdy/express-plugin-exception'

export class HttpOKException extends HttpException {
    constructor(code, message) {
        super(200, message)
        this.resData.code = code
    }
}

export class HttpAuthException extends HttpException {
    constructor(code, message) {
        super(401, message)
        this.resData.code = code
    }
}
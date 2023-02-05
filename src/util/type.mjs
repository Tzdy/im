import { HttpException } from "@tsdy/express-plugin-exception";

export function number(val, force) {
    if (val === '' || typeof val === 'boolean' || val === null || val === undefined) {
        if (force) {
            throw new HttpException(400, 'bad input.')
        }
        return null
    }
    const result = Number(val)
    if (Number.isNaN(result)) {
        if (force) {
            throw new HttpException(400, 'bad input.')
        }
        return null
    }
    return result
}
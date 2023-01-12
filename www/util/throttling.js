export function throttling(callback, ms) {
    let origin = Date.now()
    let timer = -1
    return function () {
        const now = Date.now()
        if (Date.now() - origin > ms) {
            origin = Date.now()
            callback()
            if (timer !== -1) {
                clearTimeout(timer)
                timer = -1
            }
        } else {
            if (timer === -1) {
                timer = setTimeout(() => {
                    callback()
                }, ms)
            }
        }
    }
}
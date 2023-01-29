export function assign(target, k, v) {
    if (v === undefined || v === null) {
        return
    }
    target[k] = v
}
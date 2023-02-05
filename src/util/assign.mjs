export function assign(target, k, v) {
    if (v === undefined || v === null || Number.isNaN(v)) {
        return
    }
    target[k] = v
}
const BASE = '/'

export function goHome() {
    window.location.href = BASE + 'index.html'
}

export function goRegister() {
    window.location.href = BASE + 'register.html'
}

export function goLogin(errMessage) {
    window.location.href = BASE + 'login.html' + (errMessage ? `?errMsg=${errMessage}` : '')
}
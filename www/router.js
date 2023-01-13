import { VUE_ROOT } from './config.js'

export function goHome() {
    window.location.href = VUE_ROOT + 'index.html'
}

export function goRegister() {
    window.location.href = VUE_ROOT + 'register.html'
}

export function goLogin(errMessage) {
    window.location.href = VUE_ROOT + 'login.html' + (errMessage ? `?errMsg=${errMessage}` : '')
}
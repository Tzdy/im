let permission = ("Notification" in window) && window.Notification.permission === 'granted'

export function notifyInit() {
    // Check if the browser supports notifications
    if ("Notification" in window) {
        return new Promise((resolve, reject) => {
            window.Notification.requestPermission()
                .then(res => {
                    if (res === 'granted') {
                        permission = true
                    }
                    resolve()
                })
        })
    }
    return Promise.resolve()
}

export function notify(message) {
    if (permission && document.hidden) {
        new Notification(message);
    }
}

/**
 * 
 * @param { Date } a 
 * @param { Date } b 
 */
function timeEqual(a, b, isYear, isMonth, isDay) {
    let result = false
    if (isYear) {
        result = (a.getFullYear() === b.getFullYear()) ? true : false
    }
    if (isMonth) {
        result = (a.getMonth() === b.getMonth()) ? true : false
    }

    if (isDay) {
        result = (a.getDate() === b.getDate()) ? true : false
    }

    return result

}
/**
 * 
 * @param { Date } a 
 * @param { Date } b 
 */
function weekEqual(a, b) {
    const before = new Date(a.getTime())
    const after = new Date(a.getTime())
    const day = a.getDay() === 0 ? 7 : a.getDay()
    before.setTime(before.getTime() - (day + 1) * 24 * 60 * 60 * 1000)
    after.setTime(after.getTime() + (7 - day) * 24 * 60 * 60 * 1000)
    before.setHours(0, 0, 0, 0)
    after.setHours(0, 0, 0, 0)
    return b.getTime() >= before.getTime() && b.getTime() <= after.getTime()
}

function padStart(val, num) {
    return (val + "").padStart(num, "0");
}

/**
 * 
 * @param { Date } date 
 * @returns { string } yyyy-MM-dd
 */
function dateFormat(date) {
    return `${date.getFullYear()}-${padStart(date.getMonth() + 1, 2)}-${padStart(date.getDate(), 2)}`;
}

/**
 * 
 * @param { Date } date 
 * @returns { string } hh:mm:ss
 */
function timeFormat(date) {
    return `${date.getHours()}:${padStart(date.getMinutes(), 2)}`
    // :${padStart(date.getSeconds(), 2)} 不太需要显示秒
}

/**
 * 
 * @param { Date } date 
 * @returns { string } yyyy-MM-dd hh:mm:ss
 */
function dateTimeFormat(date) {
    return `${dateFormat(date)} ${timeFormat(date)}`
}

const DAY = ["日", "一", "二", "三", "四", "五", '六']

/**
 * 
 * @param { string | Date | number } date 
 */
export function relativeTimeFormat(date) {
    if (date && (typeof date === 'string' || typeof date === 'number')) {
        date = new Date(date)
    }
    const now = new Date()
    // 今天以内
    if (timeEqual(date, now, true, true, true)) {
        return timeFormat(date)
    } else if (weekEqual(date, now)) {
        // 本周以内
        return `周${DAY[date.getDay()]} ${timeFormat(date)}`
    } else {
        return dateFormat(date)
    }
}
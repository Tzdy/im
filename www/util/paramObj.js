export function paramObj() {
    const search = window.location.search.slice(1)
    return search.split('&').map(item => item.split('=')).reduce((a, b) => Object.assign(a, { [b[0]]: decodeURIComponent(b[1]) }), {})
}
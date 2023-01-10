export function join(a, b) {
    if (a[a.length - 1] === "/") {
        a = a.slice(0, a.length - 1);
    }
    if (b[0] === "/") {
        b = b.slice(1);
    }
    return a + "/" + b;
}
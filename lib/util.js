
export function once(fn) {
    let called = false;
    return (...args) => {
        if (!called) {
            called = true;
            fn(...args);
        }
    };
}

export function range(n) {
    return ((n / 100) | 0) * 100;
}
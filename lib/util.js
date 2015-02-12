

export function once(fn) {
    let called = false;
    return (...args) => {
        if (!called) {
            called = true;
            fn(...args);
        }
    };
}

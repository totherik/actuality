
export function once(fn) {
    let called = false;
    let value = undefined;
    return (...args) => {
        if (!called) {
            called = true;
            return (value = fn(...args));
        }
        return value;
    };
}

export function range(n) {
    return ((n / 100) | 0) * 100;
}

export function load(module) {
    try {
        return require(module);
    } catch (err) {
        return null;
    }
}
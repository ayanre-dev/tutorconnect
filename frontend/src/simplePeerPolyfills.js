// Ensure global and process exist before importing packages that expect them
if (typeof global === "undefined") {
    window.global = window;
}

if (typeof process === "undefined") {
    window.process = { env: { DEBUG: undefined }, nextTick: (cb) => setTimeout(cb, 0) };
}

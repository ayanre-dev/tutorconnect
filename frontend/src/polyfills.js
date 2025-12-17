// Ensure Node-like globals exist for browser builds (simple-peer dependencies expect them)
import { Buffer as BufferPolyfill } from "buffer";

if (typeof global === "undefined") {
    window.global = window;
}

if (typeof process === "undefined") {
    window.process = { env: { NODE_ENV: "production", DEBUG: undefined }, nextTick: (cb) => setTimeout(cb, 0) };
}

if (typeof window.Buffer === "undefined") {
    window.Buffer = BufferPolyfill;
} else {
    window.Buffer = window.Buffer || BufferPolyfill;
}
import { Buffer } from "buffer";
import process from "process";

window.global = window;
window.Buffer = Buffer;
window.process = process;


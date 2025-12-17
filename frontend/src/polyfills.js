// Ensure Node-like globals exist for browser builds (simple-peer dependencies expect them)
import { Buffer } from "buffer";

if (typeof global === "undefined") {
    window.global = window;
}

if (typeof process === "undefined") {
    window.process = { env: { NODE_ENV: "production", DEBUG: undefined }, nextTick: (cb) => setTimeout(cb, 0) };
}

if (typeof Buffer === "undefined") {
    window.Buffer = Buffer;
} else {
    window.Buffer = window.Buffer || Buffer;
}
import { Buffer } from "buffer";
import process from "process";

window.global = window;
window.Buffer = Buffer;
window.process = process;


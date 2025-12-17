// Polyfills for simple-peer (WebRTC) in Vite
import { Buffer } from "buffer";

if (typeof global === "undefined") {
    window.global = window;
}
if (typeof process === "undefined") {
    window.process = { env: { DEBUG: undefined }, nextTick: (cb) => setTimeout(cb, 0) };
}
if (typeof window.Buffer === "undefined") {
    window.Buffer = Buffer;
}

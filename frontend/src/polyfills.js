window.global = window;
import { Buffer } from "buffer";

if (typeof window.process === "undefined") {
    window.process = { 
        env: { DEBUG: undefined }, 
        nextTick: (cb) => setTimeout(cb, 0),
        browser: true,
        version: '',
        versions: {}
    };
}
if (typeof window.Buffer === "undefined") {
    window.Buffer = Buffer;
}


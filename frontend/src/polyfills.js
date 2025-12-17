import { Buffer } from "buffer";
import * as process from "process";

window.global = window;
window.Buffer = Buffer;
window.process = process;

if (!window.process.nextTick) {
    window.process.nextTick = (cb) => setTimeout(cb, 0);
}
if (!window.process.env) {
    window.process.env = {};
}


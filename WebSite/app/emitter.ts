import { EventEmitter } from 'events';
import { remember } from "@epic-web/remember";

// remember prevents memory leak
export const emitter = remember("emitter", () => new EventEmitter());
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sentry = void 0;
exports.initSentry = initSentry;
const Sentry = require("@sentry/node");
exports.Sentry = Sentry;
function initSentry() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
    });
}
//# sourceMappingURL=sentry.js.map
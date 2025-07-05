import * as Sentry from '@sentry/node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    // integrations: [new RewriteFrames({ root: global.__dirname })], // Désactivé pour éviter l'erreur TS
  });
}

export { Sentry };

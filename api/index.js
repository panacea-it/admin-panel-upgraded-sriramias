/**
 * Vercel serverless entry — all /api/* requests are rewritten here.
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes/node-js
 */
import app from '../backend/app.js'

export default app

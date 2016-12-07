import { init } from './stat';

export const logInfo = console.log;     // eslint-disable-line no-console
export const logError = console.error;  // eslint-disable-line no-console
export const logWarn = console.warn;    // eslint-disable-line no-console

export async function initUtils() {
    await init();
}

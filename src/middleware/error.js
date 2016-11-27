import { logError } from '../utils';

export default async function(ctx, next) {
    try {
        return await next();
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            logError(err);
        }

        ctx.status = 500;
        ctx.body = err;
    }
}

// import AWS from 'aws-sdk';
import dynamoose from 'dynamoose';
import app from './app';
import { logError, logInfo } from './utils';

let server = null;

async function main() {
    try {
        logInfo('Booting up');

        // DB
        logInfo('Connecting to DB');
        dynamoose.local();

        // HTTP
        logInfo('Starting http app');
        const port = normalizePort(process.env.PORT || '3000');
        server = app.listen(port, err => {
            if (err) {
                throw err;
            }
            logInfo(`App ready on port ${port}`);
        });

        logInfo('Boot-up complete');
    } catch (err) {
        logError(`Error during boot ${err.message}\n${err.stack}`);
        process.exit(1);
    }
}

function normalizePort(val) {
    const port = parseInt(val);

    if (port >= 0) {
        return port;
    }

    throw new Error(`Invalid port: ${val}`);
}

main();

let terminating = false;

process.on('SIGTERM', terminate);
process.on('SIGINT', terminate);

function terminate() {
    if (terminating) {
        return;
    }

    terminating = true;
    logInfo('Got SIGTERM signal. Stopping...');

    setTimeout(() => {
        logError('App isn\'t stopped after 10s of waiting. Terminating...');
        process.exit(1);
    }, 10000);



    Promise.all([
        server.close()
    ]).then(() => {
        logInfo('Stop complete');
        process.exit(0);
    }).catch(err => {
        logError(`Error ocured during shutdown ${err}`);
        process.exit(1);
    });
}

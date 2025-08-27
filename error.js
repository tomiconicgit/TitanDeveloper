/*
File: /error.js
*/

(function() {
    'use strict';
    const errorLog = [];
    const config = { maxErrors: 50 };

    const logError = (error, type, message, source, lineno, colno, stack) => {
        const timestamp = new Date().toLocaleString();
        const newError = { timestamp, type, message, source: source || 'N/A', lineno: lineno || 'N/A', colno: colno || 'N/A', stack: stack || 'No stack trace available.', raw: error, id: errorLog.length };
        if (errorLog.length >= config.maxErrors) errorLog.shift();
        errorLog.push(newError);
        console.error(`[${type} Error]: ${message}`, newError);
        window.dispatchEvent(new CustomEvent('app-error', { detail: newError }));
    };

    window.addEventListener('error', (event) => {
        logError(event.error, 'Script', event.message, event.filename, event.lineno, event.colno, event.error?.stack);
        return false;
    });

    window.addEventListener('unhandledrejection', (event) => {
        logError(event.reason, 'Promise', event.reason.message || event.reason, 'N/A', 'N/A', 'N/A', event.reason.stack);
    });

    window.logCustomError = (message, details) => {
        try {
            throw new Error(message);
        } catch (e) {
            logError(e, 'Custom', message, details?.source || 'N/A', details?.lineno || 'N/A', details?.colno || 'N/A', e.stack);
        }
    };
})();
/*
File: /error.js
*/

// This file handles error logging and provides a way to expose them to the main app.
// It has no external dependencies.
(function() {
    'use strict';

    // Internal state for the error logger
    const errorLog = [];
    const config = {
        maxErrors: 50,
    };

    const logError = (error, type, message, source, lineno, colno, stack) => {
        const timestamp = new Date().toLocaleString();
        const newError = {
            timestamp,
            type,
            message,
            source: source || 'N/A',
            lineno: lineno || 'N/A',
            colno: colno || 'N/A',
            stack: stack || 'No stack trace available.',
            raw: error,
            id: errorLog.length,
        };

        if (errorLog.length >= config.maxErrors) {
            errorLog.shift();
        }
        errorLog.push(newError);
        console.error(`[${type} Error]: ${message}`, newError);

        // Dispatch a custom event for the main app to handle
        const event = new CustomEvent('app-error', {
            detail: newError
        });
        window.dispatchEvent(event);
    };

    const setupErrorListeners = () => {
        window.addEventListener('error', (event) => {
            logError(
                event.error,
                'Script',
                event.message,
                event.filename,
                event.lineno,
                event.colno,
                event.error ? event.error.stack : 'N/A'
            );
            return false;
        });

        window.addEventListener('unhandledrejection', (event) => {
            logError(
                event.reason,
                'Promise',
                event.reason.message || event.reason,
                'N/A',
                'N/A',
                'N/A',
                event.reason.stack || 'No stack trace available.'
            );
        });
    };

    const init = () => {
        setupErrorListeners();
    };

    init();
})();

window.logCustomError = (message, details) => {
    (function() {
        try {
            throw new Error(message);
        } catch (e) {
            const stack = e.stack || 'N/A';
            const cause = (details && details.cause) ? details.cause : 'N/A';
            const source = (details && details.source) ? details.source : 'N/A';
            const lineno = (details && details.lineno) ? details.lineno : 'N/A';
            const colno = (details && details.colno) ? details.colno : 'N/A';
            logError(e, 'Custom', message, source, lineno, colno, stack);
        }
    })();
};
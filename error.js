// This file is the core of our custom code editor and file system logic.
// It has no external dependencies.
(function() {
    'use strict';

    // Internal state for the error logger
    const errorLog = [];
    let isUIInitialized = false;

    const config = {
        buttonId: 'error-tracker-btn',
        containerId: 'error-tracker-container',
        listId: 'error-list',
        detailsId: 'error-details',
        copyButtonId: 'copy-error-btn',
        maxErrors: 50,
        buttonSize: '40px',
        fontSize: '14px',
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
        updateUI();
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

    const initializeUI = () => {
        if (isUIInitialized) return;

        const button = document.createElement('button');
        button.id = config.buttonId;
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: ${config.buttonSize};
            height: ${config.buttonSize};
            border-radius: 50%;
            background-color: #EF4444; /* Brighter red */
            color: white;
            border: none;
            cursor: pointer;
            z-index: 2001;
            font-size: ${config.fontSize};
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transition: transform 0.2s ease;
            display: none; /* Initially hidden */
        `;
        button.textContent = '0';
        button.onclick = toggleErrorUI;

        const container = document.createElement('div');
        container.id = config.containerId;
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.95);
            color: white;
            z-index: 9998;
            display: none;
            flex-direction: column;
            padding: 20px;
            box-sizing: border-box;
            font-family: monospace;
        `;
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Errors</h2>
                <button id="close-error-ui" style="background: none; border: none; font-size: 24px; color: white; cursor: pointer;">&times;</button>
            </div>
            <div style="display: flex; flex-grow: 1; overflow: hidden;">
                <div id="${config.listId}" style="flex: 1; overflow-y: auto; padding-right: 10px; border-right: 1px solid #333;"></div>
                <div id="${config.detailsId}" style="flex: 2; padding-left: 20px; overflow-y: auto;"></div>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(container);

        document.getElementById('close-error-ui').onclick = toggleErrorUI;
        document.getElementById(config.listId).onclick = showDetailedError;

        isUIInitialized = true;
    };

    const toggleErrorUI = () => {
        const container = document.getElementById(config.containerId);
        if (container) {
            container.style.display = container.style.display === 'flex' ? 'none' : 'flex';
        }
    };

    const updateUI = () => {
        if (!isUIInitialized) return;
        const button = document.getElementById(config.buttonId);
        const errorList = document.getElementById(config.listId);
        
        if (errorLog.length > 0) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
        
        if (button) {
            button.textContent = errorLog.length.toString();
        }

        if (errorList) {
            errorList.innerHTML = '';
            errorLog.forEach(error => {
                const errorItem = document.createElement('div');
                errorItem.classList.add('error-item');
                errorItem.dataset.errorId = error.id;
                errorItem.style.cssText = `
                    padding: 10px;
                    border-bottom: 1px solid #222;
                    cursor: pointer;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                `;
                errorItem.innerHTML = `
                    <strong>[${error.type}]</strong> ${error.message}
                    <span style="color: #888; display: block; font-size: 12px;">${error.source}:${error.lineno}</span>
                `;
                errorList.appendChild(errorItem);
            });
        }
    };

    const showDetailedError = (event) => {
        const target = event.target.closest('.error-item');
        if (!target) return;

        const errorId = parseInt(target.dataset.errorId);
        const error = errorLog.find(err => err.id === errorId);

        if (error) {
            const detailsContainer = document.getElementById(config.detailsId);
            detailsContainer.innerHTML = `
                <h3>Error Details</h3>
                <p><strong>Type:</strong> ${error.type}</p>
                <p><strong>Timestamp:</strong> ${error.timestamp}</p>
                <p><strong>Message:</strong> <pre style="white-space: pre-wrap;">${error.message}</pre></p>
                <p><strong>Source:</strong> ${error.source}</p>
                <p><strong>Location:</strong> Line ${error.lineno}, Column ${error.colno}</p>
                <p><strong>Stack Trace:</strong> <pre style="white-space: pre-wrap;">${error.stack}</pre></p>
                <button id="${config.copyButtonId}" style="background-color: #007bff; color: white; border: none; padding: 10px; border-radius: 5px; margin-top: 10px; cursor: pointer;">Copy Details</button>
            `;

            document.getElementById(config.copyButtonId).onclick = () => {
                const detailsText = `
                    Error Details:
                    Type: ${error.type}
                    Timestamp: ${error.timestamp}
                    Message: ${error.message}
                    Source: ${error.source}
                    Location: Line ${error.lineno}, Column ${error.colno}
                    Stack Trace: ${error.stack}
                `.trim();
                navigator.clipboard.writeText(detailsText).then(() => {
                    alert('Error details copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            };
        }
    };

    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeUI();
                setupErrorListeners();
            });
        } else {
            initializeUI();
            setupErrorListeners();
        }
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
            logError(e, 'Custom', message, 'N/A', 'N/A', 'N/A', stack);
        }
    })();
};

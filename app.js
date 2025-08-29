// app.js

document.addEventListener('DOMContentLoaded', () => {

    const appState = {
        db: null,
        currentFile: null
    };

    // --- Main Page UI & Logic ---
    const pageStyles = `
        /* Base styles and layout for mobile */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            margin: 0;
            background-color: #000;
            color: #fff;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .main-content-scroll {
            flex-grow: 1;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
        }

        header {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            padding: 20px 40px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            z-index: 10;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }

        .logo svg {
            margin-right: 10px;
            width: 32px;
            height: 32px;
            fill: white;
        }

        .alert-banner {
            background-color: #000;
            text-align: center;
            padding: 15px 0;
            border-bottom: 1px solid #333;
            z-index: 5;
        }

        .alert-banner p {
            margin: 5px 0;
            font-size: 16px;
        }

        .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 12px;
            color: #aaa;
            background-color: #000;
            z-index: 10;
            position: relative;
            margin-top: -50px;
        }

        @media (max-width: 768px) {
            header {
                padding: 15px 20px;
            }
        }

        /* New banner and button CSS */
        .page-content-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
            padding-bottom: 50px;
        }

        #action-button-wrapper {
            margin-top: 20px;
        }

        .transform-button-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 250px;
            height: 50px;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            border-radius: 50px;
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            z-index: 999;
        }

        .transform-button-container.active {
            border-radius: 10px;
        }

        .button-label {
            color: #000;
            font-weight: bold;
            font-size: 16px;
            white-space: nowrap;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .transform-button-container.active .button-label {
            opacity: 0;
            transform: translateY(-20px);
            pointer-events: none;
        }

        .transform-dropdown-menu {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;
            list-style: none;
            padding: 0;
            margin: 0;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            background-color: #fff;
            border-radius: 50px;
        }

        .transform-button-container.active .transform-dropdown-menu {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            height: 200px;
            border-radius: 10px;
        }

        .transform-dropdown-menu li {
            position: relative;
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
        }

        .transform-dropdown-menu li:not(:last-child) {
            box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.15);
        }

        .transform-dropdown-menu li a {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            font-weight: bold;
            color: #000;
            text-decoration: none;
            font-size: 14px;
            padding: 0 10%;
            border-radius: 5px;
            text-align: left;
            box-sizing: border-box;
            transition: background-color 0.1s ease, transform 0.1s ease;
        }

        .transform-dropdown-menu li a:active {
            background-color: #e0e0e0;
            transform: scale(0.98);
        }

        .hero-section {
            padding: 80px 40px;
            text-align: center;
            margin-top: 0;
            margin-bottom: 0;
            position: relative;
            z-index: 5;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .hero-content {
            background-color: #1a1a1a;
            padding: 70px 40px 70px;
            border-radius: 10px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            z-index: 2;
        }

        .hero-content h1 {
            font-size: 48px;
            margin-top: -30px;
            margin-bottom: 0;
            line-height: 1.2;
            color: #fff;
        }

        .hero-content p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            color: #000;
            font-weight: bold;
            position: relative;
            z-index: 3;
            margin-top: 20px;
        }

        .gradient-background {
            position: absolute;
            bottom: -70px;
            left: 0;
            width: 100%;
            height: 250px;
            background: linear-gradient(to right, #ff4500, #ffa500, #ffd700, #ffff00);
            mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
            z-index: 0;
        }

        .triangle-overlay {
            position: absolute;
            bottom: -70px;
            left: 50%;
            transform: translateX(-50%) translateY(50%);
            width: 80px;
            height: 80px;
            background-color: #000;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            z-index: 1;
        }

        .fade-overlay {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 150px;
            background: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
            z-index: 1;
            pointer-events: none;
        }

        @media (max-width: 768px) {
            .hero-content {
                padding: 70px 20px 60px;
            }
            .hero-content h1 {
                font-size: 36px;
            }
            .hero-content p {
                font-size: 16px;
            }
        }

        /* --- Modal Styles --- */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .modal-overlay.visible {
            visibility: visible;
            opacity: 1;
        }

        .modal-content {
            background-color: #000;
            border: none;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            transform: scale(0.7);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            margin-top: -80px;
        }

        .modal-overlay.visible .modal-content {
            transform: scale(1);
        }

        .modal-title {
            color: #fff;
            font-size: 20px;
            margin-bottom: 20px;
        }

        #file-name-input {
            width: 200px;
            padding: 10px;
            border: none;
            background-color: #fff;
            color: #000;
            border-radius: 5px;
            text-align: center;
            font-size: 16px;
            outline: none;
        }

        .modal-actions {
            margin-top: 20px;
            display: flex;
            justify-content: center;
        }

        .modal-actions button {
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin: 0 5px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        #cancel-button {
            background-color: #dc3545;
            color: #fff;
        }

        #confirm-button {
            background-color: #fff;
            color: #000;
        }

        #confirm-button:disabled {
            background-color: #555;
            color: #aaa;
            cursor: not-allowed;
        }
    `;

    // Injects the CSS styles into the document's head
    function injectStyles(styles) {
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);
    }

    // Mocking placeholder for repository manager logic
    const repoManager = {
        openRepo: function(repoName) {
            console.log(`Opening new repository: ${repoName}`);
            console.log(`Sliding in the repo root page...`);
        },
        unpackAndOpenRepo: function(zipFileName) {
            console.log(`Attempting to unpack zip file: ${zipFileName}`);
            console.log(`Simulating unpacking...`);
            console.log(`Successfully unpacked contents into a new repository.`);
            this.openRepo(zipFileName.replace('.zip', ''));
        }
    };
    
    // --- Code Editor UI & Logic ---
    const editorHtmlContent = `
        <div class="app-container">
            <header>
                <div class="logo">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-.83 0-1.5-.67-1.5-1.5S11.17 5 12 5s1.5.67 1.5 1.5S12.83 7 12 7zm0 10c-.83 0-1.5-.67-1.5-1.5S11.17 14 12 14s1.5.67 1.5 1.5S12.83 17 12 17zm0-5c-2.76 0-5 2.24-5 5h3c0-1.1.9-2 2-2s2 .9 2 2h3c0-2.76-2.24-5-5-5zM9 13c-.55 0-1 .45-1 1s.45 1 1 1h.5v-2H9zm6 0v2h.5c.55 0 1-.45 1-1s-.45-1-1-1H15zM7 9v1h2V9H7zm8 0v1h2V9h-2z"/>
                    </svg>
                    Titan Designer
                </div>
                <button class="close-btn editor-close-btn">&times;</button>
            </header>
            <div class="code-editor">
                <div class="editor-header">
                    <h3 id="current-file-name"></h3>
                    <div class="editor-header-right">
                        <button id="select-all-button" class="icon-button" title="Select All">
                            <i class="fas fa-solid fa-file-invoice"></i>
                        </button>
                        <button id="copy-button" class="icon-button" title="Copy">
                            <i class="fas fa-solid fa-copy"></i>
                        </button>
                        <button id="paste-button" class="icon-button" title="Paste">
                            <i class="fas fa-solid fa-paste"></i>
                        </button>
                        <button id="download-button" class="icon-button" title="Download">
                            <i class="fas fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="editor-content">
                    <div class="number-bar"></div>
                    <textarea id="code-textarea" class="code-textarea" autocapitalize="none"></textarea>
                </div>
            </div>
        </div>
        <div id="modal-overlay" class="modal-overlay">
            <div id="modal-box" class="modal-box">
                <h3>Download File!</h3>
                <p>This app does not save locally. Please download your file to a device or service to save it.</p>
                <div class="modal-buttons">
                    <button id="download-modal-btn" class="modal-button">Download</button>
                    <button id="close-modal-btn" class="modal-button">Close</button>
                </div>
            </div>
        </div>
    `;

    const editorCssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
        /* General editor styling */
        .app-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background-color: #000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            z-index: 10;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            color: white;
        }

        .logo svg {
            margin-right: 10px;
            width: 32px;
            height: 32px;
            fill: white;
        }

        .code-editor {
            width: 100%;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background-color: #1a1a1a;
            border-bottom: 1px solid #333;
            position: relative;
            z-index: 2;
        }
        
        .editor-header h3 {
            margin: 0;
            font-size: 18px;
            color: #fff;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .editor-header-right {
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
            z-index: 1;
        }

        .editor-header .icon-button {
            background: none;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            transition: background-color 0.2s ease, transform 0.1s ease;
        }
        
        .editor-header .icon-button:hover {
            background-color: #333;
        }
        
        .editor-header .icon-button:active {
            transform: scale(0.95);
        }

        .editor-content {
            flex-grow: 1;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: row;
        }

        .number-bar {
            width: 50px;
            background-color: #000000;
            padding: 20px 0;
            color: #E0E0E0;
            font-weight: bold;
            text-align: right;
            font-size: 16px;
            line-height: 1.6;
            box-sizing: border-box;
            overflow-y: hidden;
            white-space: pre-wrap;
            flex-shrink: 0;
            font-family: 'JetBrains Mono', monospace;
        }

        .number-bar div {
            padding-right: 10px;
            line-height: 1.6;
            font-family: 'Poppins', sans-serif;
            position: relative;
        }

        .number-bar div.active-line {
            background-color: #007acc;
            color: #E0E0E0;
        }
        
        .code-textarea {
            width: 100%;
            height: 100%;
            padding: 20px;
            background-color: #000000;
            border: none;
            outline: none;
            color: #E0E0E0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 16px;
            line-height: 1.6;
            resize: none;
            box-sizing: border-box;
            overflow-x: auto;
            white-space: pre;
            flex-grow: 1;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 32px;
            cursor: pointer;
            line-height: 1;
        }

        @media (max-width: 768px) {
            header {
                padding: 15px 20px;
            }
        }

        /* --- Modal Styles --- */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-box {
            background-color: #1e1e1e;
            color: #E0E0E0;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 350px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            animation: bounce 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        
        .modal-box.bounce-out {
            animation: bounce-out 0.4s ease-in;
        }

        .modal-box h3 {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: bold;
        }

        .modal-box p {
            margin: 0 0 30px 0;
            font-size: 16px;
            line-height: 1.5;
        }

        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
        }

        .modal-button {
            padding: 10px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.1s ease, background-color 0.2s ease;
        }

        #download-modal-btn {
            background-color: white;
            color: black;
        }
        
        #close-modal-btn {
            background-color: #FF3B30;
            color: white;
        }

        .modal-button:active {
            transform: scale(0.95);
        }

        /* --- Animations --- */
        @keyframes bounce {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
        }

        @keyframes bounce-out {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.5); opacity: 0; }
        }
    `;

    function renderCodeEditor(targetElementId) {
        // Inject CSS and HTML for the editor
        injectStyles(editorCssContent);
        document.getElementById(targetElementId).innerHTML = editorHtmlContent;
    }

    function initEditorListeners(initialFileName) {
        // Now that the elements exist, get references
        const editorCloseBtn = document.querySelector('.editor-close-btn');
        const mainContentArea = document.getElementById('main-content-area');
        const editorContainer = document.getElementById('code-editor-container');
        const codeTextarea = document.getElementById('code-textarea');
        const currentFileName = document.getElementById('current-file-name');
        const numberBar = document.querySelector('.number-bar');
        const selectAllButton = document.getElementById('select-all-button');
        const copyButton = document.getElementById('copy-button');
        const downloadButton = document.getElementById('download-button');
        const pasteButton = document.getElementById('paste-button');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalBox = document.getElementById('modal-box');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const downloadModalBtn = document.getElementById('download-modal-btn');

        // All the original functions and event listeners
        const updateLineNumbers = () => {
            const lineCount = codeTextarea.value.split('\n').length;
            let html = '';
            for (let i = 1; i <= lineCount; i++) {
                html += `<div>${i}</div>`;
            }
            numberBar.innerHTML = html;
            highlightActiveLine();
        };

        const highlightActiveLine = () => {
            const cursorPosition = codeTextarea.selectionStart;
            const textBeforeCursor = codeTextarea.value.substring(0, cursorPosition);
            const currentLine = textBeforeCursor.split('\n').length;
            const lines = numberBar.querySelectorAll('div');
            lines.forEach((line) => line.classList.remove('active-line'));
            if (lines[currentLine - 1]) {
                lines[currentLine - 1].classList.add('active-line');
            }
        };

        const saveFileToDb = () => {
            if (!appState.db) {
                console.error('IndexedDB not initialized.');
                return;
            }
            const transaction = appState.db.transaction(['files'], 'readwrite');
            const objectStore = transaction.objectStore('files');
            const fileToSave = {
                name: currentFileName.textContent,
                content: codeTextarea.value,
                createdDate: new Date().getTime(),
                size: new Blob([codeTextarea.value]).size
            };
            objectStore.put(fileToSave);
            transaction.oncomplete = () => {
                console.log('File saved successfully.');
            };
            transaction.onerror = (e) => {
                console.error('Save failed:', e.target.error);
            };
        };
        
        // Load or create a file in IndexedDB
        const loadOrFetchFile = (fileName) => {
            if (!appState.db) {
                console.error('IndexedDB not initialized.');
                return;
            }
            const transaction = appState.db.transaction(['files'], 'readonly');
            const objectStore = transaction.objectStore('files');
            const request = objectStore.get(fileName);

            request.onsuccess = (e) => {
                const file = e.target.result;
                if (file) {
                    appState.currentFile = file;
                    codeTextarea.value = file.content;
                    currentFileName.textContent = file.name;
                } else {
                    appState.currentFile = { name: fileName, content: '' };
                    codeTextarea.value = '';
                    currentFileName.textContent = fileName;
                    saveFileToDb();
                }
                updateLineNumbers();
                console.log(`File loaded: ${fileName}`);
            };
            request.onerror = (e) => {
                console.error('Failed to get file:', e.target.error);
                appState.currentFile = { name: fileName, content: '' };
                codeTextarea.value = '';
                currentFileName.textContent = fileName;
                updateLineNumbers();
                saveFileToDb();
            };
        };

        // Event Listeners
        codeTextarea.addEventListener('input', updateLineNumbers);
        codeTextarea.addEventListener('scroll', () => { numberBar.scrollTop = codeTextarea.scrollTop; });
        codeTextarea.addEventListener('keyup', highlightActiveLine);
        codeTextarea.addEventListener('click', highlightActiveLine);
        codeTextarea.addEventListener('input', saveFileToDb);

        selectAllButton.addEventListener('click', () => { codeTextarea.select(); });
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeTextarea.value);
                alert('Content copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy.');
            }
        });
        downloadButton.addEventListener('click', () => {
            const content = codeTextarea.value;
            const fileName = currentFileName.textContent;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        pasteButton.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                const start = codeTextarea.selectionStart;
                const end = codeTextarea.selectionEnd;
                codeTextarea.value = codeTextarea.value.substring(0, start) + text + codeTextarea.value.substring(end);
                codeTextarea.selectionStart = codeTextarea.selectionEnd = start + text.length;
                codeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
                alert('Failed to paste content.');
            }
        });

        const handleCloseModal = () => {
            modalBox.classList.add('bounce-out');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                modalBox.classList.remove('bounce-out');
                
                // Revert the slide effect
                mainContentArea.classList.remove('slide-out');
                editorContainer.classList.remove('slide-in');
            }, 400);
        };

        editorCloseBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'flex';
            modalBox.classList.remove('bounce-out');
        });
        closeModalBtn.addEventListener('click', handleCloseModal);
        downloadModalBtn.addEventListener('click', () => {
            downloadButton.click();
            handleCloseModal();
        });

        // Initial load of the specified file
        if (initialFileName) {
            loadOrFetchFile(initialFileName);
        } else {
            loadOrFetchFile('index.html');
        }
    }
    
    function initDbAndListeners(initialFileName) {
        const request = indexedDB.open('code_editor_db', 1);
        request.onupgradeneeded = (e) => {
            appState.db = e.target.result;
            if (!appState.db.objectStoreNames.contains('files')) {
                appState.db.createObjectStore('files', { keyPath: 'name' });
            }
        };
        request.onsuccess = (e) => {
            appState.db = e.target.result;
            initEditorListeners(initialFileName);
        };
        request.onerror = (e) => {
            console.error('IndexedDB error:', e.target.errorCode);
            alert("Error: Unable to use local storage. Please ensure you are running this from a web server.");
        };
    }

    // --- Main App Initialization ---
    setTimeout(() => {
        injectStyles(pageStyles);
        const mainContent = document.getElementById('main-content-area');
        mainContent.classList.add('visible');

        const newFileModal = document.getElementById('new-file-modal');
        const modalTitle = newFileModal.querySelector('.modal-title');
        const fileNameInput = document.getElementById('file-name-input');
        const confirmButton = document.getElementById('confirm-button');
        const cancelButton = document.getElementById('cancel-button');
        const fileUploadInput = document.getElementById('file-upload');
        const wrapper = document.getElementById('action-button-wrapper');

        let currentAction = null;

        function createTransformingButton(options) {
            const container = document.createElement('div');
            container.className = 'transform-button-container';
            const buttonLabel = document.createElement('span');
            buttonLabel.className = 'button-label';
            buttonLabel.textContent = 'Tap to Open';
            const menu = document.createElement('ul');
            menu.className = 'transform-dropdown-menu';

            options.forEach(optionText => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = optionText;
                
                if (optionText === 'New File') {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showModal('Create New File..', 'newFile', true);
                        container.classList.remove('active');
                    });
                } else if (optionText === 'Open File') {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileUploadInput.setAttribute('accept', '.js,.css,.html');
                        fileUploadInput.click();
                        container.classList.remove('active');
                    });
                } else if (optionText === 'Open Zip') {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileUploadInput.setAttribute('accept', '.zip');
                        fileUploadInput.click();
                        container.classList.remove('active');
                    });
                } else if (optionText === 'New Repository') {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showModal('Create New Repository..', 'newRepo', false);
                        container.classList.remove('active');
                    });
                } else {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(`Selected: ${optionText}`);
                        container.classList.remove('active');
                    });
                }
                li.appendChild(a);
                menu.appendChild(li);
            });
            container.appendChild(buttonLabel);
            container.appendChild(menu);
            container.addEventListener('click', (e) => {
                e.stopPropagation();
                container.classList.toggle('active');
            });
            document.addEventListener('click', (e) => {
                if (container.classList.contains('active') && !container.contains(e.target)) {
                    container.classList.remove('active');
                }
            });
            return container;
        }

        function showModal(title, action, requiresExtension) {
            modalTitle.textContent = title;
            currentAction = action;
            fileNameInput.removeEventListener('input', handleInputValidation);
            function handleInputValidation() {
                const value = fileNameInput.value.trim();
                confirmButton.disabled = requiresExtension ? !value.includes('.') : value.length === 0;
            }
            fileNameInput.addEventListener('input', handleInputValidation);
            newFileModal.classList.add('visible');
            fileNameInput.value = '';
            confirmButton.disabled = true;
            fileNameInput.focus();
        }

        function hideModal() {
            newFileModal.classList.remove('visible');
            fileNameInput.value = '';
            confirmButton.disabled = true;
            currentAction = null;
        }

        async function openEditor(fileName) {
            const mainContentArea = document.getElementById('main-content-area');
            const editorContainer = document.getElementById('code-editor-container');
            mainContentArea.classList.add('slide-out');
            
            renderCodeEditor('code-editor-container');
            
            setTimeout(() => {
                editorContainer.classList.add('slide-in');
                initDbAndListeners(fileName); // Initialize DB and then listeners for the file
            }, 50);
        }

        confirmButton.addEventListener('click', () => {
            const value = fileNameInput.value.trim();
            if (value.length > 0) {
                hideModal();
                if (currentAction === 'newFile') {
                    openEditor(value);
                } else if (currentAction === 'newRepo') {
                    repoManager.openRepo(value);
                }
            } else {
                alert('Please enter a valid name.');
            }
        });
        cancelButton.addEventListener('click', hideModal);
        
        fileUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const isZip = file.name.toLowerCase().endsWith('.zip');
                if (isZip) {
                    repoManager.unpackAndOpenRepo(file.name);
                } else {
                    // Note: You would need a way to read the file content here for a full implementation.
                    // For now, this will simply open the editor with the correct filename.
                    openEditor(file.name);
                }
                e.target.value = '';
            }
        });

        const options = ['New File', 'Open File', 'Open Zip', 'New Repository'];
        const myTransformingButton = createTransformingButton(options);
        wrapper.appendChild(myTransformingButton);
    }, 3000);
});

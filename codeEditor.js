// This file can be saved as codeEditor.js

export default function renderCodeEditor(targetElementId) {

    const htmlContent = `
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
                    <h3 id="current-file-name">index.html</h3>
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

    const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');

        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            background-color: #f0f0f0;
            color: #000;
        }

        .app-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            transform: translateX(0);
            transition: transform 0.5s ease-in-out;
        }
        
        .app-container.slide-out {
            transform: translateX(-100%);
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
        
        .main-page {
            position: absolute;
            top: 0;
            left: 100%;
            width: 100%;
            height: 100%;
            background-color: #1c1c1c;
            color: #E0E0E0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            transition: left 0.5s ease-in-out;
        }

        .main-page.slide-in {
            left: 0;
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
        
        .editor-header-right::before {
            content: '';
            position: absolute;
            top: 0;
            right: 100%;
            width: 40px;
            height: 100%;
            background-image: linear-gradient(to right, transparent, #1a1a1a);
            z-index: 2;
            pointer-events: none;
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

    // Inject CSS into the document head
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = cssContent;
    document.head.appendChild(styleSheet);

    // Inject HTML into the target element
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
        targetElement.innerHTML = htmlContent;
    } else {
        console.error('Target element not found: ' + targetElementId);
        return;
    }

    // Now that the elements exist, get references and set up event listeners
    const editorCloseBtn = document.querySelector('.editor-close-btn');
    const appContainer = document.querySelector('.app-container');
    const mainPage = document.getElementById('main-content-area');
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

    const loadedPlugins = {};

    // All the original functions and event listeners
    const loadPluginForFile = async (fileName) => {
        const ext = fileName.slice(fileName.lastIndexOf('.') + 1);
        if (loadedPlugins[ext]) {
            console.log(`Plugin for .${ext} already loaded.`);
            return;
        }
        try {
            const modulePath = `./plugins/${ext}.js`;
            const module = await import(modulePath);
            const { plugin } = module;
            console.log(`Plugin for .${ext} loaded successfully!`);
            loadedPlugins[ext] = plugin;
        } catch (e) {
            console.error(`Failed to load plugin for file type .${ext}.`, e);
        }
    };
    
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

    codeTextarea.addEventListener('scroll', () => {
        numberBar.scrollTop = codeTextarea.scrollTop;
    });
    
    codeTextarea.addEventListener('keyup', highlightActiveLine);
    codeTextarea.addEventListener('click', highlightActiveLine);

    selectAllButton.addEventListener('click', () => {
        codeTextarea.select();
    });

    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeTextarea.value);
            alert('Content copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy. Your browser may require a user action or specific permissions to access the clipboard.');
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
            const event = new Event('input', { bubbles: true });
            codeTextarea.dispatchEvent(event);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('Failed to paste content. Your browser may require a user action or specific permissions to access the clipboard.');
        }
    });

    let db;
    let mockFile = {
        name: 'index.html',
        content: ''
    };

    function initDb() {
        const request = indexedDB.open('code_editor_db', 1);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            loadFileIntoEditor();
        };
        request.onerror = (e) => {
            console.error('IndexedDB error:', e.target.errorCode);
        };
    }

    function loadFileIntoEditor() {
        if (!db) return;
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.get(mockFile.name);
        request.onsuccess = (e) => {
            const file = e.target.result;
            if (file) {
                mockFile = file;
            } else {
                saveFile(mockFile.name, mockFile.content);
            }
            currentFileName.textContent = mockFile.name;
            codeTextarea.value = mockFile.content;
            updateLineNumbers();
            loadPluginForFile(mockFile.name);
        };
    }

    function saveFile(fileName, content) {
        if (!db) return;
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        const fileToSave = {
            name: fileName,
            content: content,
            createdDate: new Date().getTime(),
            size: new Blob([content]).size
        };
        objectStore.put(fileToSave);
        transaction.oncomplete = () => {
            console.log('File saved successfully.');
        };
    }

    editorCloseBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
        modalBox.classList.remove('bounce-out');
    });
    
    const handleCloseModal = () => {
        modalBox.classList.add('bounce-out');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            modalBox.classList.remove('bounce-out');
            
            // Revert the slide effect
            const mainContentArea = document.getElementById('main-content-area');
            const editorContainer = document.getElementById('code-editor-container');
            
            mainContentArea.classList.remove('slide-out');
            editorContainer.classList.remove('slide-in');

        }, 400);
    };

    closeModalBtn.addEventListener('click', handleCloseModal);
    
    downloadModalBtn.addEventListener('click', () => {
        downloadButton.click();
        handleCloseModal();
    });

    codeTextarea.addEventListener('input', updateLineNumbers);
    
    initDb();
}

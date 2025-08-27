document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.db.ready;
    } catch (e) {
        console.error("Failed to initialize database:", e);
        document.getElementById('app-container').innerHTML = '<div class="error-state"><h1>Failed to Load App</h1><p>Please check your connection and try again.</p></div>';
        return;
    }

    const appContainer = document.getElementById('app-container');
    const modal = document.getElementById('modal');
    const optionsContainer = document.getElementById('options-container');
    const createNewFileBtn = document.getElementById('create-new-file-btn');
    const newRepoBtn = document.getElementById('new-repo-btn');
    const inputSection = document.getElementById('input-section');
    const filenameInput = document.getElementById('filename');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const filenameTitle = document.getElementById('filename-title');

    // Helper function for SVG icons (unchanged)
    const getIconSvg = (name) => {
        const icons = {
            // ... (SVG definitions unchanged) ...
            newFile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`,
            openFile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
            fileExplorer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>`,
            repository: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><line x1="18" y1="6" x2="18" y2="18"></line><path d="M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M13 6h3.5a4.5 4.5 0 0 1 4.5 4.5v1"></path></svg>`,
            settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.83 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 5.12 19.4a1.65 1.65 0 0 0-1.82-.33L3.25 19.4a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83l2.83-2.83a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 12.88 2.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a2 2 0 0 1 2 2h.09a1.65 1.65 0 0 0 1.51 1z"></path></svg>`,
            profile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            recent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M12 8v4l3 3"></path></svg>`,
            search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
            add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
            git: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4z"></path><path d="M22 6h-4"></path><path d="M14 14h-4"></path></svg>`,
            ai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11h2c-.5-3.32-3.8-6-7-6-3.79 0-7 2.21-7 6s3.21 6 7 6a6.99 6.99 0 005.18-2.52L17.5 15.5 19 14l-4.5-4.5zM7 7c2.42 0 4.5 2.1 4.5 4.5S9.42 16 7 16s-4.5-2.1-4.5-4.5S4.58 7 7 7z"/></svg>`,
            save: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
            download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
            share: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>`,
            copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
            options: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>`,
        };
        return icons[name] || '';
    };

    // Command Bar elements
    const commandBar = document.createElement('div');
    commandBar.className = 'command-bar';
    commandBar.innerHTML = `
        <a href="#" class="command-btn active" data-page="home">
            ${getIconSvg('home')}
            <span>Home</span>
        </a>
        <a href="#" class="command-btn" data-page="explore">
            ${getIconSvg('fileExplorer')}
            <span>Files</span>
        </a>
        <a href="#" class="command-btn" data-page="ai">
            ${getIconSvg('ai')}
            <span>AI</span>
        </a>
        <a href="#" class="command-btn" data-page="settings">
            ${getIconSvg('settings')}
            <span>Settings</span>
        </a>
        <a href="#" class="command-btn" data-page="new">
            ${getIconSvg('add')}
            <span>New</span>
        </a>
    `;
    document.body.appendChild(commandBar);

    // Initial page load
    renderPage('home');

    // Page navigation logic
    document.querySelectorAll('.command-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            if (page === 'new') {
                showModal('options');
            } else {
                renderPage(page);
            }
        });
    });

    function renderPage(pageName, data = {}) {
        document.querySelectorAll('.command-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.command-btn[data-page="${pageName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        appContainer.innerHTML = '';
        hideModal();

        // Apply page-specific classes for layout
        appContainer.className = `page-${pageName}`;

        // Clear existing dropdowns to prevent duplicates
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove());

        switch (pageName) {
            case 'home':
                renderHomePage();
                break;
            case 'explore':
                renderFileExplorerPage();
                break;
            case 'ai':
                renderAIPage();
                break;
            case 'settings':
                appContainer.innerHTML = '<main class="page-content center-content"><h2>Settings</h2><p>Customize your experience here.</p></main>';
                break;
            case 'editor':
                renderCodeEditorPage(data);
                break;
            default:
                appContainer.innerHTML = '<main class="page-content center-content"><h2>Page Not Found</h2><p>The page you requested does not exist.</p></main>';
                break;
        }
    }

    // Home Screen Rendering
    async function renderHomePage() {
        const files = await window.db.getAllItems('files');
        const recentProjectsHtml = files.slice(-10).reverse().map(file => `
            <a href="#" class="project-card" data-file-id="${file.id}">
                <div class="project-icon">${getIconSvg('newFile')}</div>
                <div class="project-info">
                    <span class="project-title">${file.name}</span>
                    <span class="project-date">Last edited: ${new Date(file.timestamp).toLocaleDateString()}</span>
                </div>
            </a>
        `).join('');

        appContainer.innerHTML = `
            <main class="page-content home-page">
                <div class="logo">
                    <h1 class="titan">TITAN</h1>
                    <span class="developer">Developer</span>
                </div>
                <div class="recent-projects-header">
                    <h2>Recent Projects</h2>
                    <a href="#" onclick="renderPage('explore'); return false;">View All</a>
                </div>
                <div class="recent-projects-scroll-container">
                    <div class="recent-projects-grid">
                        ${recentProjectsHtml || '<div class="no-projects">No recent projects. Create one now!</div>'}
                    </div>
                </div>
            </main>
        `;
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                e.preventDefault();
                const fileId = parseInt(card.dataset.fileId);
                const file = await window.db.getItemById('files', fileId);
                if (file) {
                    renderPage('editor', { file });
                } else {
                    alert('File not found.');
                }
            });
        });
    }

    // AI Page Rendering
    function renderAIPage() {
        appContainer.innerHTML = `
            <main class="page-content ai-page">
                <div class="ai-header">
                    <h2>Titan AI</h2>
                </div>
                <div class="chat-history">
                    <div class="chat-message titan-ai-message">Hello! I'm Titan AI. How can I help with your code today?</div>
                </div>
                <div class="input-area">
                    <textarea id="titan-ai-prompt-input" placeholder="Ask AI to write code..."></textarea>
                    <button id="titan-ai-send-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </main>
        `;

        const chatHistory = document.querySelector('.chat-history');
        const promptInput = document.getElementById('titan-ai-prompt-input');
        const sendBtn = document.getElementById('titan-ai-send-btn');

        sendBtn.addEventListener('click', async () => {
            const userMessage = promptInput.value.trim();
            if (userMessage === '') return;
            
            chatHistory.innerHTML += `<div class="chat-message user-message">${userMessage}</div>`;
            promptInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            chatHistory.innerHTML += `<div class="chat-message titan-ai-message loading-message">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
            </div>`;
            chatHistory.scrollTop = chatHistory.scrollHeight;

            await new Promise(resolve => setTimeout(resolve, 2000));

            const lastMessage = chatHistory.lastElementChild;
            lastMessage.innerHTML = `The AI has generated some amazing code for you! 🤖`;
            chatHistory.scrollTop = chatHistory.scrollHeight;
        });
    }

    // File Explorer Page Rendering
    async function renderFileExplorerPage() {
        const files = await window.db.getAllItems('files');
        const fileListHtml = files.map(file => {
            const fileType = window.fileEngine.getFileType(file.name);
            const iconSvg = window.fileEngine.getIconSvg(fileType);
            return `
                <a href="#" class="file-item" data-file-id="${file.id}">
                    <div class="file-icon ${fileType}">
                        ${iconSvg}
                    </div>
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                    </div>
                </a>
            `;
        }).join('');

        appContainer.innerHTML = `
            <main class="page-content file-explorer-page">
                <header class="file-explorer-header sticky-header">
                    <h2 class="header-title">Files</h2>
                    <div class="header-buttons right">
                        <button class="nav-btn" data-action="edit">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </button>
                        <button class="nav-btn" data-action="options">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                </header>
                <div class="file-list scrollable-content">
                    ${fileListHtml || '<p class="no-files">No files found. Tap the "New" button to create one.</p>'}
                </div>
            </main>
        `;
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const fileId = parseInt(item.dataset.fileId);
                const file = await window.db.getItemById('files', fileId);
                if (file) {
                    renderPage('editor', { file });
                } else {
                    alert('File not found.');
                }
            });
        });
    }

    // Code Editor Page Rendering
    function renderCodeEditorPage(data) {
        const file = data.file || { name: 'untitled', content: '' };

        appContainer.innerHTML = `
            <main class="page-content code-editor-page">
                <header class="editor-header sticky-header">
                    <div class="header-buttons left">
                        <button class="nav-btn" id="editor-back-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    </div>
                    <h2 class="header-title">${file.name}</h2>
                    <div class="header-buttons right">
                        <button class="nav-btn dropdown-trigger" id="editor-file-menu">
                            ${getIconSvg('options')}
                        </button>
                    </div>
                </header>
                <div class="code-editor-container scrollable-content">
                    <div class="line-numbers"></div>
                    <textarea id="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
                    <pre class="syntax-highlighting-layer" aria-hidden="true"></pre>
                </div>
            </main>
        `;

        document.getElementById('editor-back-btn').addEventListener('click', () => renderPage('explore'));

        const editor = document.getElementById('code-editor');
        const lineNumbers = document.querySelector('.line-numbers');
        const highlighter = document.querySelector('.syntax-highlighting-layer');

        let codeContent = file.content || '';
        editor.value = codeContent;

        const updateLineNumbers = () => {
            const lineCount = editor.value.split('\n').length;
            lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
        };
        
        const updateSyntaxHighlighting = () => {
            const highlightedCode = window.fileEngine.highlightCode(editor.value, file.name);
            highlighter.innerHTML = highlightedCode;
        };

        const updateEditor = () => {
            updateLineNumbers();
            updateSyntaxHighlighting();
            highlighter.style.width = `${editor.scrollWidth}px`;
            highlighter.style.height = `${editor.scrollHeight}px`;
        };

        editor.addEventListener('input', updateEditor);
        editor.addEventListener('scroll', () => {
            lineNumbers.scrollTop = editor.scrollTop;
            highlighter.scrollTop = editor.scrollTop;
            lineNumbers.scrollLeft = editor.scrollLeft;
            highlighter.scrollLeft = editor.scrollLeft;
        });

        // Initial update
        updateEditor();

        // Dropdown menu logic
        const fileMenuBtn = document.getElementById('editor-file-menu');
        fileMenuBtn.addEventListener('click', (e) => {
            const existingMenu = document.querySelector('.dropdown-menu');
            if (existingMenu) {
                existingMenu.remove();
                return;
            }

            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            menu.innerHTML = `
                <button data-action="save">${getIconSvg('save')} Save</button>
                <button data-action="download">${getIconSvg('download')} Download</button>
                <button data-action="share">${getIconSvg('share')} Share</button>
                <button data-action="copy">${getIconSvg('copy')} Copy All</button>
            `;
            menu.style.top = `${e.currentTarget.offsetTop + e.currentTarget.offsetHeight + 10}px`;
            menu.style.right = '20px';
            document.body.appendChild(menu);

            // Add event listeners for menu items
            menu.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async (event) => {
                    const action = event.currentTarget.dataset.action;
                    const content = editor.value;
                    try {
                        switch (action) {
                            case 'save':
                                await window.db.updateItem('files', file.id, { content });
                                alert('File saved successfully!');
                                break;
                            case 'download':
                                window.fileEngine.downloadFile(file.name, content);
                                break;
                            case 'share':
                                window.fileEngine.shareFile(file.name, content);
                                break;
                            case 'copy':
                                await navigator.clipboard.writeText(content);
                                alert('Code copied to clipboard!');
                                break;
                        }
                    } catch (e) {
                        alert('An error occurred.');
                        console.error(e);
                    }
                    menu.remove();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (closeEvent) => {
                if (!menu.contains(closeEvent.target) && !fileMenuBtn.contains(closeEvent.target)) {
                    menu.remove();
                }
            }, { once: true });
        });
    }

    // Modal logic (unchanged from previous)
    function showModal(type) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
            if (type === 'options') {
                optionsContainer.classList.remove('hidden');
                inputSection.classList.add('hidden');
            } else if (type === 'input') {
                optionsContainer.classList.add('hidden');
                inputSection.classList.remove('hidden');
            }
        }, 10);
    }

    function hideModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            optionsContainer.classList.remove('hidden');
            inputSection.classList.add('hidden');
            filenameInput.value = '';
            filenameInput.disabled = true;
            confirmBtn.classList.remove('enabled');
            confirmBtn.disabled = true;
        }, 300);
    }

    createNewFileBtn.addEventListener('click', () => {
        filenameTitle.textContent = 'New File';
        filenameInput.placeholder = 'e.g., index.html';
        showModal('input');
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    newRepoBtn.addEventListener('click', () => {
        filenameTitle.textContent = 'New Repository';
        filenameInput.placeholder = 'e.g., my-pwa-project';
        showModal('input');
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
        hideModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'cancel-btn') {
            hideModal();
        }
    });

    filenameInput.addEventListener('input', () => {
        if (filenameInput.value.trim().length > 0) {
            confirmBtn.classList.add('enabled');
            confirmBtn.disabled = false;
        } else {
            confirmBtn.classList.remove('enabled');
            confirmBtn.disabled = true;
        }
    });

    confirmBtn.addEventListener('click', async () => {
        const name = filenameInput.value.trim();
        if (name === '') return;

        const store = filenameTitle.textContent === 'New File' ? 'files' : 'repositories';
        const newItem = { name, timestamp: Date.now() };

        try {
            const newItemId = await window.db.addItem(store, newItem);
            console.log(`${store === 'files' ? 'File' : 'Repository'} created:`, newItem);
            hideModal();
            if (store === 'files') {
                const createdFile = await window.db.getItemById('files', newItemId);
                renderPage('editor', { file: createdFile });
            } else {
                renderPage('explore'); // For repositories, just go to the explorer
            }
        } catch (e) {
            console.error("Error creating item:", e);
            window.logCustomError("Failed to create new item", e);
            alert("An error occurred. Please try again.");
        }
    });
});

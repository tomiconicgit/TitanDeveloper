/*
File: /app.js
*/

// This file orchestrates the entire application, handling UI rendering,
// user interactions, and page navigation.

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for the database to be ready before initializing the app.
    try {
        await window.db.ready;
    } catch (e) {
        console.error("Failed to initialize database:", e);
        document.getElementById('app-container').innerHTML = '<div class="error-state"><h1>Failed to Load App</h1><p>Please check your connection and try again.</p></div>';
        return;
    }

    // --- Core UI & State Management ---
    const appContainer = document.getElementById('app-container');
    const modal = document.getElementById('modal');
    const optionsContainer = document.getElementById('options-container');
    const inputSection = document.getElementById('input-section');
    const filenameInput = document.getElementById('filename');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const filenameTitle = document.getElementById('filename-title');
    const newFileBtn = document.getElementById('create-new-file-btn');
    const newRepoBtn = document.getElementById('new-repo-btn');

    // State object to manage app-wide variables
    const state = {
        currentPage: 'home',
        currentView: 'files',
    };

    // View Manager for handling page transitions and state
    const viewManager = {
        history: ['home'],
        push(pageName, data = {}) {
            if (this.history[this.history.length - 1] !== pageName) {
                this.history.push(pageName);
            }
            renderPage(pageName, data);
        },
        pop() {
            if (this.history.length > 1) {
                this.history.pop();
                const lastPage = this.history[this.history.length - 1];
                renderPage(lastPage);
            }
        },
        reset() {
            this.history = ['home'];
            renderPage('home');
        },
    };

    // --- Event Listeners & Router ---
    document.getElementById('back-button')?.addEventListener('click', () => {
        viewManager.pop();
    });

    document.getElementById('new-item-button')?.addEventListener('click', () => {
        showModal('options');
    });

    newFileBtn.addEventListener('click', () => {
        showModal('input', { type: 'file' });
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    newRepoBtn.addEventListener('click', () => {
        showModal('input', { type: 'repo' });
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
        const newItem = { name, content: '' };
        if (store === 'files' && options.repoId) {
            newItem.repositoryId = options.repoId;
        }

        try {
            const newItemId = await window.db.addItem(store, newItem);
            console.log(`${store === 'files' ? 'File' : 'Repository'} created:`, newItem);
            hideModal();
            if (store === 'files') {
                const createdFile = await window.db.getItemById('files', newItemId);
                viewManager.push('editor', { file: createdFile });
            } else {
                renderMainContent();
            }
        } catch (e) {
            console.error("Error creating item:", e);
            window.logCustomError("Failed to create new item", e);
            alert("An error occurred. Please try again.");
        }
    });

    // Handle incoming errors from the error.js module
    document.addEventListener('app-error', (e) => {
        console.warn('App-level error received:', e.detail);
    });

    // Initialize the app
    viewManager.push('home');

    // --- UI Rendering Functions ---
    async function renderPage(pageName, data = {}) {
        state.currentPage = pageName;
        appContainer.innerHTML = '';
        hideModal();

        switch (pageName) {
            case 'home':
                renderHomePage();
                break;
            case 'editor':
                renderCodeEditorPage(data);
                break;
            case 'repo-tree':
                renderRepoTreePage(data);
                break;
            default:
                appContainer.innerHTML = '<div class="error-state"><h1>Page Not Found</h1><p>The page you requested does not exist.</p></div>';
                break;
        }
    }

    function updateNavPill() {
        const navPill = document.getElementById('nav-pill');
        const navPillFiles = document.getElementById('nav-pill-files');
        const navPillRepos = document.getElementById('nav-pill-repos');

        if (!navPill || !navPillFiles || !navPillRepos) {
            console.warn("Nav pill elements not found. Skipping update.");
            return;
        }

        if (state.currentView === 'files') {
            navPill.style.transform = 'translateX(0)';
            navPillFiles.classList.add('active');
            navPillRepos.classList.remove('active');
        } else {
            navPill.style.transform = 'translateX(100%)';
            navPillFiles.classList.remove('active');
            navPillRepos.classList.add('active');
        }
    }

    async function renderHomePage() {
        document.querySelector('.app-header')?.classList.add('hidden');
        document.querySelector('.home-header')?.classList.remove('hidden');

        appContainer.innerHTML = `
            <div class="main-content-container">
                <div class="page-header home-header">
                    <div class="nav-pill-container">
                        <div id="nav-pill" class="nav-pill"></div>
                        <button id="nav-pill-files" class="nav-pill-button active">Files</button>
                        <button id="nav-pill-repos" class="nav-pill-button">Repository</button>
                    </div>
                    <button id="new-item-button" class="nav-btn">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                </div>
                <div id="main-content" class="scrollable-content"></div>
            </div>
        `;
        document.getElementById('nav-pill-files').addEventListener('click', () => {
            state.currentView = 'files';
            updateNavPill();
            renderMainContent();
        });
        document.getElementById('nav-pill-repos').addEventListener('click', () => {
            state.currentView = 'repositories';
            updateNavPill();
            renderMainContent();
        });
        document.getElementById('new-item-button').addEventListener('click', () => showModal('options'));

        updateNavPill();
        renderMainContent();
    }

    async function renderMainContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        if (state.currentView === 'files') {
            const files = await window.db.getAllItems('files');
            const fileListHtml = files.filter(file => !file.repositoryId).map(file => {
                const fileType = window.fileEngine.getFileType(file.name);
                const fileIconClass = window.fileEngine.getFileIconClass(fileType);
                return `
                    <div class="file-item" data-id="${file.id}" data-type="file">
                        <div class="file-icon-bg ${fileIconClass}">
                            <svg>${window.fileEngine.getIconSvg(fileType)}</svg>
                        </div>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="file-actions">
                            <button class="nav-btn dropdown-trigger">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            mainContent.innerHTML = fileListHtml || '<div class="no-items">No files found. Tap the "plus" button to create one.</div>';
            mainContent.querySelectorAll('.file-item').forEach(item => {
                item.addEventListener('click', async (e) => {
                    const id = parseInt(item.dataset.id);
                    const file = await window.db.getItemById('files', id);
                    if (file) {
                        viewManager.push('editor', { file });
                    }
                });
            });
        } else if (state.currentView === 'repositories') {
            const repos = await window.db.getAllItems('repositories');
            const repoListHtml = repos.map(repo => `
                <div class="file-item" data-id="${repo.id}" data-type="repo">
                    <div class="file-icon-bg repo-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${repo.name}</span>
                        <span class="file-date">Last modified: ${new Date(repo.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="file-actions">
                        <button class="nav-btn dropdown-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
            `).join('');
            mainContent.innerHTML = repoListHtml || '<div class="no-items">No repositories found. Create one to get started!</div>';
            mainContent.querySelectorAll('.file-item[data-type="repo"]').forEach(item => {
                item.addEventListener('click', async (e) => {
                    const id = parseInt(item.dataset.id);
                    const repo = await window.db.getItemById('repositories', id);
                    if (repo) {
                        viewManager.push('repo-tree', { repo });
                    }
                });
            });
        }
    }

    async function renderRepoTreePage(data) {
        const repo = data.repo || { name: 'Unknown', id: null };
        document.querySelector('.app-header')?.classList.remove('hidden');
        document.querySelector('.home-header')?.classList.add('hidden');

        appContainer.innerHTML = `
            <div class="repo-tree-page">
                <header class="page-header">
                    <button id="repo-back-btn" class="nav-btn back-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <div class="header-file-info">
                        <div class="file-icon-bg repo-bg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h2 class="header-title">${repo.name}</h2>
                    </div>
                    <div class="header-buttons right">
                        <button class="nav-btn" id="new-item-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </button>
                    </div>
                </header>
                <div id="repo-content" class="scrollable-content repo-tree"></div>
            </div>
        `;

        document.getElementById('repo-back-btn').addEventListener('click', () => viewManager.pop());
        document.getElementById('new-item-button').addEventListener('click', () => showModal('options', { repoId: repo.id }));

        const repoContent = document.getElementById('repo-content');
        const files = await window.db.getAllItems('files');
        const repoFiles = files.filter(file => file.repositoryId === repo.id && !file.parentId);
        const repoListHtml = repoFiles.map(file => {
            const fileType = window.fileEngine.getFileType(file.name);
            const fileIconClass = window.fileEngine.getFileIconClass(fileType);
            return `
                <div class="file-item" data-id="${file.id}" data-type="file">
                    <div class="file-icon-bg ${fileIconClass}">
                        <svg>${window.fileEngine.getIconSvg(fileType)}</svg>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="file-actions">
                        <button class="nav-btn dropdown-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        repoContent.innerHTML = repoListHtml || '<div class="no-items">No files in this repository. Create one to get started!</div>';

        repoContent.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const id = parseInt(item.dataset.id);
                const file = await window.db.getItemById('files', id);
                if (file) {
                    viewManager.push('editor', { file });
                }
            });
        });
    }

    async function renderCodeEditorPage(data) {
        document.querySelector('.app-header')?.classList.remove('hidden');
        document.querySelector('.home-header')?.classList.add('hidden');
        const file = data.file || { name: 'untitled', content: '' };

        const fileType = window.fileEngine.getFileType(file.name);
        const fileIconClass = window.fileEngine.getFileIconClass(fileType);

        appContainer.innerHTML = `
            <div class="code-editor-page">
                <header class="page-header editor-header">
                    <button id="editor-back-btn" class="nav-btn back-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <div class="header-file-info">
                        <div class="file-icon-bg ${fileIconClass} mini-icon">
                            <svg>${window.fileEngine.getIconSvg(fileType)}</svg>
                        </div>
                        <h2 class="header-title">${file.name}</h2>
                    </div>
                    <div class="header-buttons right">
                        <button class="nav-btn dropdown-trigger" id="editor-file-menu">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </header>
                <div class="code-editor-container">
                    <div class="line-numbers"></div>
                    <textarea id="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
                    <pre class="syntax-highlighting-layer" aria-hidden="true"></pre>
                </div>
            </div>
        `;

        document.getElementById('editor-back-btn').addEventListener('click', () => viewManager.pop());

        const editor = document.getElementById('code-editor');
        const lineNumbers = document.querySelector('.line-numbers');
        const highlighter = document.querySelector('.syntax-highlighting-layer');

        let codeContent = file.content || '';
        editor.value = codeContent;

        const updateLineNumbers = () => {
            const lines = editor.value.split('\n');
            const lineCount = lines.length;
            const numbers = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
            lineNumbers.innerHTML = numbers;
        };

        const updateSyntaxHighlighting = () => {
            const highlightedCode = window.fileEngine.highlightCode(editor.value, file.name);
            highlighter.innerHTML = highlightedCode;
        };

        const syncScroll = () => {
            lineNumbers.scrollTop = editor.scrollTop;
            highlighter.scrollTop = editor.scrollTop;
            highlighter.scrollLeft = editor.scrollLeft;
        };

        const updateEditor = () => {
            updateLineNumbers();
            updateSyntaxHighlighting();
            syncScroll();
        };

        editor.addEventListener('input', updateEditor);
        editor.addEventListener('scroll', syncScroll);

        // Enhanced bracket matching and auto-indent
        editor.addEventListener('keydown', (e) => {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const text = editor.value;

            // Auto-indent on Enter
            if (e.key === 'Enter') {
                e.preventDefault();
                const currentLine = text.substring(0, start).split('\n').pop();
                const indent = currentLine.match(/^\s*/)[0];
                const newText = text.substring(0, start) + '\n' + indent + text.substring(end);
                editor.value = newText;
                editor.selectionStart = editor.selectionEnd = start + indent.length + 1;
                updateEditor();
                return;
            }

            // Auto-close brackets/quotes
            const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
            const key = e.key;
            if (pairs[key]) {
                e.preventDefault();
                const newText = text.substring(0, start) + key + pairs[key] + text.substring(end);
                editor.value = newText;
                editor.selectionStart = editor.selectionEnd = start + 1;
                updateEditor();
                return;
            }

            // Auto-indent on closing brace
            if (key === '}' && text[start - 1] === '{') {
                e.preventDefault();
                const currentLine = text.substring(0, start).split('\n').pop();
                const indent = currentLine.match(/^\s*/)[0];
                const newText = text.substring(0, start) + '}' + '\n' + indent.slice(0, -2) + text.substring(end);
                editor.value = newText;
                editor.selectionStart = editor.selectionEnd = start + 1;
                updateEditor();
                return;
            }
        });

        // Resize handler for responsiveness
        const resizeEditor = () => {
            editor.style.width = `${window.innerWidth - 50}px`; /* Adjust for line numbers */
            highlighter.style.width = `${window.innerWidth - 50}px`;
            updateEditor();
        };

        window.addEventListener('resize', resizeEditor);
        resizeEditor();

        // Save file on editor blur or every 3 seconds
        let saveTimeout = null;
        editor.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                await window.db.updateItem('files', file.id, { content: editor.value });
                console.log('Autosaved.');
            }, 3000);
        });

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
                <button data-action="save">Save</button>
                <button data-action="download">Download</button>
                <button data-action="copy">Copy All</button>
            `;
            menu.style.top = `${e.currentTarget.offsetTop + e.currentTarget.offsetHeight + 10}px`;
            menu.style.right = '20px';
            document.body.appendChild(menu);

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

            document.addEventListener('click', (closeEvent) => {
                if (!menu.contains(closeEvent.target) && !fileMenuBtn.contains(closeEvent.target)) {
                    menu.remove();
                }
            }, { once: true });
        });
    }

    function showModal(type, options = {}) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
            if (type === 'options') {
                optionsContainer.classList.remove('hidden');
                inputSection.classList.add('hidden');
            } else if (type === 'input') {
                optionsContainer.classList.add('hidden');
                inputSection.classList.remove('hidden');
                if (options.type === 'file') {
                    filenameTitle.textContent = 'New File';
                    filenameInput.placeholder = 'e.g., index.html';
                } else if (options.type === 'repo') {
                    filenameTitle.textContent = 'New Repository';
                    filenameInput.placeholder = 'e.g., my-pwa-project';
                }
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
});
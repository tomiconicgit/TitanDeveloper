/*
File: /app.js
*/

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
    const inputSection = document.getElementById('input-section');
    const filenameInput = document.getElementById('filename');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const filenameTitle = document.getElementById('filename-title');
    const newFileBtn = document.getElementById('create-new-file-btn');
    const newRepoBtn = document.getElementById('new-repo-btn');
    const newFolderBtn = document.getElementById('new-folder-btn');

    const state = {
        currentPage: 'home',
        currentView: 'files',
        currentRepoId: null,
        expandedFolders: new Set(),
        currentParentId: null,
    };

    const viewManager = {
        history: [{ page: 'home', data: {} }],
        push(pageName, data = {}) {
            if (this.history[this.history.length - 1].page !== pageName) {
                this.history.push({ page: pageName, data });
            }
            renderPage(pageName, data);
        },
        pop() {
            if (this.history.length > 1) {
                this.history.pop();
                const lastPage = this.history[this.history.length - 1];
                renderPage(lastPage.page, lastPage.data);
            }
        },
        reset() {
            this.history = [{ page: 'home', data: {} }];
            renderPage('home');
        },
    };

    function showModal(type, data = {}) {
        modal.classList.remove('hidden');
        optionsContainer.classList.add('hidden');
        inputSection.classList.add('hidden');
        if (type === 'options') {
            optionsContainer.classList.remove('hidden');
        } else if (type === 'input') {
            inputSection.classList.remove('hidden');
            filenameTitle.textContent = `New ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`;
            filenameInput.value = '';
            filenameInput.focus();
        }
    }

    function hideModal() {
        modal.classList.add('hidden');
        optionsContainer.classList.add('hidden');
        inputSection.classList.add('hidden');
        filenameInput.value = '';
        confirmBtn.classList.remove('enabled');
        confirmBtn.disabled = true;
    }

    newFileBtn.addEventListener('click', () => showModal('input', { type: 'file' }));
    newRepoBtn.addEventListener('click', () => showModal('input', { type: 'repo' }));
    newFolderBtn.addEventListener('click', () => showModal('input', { type: 'folder' }));
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
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

        const type = filenameTitle.textContent === 'New File' ? 'file' : (filenameTitle.textContent === 'New Folder' ? 'folder' : 'repo');
        const store = type === 'repo' ? 'repositories' : 'files';
        const newItem = { name, content: '' };
        if (type !== 'repo') {
            newItem.type = type;
            newItem.repositoryId = state.currentRepoId;
            if (state.currentParentId) newItem.parentId = state.currentParentId;
        }

        try {
            const newItemId = await window.db.addItem(store, newItem);
            hideModal();
            if (type === 'file') {
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

    document.getElementById('back-button')?.addEventListener('click', () => viewManager.pop());

    document.getElementById('new-item-button')?.addEventListener('click', () => {
        showModal('options');
    });

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

        if (!navPill || !navPillFiles || !navPillRepos) return;

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
                        <button id="nav-pill-repos" class="nav-pill-button">Repositories</button>
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
            const fileListHtml = files.map(file => {
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
            mainContent.innerHTML = fileListHtml || '<div class="no-items">No files found. Tap the "+" button to create one.</div>';
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

    async function renderCodeEditorPage(data) {
        const file = data.file || { name: 'untitled', content: '' };
        const fileType = window.fileEngine.getFileType(file.name);
        const fileIconClass = window.fileEngine.getFileIconClass(fileType);

        appContainer.innerHTML = `
            <div class="code-editor-page">
                <header class="page-header editor-header">
                    <button id="editor-back-btn" class="nav-btn back-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
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
            lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
            highlighter.innerHTML = window.fileEngine.highlightCode(codeContent, file.name);
        };

        editor.addEventListener('input', () => {
            codeContent = editor.value;
            updateLineNumbers();
            window.db.updateItem('files', data.file.id, { content: codeContent });
        });

        editor.addEventListener('scroll', () => {
            highlighter.scrollTop = editor.scrollTop;
            lineNumbers.scrollTop = editor.scrollTop;
        });

        updateLineNumbers();
    }

    viewManager.push('home');
});
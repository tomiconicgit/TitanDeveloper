/*
File: /app.js
*/

document.addEventListener('DOMContentLoaded', async () => {
    console.log("App initialized");
    try {
        await window.db.ready;
        console.log("DB ready");
    } catch (e) {
        console.error("Failed to initialize database:", e);
        window.logCustomError("Database initialization failed", e);
        document.getElementById('app-container').innerHTML = '<div class="error-display"><h1>Database Error</h1><p>Could not connect to storage. Please refresh and try again.</p></div>';
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
            console.log("Rendering page:", pageName);
            renderPage(pageName, data);
        },
        pop() {
            if (this.history.length > 1) {
                this.history.pop();
                const lastPage = this.history[this.history.length - 1];
                renderPage(lastPage.page, lastPage.data);
            }
        },
    };

    document.addEventListener('app-error', (e) => {
        console.warn('App-level error:', e.detail);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-display';
        errorDiv.innerHTML = `<h3>Error</h3><p>${e.detail.message}</p>`;
        appContainer.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    });

    cancelBtn.addEventListener('click', () => hideModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'cancel-btn') hideModal();
    });

    filenameInput.addEventListener('input', () => {
        confirmBtn.classList.toggle('enabled', filenameInput.value.trim().length > 0);
        confirmBtn.disabled = filenameInput.value.trim().length === 0;
    });

    newFileBtn.addEventListener('click', () => {
        showModal('input', { type: 'file', repoId: state.currentRepoId, parentId: state.currentParentId });
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    newRepoBtn.addEventListener('click', () => {
        showModal('input', { type: 'repo' });
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    newFolderBtn.addEventListener('click', () => {
        showModal('input', { type: 'folder', repoId: state.currentRepoId, parentId: state.currentParentId });
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    confirmBtn.addEventListener('click', async () => {
        const name = filenameInput.value.trim();
        if (!name) return;

        const isRename = filenameTitle.textContent === 'Rename';
        const store = isRename || filenameTitle.textContent.includes('Repository') ? 'repositories' : 'files';
        const newItem = {
            name,
            content: store === 'files' && filenameTitle.textContent !== 'New Folder' ? '' : null,
            type: store === 'files' ? (filenameTitle.textContent === 'New Folder' ? 'folder' : 'file') : null,
            repositoryId: store === 'files' ? state.currentRepoId : null,
            parentId: store === 'files' ? state.currentParentId : null,
        };

        try {
            if (isRename) {
                await window.db.updateItem(options.store, options.itemId, { name });
            } else {
                await window.db.addItem(store, newItem);
            }
            hideModal();
            if (store === 'files' && state.currentRepoId) {
                const repo = await window.db.getItemById('repositories', state.currentRepoId);
                viewManager.push('repo-tree', { repo });
            } else {
                renderMainContent();
            }
        } catch (e) {
            console.error("Error creating/updating item:", e);
            window.logCustomError("Failed to create/update item", e);
        }
    });

    async function renderPage(pageName, data = {}) {
        state.currentPage = pageName;
        state.currentRepoId = pageName === 'repo-tree' && data.repo ? data.repo.id : null;
        state.currentParentId = null;
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
                appContainer.innerHTML = '<div class="error-display"><h1>Page Not Found</h1><p>The page you requested does not exist.</p></div>';
        }
    }

    function updateNavPill() {
        const navPill = document.getElementById('nav-pill');
        const navPillFiles = document.getElementById('nav-pill-files');
        const navPillRepos = document.getElementById('nav-pill-repos');
        if (!navPill || !navPillFiles || !navPillRepos) return;

        navPill.style.transform = state.currentView === 'files' ? 'translateX(0)' : 'translateX(100%)';
        navPillFiles.classList.toggle('active', state.currentView === 'files');
        navPillRepos.classList.toggle('active', state.currentView === 'repositories');
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
        await renderMainContent();
    }

    async function renderMainContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error("Main content container not found");
            return;
        }

        if (state.currentView === 'files') {
            const files = await window.db.getAllItems('files');
            const fileListHtml = files.filter(file => !file.repositoryId && file.type === 'file').map(file => {
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
                    if (e.target.closest('.dropdown-trigger')) return;
                    const id = parseInt(item.dataset.id);
                    const file = await window.db.getItemById('files', id);
                    if (file) viewManager.push('editor', { file });
                });
                item.querySelector('.dropdown-trigger').addEventListener('click', (e) => showItemMenu(e, item.dataset.id, 'file'));
            });
        } else if (state.currentView === 'repositories') {
            const repos = await window.db.getAllItems('repositories');
            const repoListHtml = repos.map(repo => `
                <div class="file-item repo-item" data-id="${repo.id}" data-type="repo">
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
            mainContent.querySelectorAll('.repo-item').forEach(item => {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.dropdown-trigger')) return;
                    const id = parseInt(item.dataset.id);
                    const repo = await window.db.getItemById('repositories', id);
                    if (repo) viewManager.push('repo-tree', { repo });
                });
                item.querySelector('.dropdown-trigger').addEventListener('click', (e) => showItemMenu(e, item.dataset.id, 'repo'));
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

        await renderRepoContent(repo.id, document.getElementById('repo-content'));
    }

    async function renderRepoContent(repoId, container, parentId = null, level = 0) {
        const items = await window.db.getAllItems('files');
        const repoItems = items.filter(item => item.repositoryId === repoId && item.parentId === parentId);
        let html = '';
        repoItems.forEach(item => {
            const isFolder = item.type === 'folder';
            const expanded = state.expandedFolders.has(item.id);
            const iconClass = isFolder ? 'folder-bg' : window.fileEngine.getFileIconClass(window.fileEngine.getFileType(item.name));
            const iconSvg = isFolder ? window.fileEngine.getIconSvg('folder') : window.fileEngine.getIconSvg(window.fileEngine.getFileType(item.name));
            html += `
                <div class="file-item ${isFolder ? 'folder-item' : ''} ${expanded ? 'expanded' : ''}" data-id="${item.id}" data-type="${item.type}" style="padding-left: ${level * 1.5}rem;">
                    <div class="file-icon-bg ${iconClass}">
                        <svg>${iconSvg}</svg>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${item.name}</span>
                        <span class="file-date">Last modified: ${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="file-actions">
                        <button class="nav-btn dropdown-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
                ${isFolder && expanded ? `<div class="sub-items" data-parent-id="${item.id}"></div>` : ''}
            `;
        });
        container.innerHTML = html || '<div class="no-items">No items in this repository. Create one to get started!</div>';

        container.querySelectorAll('.file-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const type = item.dataset.type;
            if (type === 'file') {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.dropdown-trigger')) return;
                    const file = await window.db.getItemById('files', id);
                    if (file) viewManager.push('editor', { file });
                });
            } else if (type === 'folder') {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.dropdown-trigger')) return;
                    state.expandedFolders[state.expandedFolders.has(id) ? 'delete' : 'add'](id);
                    await renderRepoContent(repoId, container);
                });
            }
            item.querySelector('.dropdown-trigger').addEventListener('click', (e) => showItemMenu(e, id, type));
        });

        repoItems.forEach(async (item) => {
            if (item.type === 'folder' && state.expandedFolders.has(item.id)) {
                const subContainer = container.querySelector(`[data-parent-id="${item.id}"]`);
                if (subContainer) await renderRepoContent(repoId, subContainer, item.id, level + 1);
            }
        });
    }

    async function showItemMenu(e, id, type) {
        const existingMenu = document.querySelector('.dropdown-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.innerHTML = type === 'file' ? `
            <button data-action="download">Download</button>
            <button data-action="delete">Delete</button>
            <button data-action="rename">Rename</button>
            <button data-action="move">Move to Folder</button>
        ` : type === 'folder' ? `
            <button data-action="rename">Rename</button>
            <button data-action="delete">Delete</button>
        ` : `
            <button data-action="rename">Rename</button>
            <button data-action="delete">Delete</button>
        `;
        menu.style.top = `${e.currentTarget.getBoundingClientRect().top + window.scrollY + 30}px`;
        menu.style.left = `${e.currentTarget.getBoundingClientRect().left + window.scrollX - 120}px`;
        document.body.appendChild(menu);

        menu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const action = event.currentTarget.dataset.action;
                try {
                    if (action === 'download' && type === 'file') {
                        const file = await window.db.getItemById('files', id);
                        window.fileEngine.downloadFile(file.name, file.content);
                    } else if (action === 'delete') {
                        if (type === 'folder') {
                            const children = await window.db.getAllItems('files');
                            if (children.some(child => child.parentId === id)) {
                                alert('Folder is not empty. Delete contents first.');
                                return;
                            }
                        }
                        if (confirm(`Are you sure you want to delete this ${type}?`)) {
                            await window.db.deleteItem(type === 'repo' ? 'repositories' : 'files', id);
                            if (state.currentPage === 'repo-tree') {
                                const repo = await window.db.getItemById('repositories', state.currentRepoId);
                                viewManager.push('repo-tree', { repo });
                            } else {
                                renderMainContent();
                            }
                        }
                    } else if (action === 'rename') {
                        const item = await window.db.getItemById(type === 'repo' ? 'repositories' : 'files', id);
                        showModal('input', { type: 'rename', itemId: id, store: type === 'repo' ? 'repositories' : 'files', currentName: item.name });
                    } else if (action === 'move' && type === 'file') {
                        const folders = await window.db.getAllItems('files');
                        const repoFolders = folders.filter(f => f.repositoryId === state.currentRepoId && f.type === 'folder' && f.id !== id);
                        const moveMenu = document.createElement('div');
                        moveMenu.className = 'dropdown-menu sub-menu';
                        moveMenu.innerHTML = repoFolders.length ? repoFolders.map(folder => `<button data-folder-id="${folder.id}">${folder.name}</button>`).join('') : '<button disabled>No folders available</button>';
                        moveMenu.style.top = `${event.currentTarget.getBoundingClientRect().top + window.scrollY + 30}px`;
                        moveMenu.style.left = `${event.currentTarget.getBoundingClientRect().left + window.scrollX + 30}px`;
                        document.body.appendChild(moveMenu);
                        moveMenu.querySelectorAll('button:not([disabled])').forEach(subBtn => {
                            subBtn.addEventListener('click', async () => {
                                await window.db.updateItem('files', id, { parentId: parseInt(subBtn.dataset.folderId) });
                                const repo = await window.db.getItemById('repositories', state.currentRepoId);
                                viewManager.push('repo-tree', { repo });
                                moveMenu.remove();
                            });
                        });
                        document.addEventListener('click', (closeEvent) => {
                            if (!moveMenu.contains(closeEvent.target)) moveMenu.remove();
                        }, { once: true });
                    }
                } catch (e) {
                    window.logCustomError("Action failed", e);
                }
                menu.remove();
            });
        });

        document.addEventListener('click', (closeEvent) => {
            if (!menu.contains(closeEvent.target) && !e.currentTarget.contains(closeEvent.target)) menu.remove();
        }, { once: true });
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

        editor.value = file.content || '';

        const updateLineNumbers = () => {
            const lines = editor.value.split('\n');
            lineNumbers.innerHTML = Array.from({ length: lines.length }, (_, i) => `<div>${i + 1}</div>`).join('');
        };

        const updateSyntaxHighlighting = () => {
            highlighter.innerHTML = window.fileEngine.highlightCode(editor.value, file.name);
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

        editor.addEventListener('keydown', (e) => {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const text = editor.value;

            if (e.key === 'Enter') {
                e.preventDefault();
                const currentLine = text.substring(0, start).split('\n').pop();
                const indent = currentLine.match(/^\s*/)[0];
                const newText = text.substring(0, start) + '\n' + indent + text.substring(end);
                editor.value = newText;
                editor.selectionStart = editor.selectionEnd = start + indent.length + 1;
                updateEditor();
            }

            const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
            if (pairs[e.key]) {
                e.preventDefault();
                const newText = text.substring(0, start) + e.key + pairs[e.key] + text.substring(end);
                editor.value = newText;
                editor.selectionStart = editor.selectionEnd = start + 1;
                updateEditor();
            }
        });

        window.addEventListener('resize', updateEditor);
        updateEditor();

        let saveTimeout = null;
        editor.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                await window.db.updateItem('files', file.id, { content: editor.value });
                console.log('Autosaved.');
            }, 3000);
        });

        document.getElementById('editor-file-menu').addEventListener('click', (e) => {
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
            menu.style.top = `${e.currentTarget.getBoundingClientRect().top + window.scrollY + 30}px`;
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
                        window.logCustomError("Editor action failed", e);
                    }
                    menu.remove();
                });
            });

            document.addEventListener('click', (closeEvent) => {
                if (!menu.contains(closeEvent.target) && !e.currentTarget.contains(closeEvent.target)) {
                    menu.remove();
                }
            }, { once: true });
        });
    }

    function showModal(type, options = {}) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
            optionsContainer.classList.toggle('hidden', type !== 'options');
            inputSection.classList.toggle('hidden', type !== 'input');
            if (type === 'options') {
                newRepoBtn.style.display = state.currentPage === 'home' ? 'block' : 'none';
                newFolderBtn.style.display = state.currentPage === 'repo-tree' ? 'block' : 'none';
            } else if (type === 'input') {
                filenameTitle.textContent = options.type === 'rename' ? 'Rename' : `New ${options.type.charAt(0).toUpperCase() + options.type.slice(1)}`;
                filenameInput.placeholder = options.type === 'file' ? 'e.g., index.html' : options.type === 'folder' ? 'e.g., src' : 'e.g., my-project';
                filenameInput.value = options.currentName || '';
                filenameInput.disabled = false;
                filenameInput.focus();
                state.currentRepoId = options.repoId || null;
                state.currentParentId = options.parentId || null;
                if (options.type === 'rename') {
                    confirmBtn.onclick = async () => {
                        const newName = filenameInput.value.trim();
                        if (!newName) return;
                        try {
                            await window.db.updateItem(options.store, options.itemId, { name: newName });
                            hideModal();
                            if (state.currentPage === 'repo-tree') {
                                const repo = await window.db.getItemById('repositories', state.currentRepoId);
                                viewManager.push('repo-tree', { repo });
                            } else {
                                renderMainContent();
                            }
                        } catch (e) {
                            window.logCustomError("Rename failed", e);
                        }
                    };
                } else {
                    confirmBtn.onclick = null; // Reset to default handler
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

    // Force initial render
    viewManager.push('home');
});
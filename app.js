/*
File: /app.js
*/

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.db.ready;
    } catch (e) {
        console.error("Failed to initialize database:", e);
        document.getElementById('app-container').innerHTML = '<div class="error-display"><h1>Failed to Load App</h1><p>Please check your connection and try again.</p></div>';
        return;
    }

    const appContainer = document.getElementById('app-container');
    const mainContainer = document.getElementById('main-container');
    const navContainer = document.getElementById('nav-container');
    const contentContainer = document.getElementById('content-container');
    const modal = document.getElementById('modal');
    const inputSection = document.getElementById('input-section');
    const filenameInput = document.getElementById('filename');
    const filenameTitle = document.getElementById('filename-title');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    const state = {
        currentView: 'home', // home, files, repos, editor, repo-tree
        currentRepoId: null,
        currentFileId: null,
        currentParentId: null,
    };

    const viewManager = {
        history: [{ view: 'home', data: {} }],
        push(viewName, data = {}) {
            if (this.history[this.history.length - 1].view !== viewName) {
                this.history.push({ view: viewName, data });
            }
            renderView(viewName, data);
        },
        pop() {
            if (this.history.length > 1) {
                this.history.pop();
                const lastView = this.history[this.history.length - 1];
                renderView(lastView.view, lastView.data);
            }
        },
    };

    function showModal(type, data = {}) {
        modal.classList.remove('hidden');
        inputSection.classList.add('hidden');
        dropdownMenu.classList.add('hidden');
        if (type === 'input') {
            inputSection.classList.remove('hidden');
            filenameTitle.textContent = 'Enter Name';
            filenameInput.value = '';
            filenameInput.focus();
            state.modalData = data;
        } else if (type === 'dropdown') {
            dropdownMenu.classList.remove('hidden');
            dropdownMenu.innerHTML = data.options.map(opt => `
                <button class="dropdown-option" data-action="${opt.action}">${opt.label}</button>
            `).join('');
            dropdownMenu.style.top = `${data.top}px`;
            dropdownMenu.style.right = '1rem';
            dropdownMenu.querySelectorAll('.dropdown-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    data.callback(btn.dataset.action);
                    hideModal();
                });
            });
        }
    }

    function hideModal() {
        modal.classList.add('hidden');
        inputSection.classList.add('hidden');
        dropdownMenu.classList.add('hidden');
        filenameInput.value = '';
        confirmBtn.classList.remove('enabled');
        confirmBtn.disabled = true;
    }

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

        const { type, repoId, parentId } = state.modalData;
        const store = type === 'repo' ? 'repositories' : 'files';
        const newItem = { name, content: '' };
        if (type !== 'repo') {
            newItem.type = type;
            newItem.repositoryId = repoId || state.currentRepoId;
            if (parentId || state.currentParentId) newItem.parentId = parentId || state.currentParentId;
        }

        try {
            const newItemId = await window.db.addItem(store, newItem);
            hideModal();
            if (type === 'file') {
                viewManager.push('editor', { fileId: newItemId });
            } else {
                renderContent();
            }
        } catch (e) {
            console.error("Error creating item:", e);
            window.logCustomError("Failed to create new item", e);
            alert("An error occurred. Please try again.");
        }
    });

    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    async function renderView(viewName, data = {}) {
        state.currentView = viewName;
        mainContainer.classList.remove('expanded');
        contentContainer.classList.add('hidden');
        navContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        if (viewName === 'home') {
            navContainer.innerHTML = `
                <button id="nav-files" class="nav-btn">Files</button>
                <div class="nav-divider"></div>
                <button id="nav-repos" class="nav-btn">Repositories</button>
            `;
            document.getElementById('nav-files').addEventListener('click', () => {
                mainContainer.classList.add('expanded');
                contentContainer.classList.remove('hidden');
                viewManager.push('files');
            });
            document.getElementById('nav-repos').addEventListener('click', () => {
                mainContainer.classList.add('expanded');
                contentContainer.classList.remove('hidden');
                viewManager.push('repos');
            });
        } else if (viewName === 'files' || viewName === 'repos') {
            mainContainer.classList.add('expanded');
            contentContainer.classList.remove('hidden');
            const title = viewName === 'files' ? 'File Explorer' : 'Repository Explorer';
            contentContainer.innerHTML = `
                <div class="header">
                    <h2 class="header-title">${title}</h2>
                    <div class="header-actions">
                        <button class="header-btn" id="dropdown-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                        <button class="header-btn" id="close-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                        <button class="header-btn" id="add-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="item-divider"></div>
                <div id="content-list" class="scrollable-content"></div>
            `;
            document.getElementById('close-btn').addEventListener('click', () => viewManager.pop());
            document.getElementById('add-btn').addEventListener('click', () => {
                showModal('input', { type: viewName === 'files' ? 'file' : 'repo' });
            });
            document.getElementById('dropdown-btn').addEventListener('click', (e) => {
                const options = viewName === 'files' ?
                    [
                        { label: 'Sort by Name', action: 'sort-name' },
                        { label: 'Sort by Date', action: 'sort-date' }
                    ] :
                    [
                        { label: 'Sort by Name', action: 'sort-name' },
                        { label: 'Sort by Date', action: 'sort-date' }
                    ];
                showModal('dropdown', {
                    options,
                    top: e.target.getBoundingClientRect().top + 30,
                    callback: (action) => {
                        // Implement sorting logic if needed
                        console.log(`Sort action: ${action}`);
                    }
                });
            });
            renderContent();
        } else if (viewName === 'editor') {
            renderEditor(data.fileId);
        } else if (viewName === 'repo-tree') {
            renderRepoTree(data.repoId);
        }
    }

    async function renderContent() {
        const contentList = document.getElementById('content-list');
        if (!contentList) return;

        if (state.currentView === 'files') {
            const files = await window.db.getAllItems('files');
            contentList.innerHTML = files.map(file => {
                const fileType = window.fileEngine.getFileType(file.name);
                const fileIconClass = window.fileEngine.getFileIconClass(fileType);
                return `
                    <div class="item" data-id="${file.id}" data-type="file">
                        <div class="item-icon ${fileIconClass}">
                            <svg>${window.fileEngine.getIconSvg(fileType)}</svg>
                        </div>
                        <div class="item-info">
                            <span class="item-name">${file.name}</span>
                            <span class="item-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="item-actions">
                            <button class="header-btn dropdown-trigger">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="item-divider"></div>
                `;
            }).join('') || '<div class="no-items">No files found. Tap the "+" button to create one.</div>';
            contentList.querySelectorAll('.item[data-type="file"]').forEach(item => {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.dropdown-trigger')) {
                        showItemDropdown(item, 'file');
                    } else {
                        const id = parseInt(item.dataset.id);
                        viewManager.push('editor', { fileId: id });
                    }
                });
            });
        } else if (state.currentView === 'repos') {
            const repos = await window.db.getAllItems('repositories');
            contentList.innerHTML = repos.map(repo => `
                <div class="item" data-id="${repo.id}" data-type="repo">
                    <div class="item-icon repo-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div class="item-info">
                        <span class="item-name">${repo.name}</span>
                        <span class="item-date">Last modified: ${new Date(repo.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="item-actions">
                        <button class="header-btn dropdown-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
                <div class="item-divider"></div>
            `).join('') || '<div class="no-items">No repositories found. Create one to get started!</div>';
            contentList.querySelectorAll('.item[data-type="repo"]').forEach(item => {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.dropdown-trigger')) {
                        showItemDropdown(item, 'repo');
                    } else {
                        const id = parseInt(item.dataset.id);
                        viewManager.push('repo-tree', { repoId: id });
                    }
                });
            });
        }
    }

    async function showItemDropdown(item, type) {
        const options = type === 'file' ?
            [
                { label: 'Rename', action: 'rename' },
                { label: 'Delete', action: 'delete' },
                { label: 'Download', action: 'download' }
            ] :
            [
                { label: 'Rename', action: 'rename' },
                { label: 'Delete', action: 'delete' },
                { label: 'Download as ZIP', action: 'download-zip' }
            ];
        showModal('dropdown', {
            options,
            top: item.getBoundingClientRect().top + 30,
            callback: async (action) => {
                const id = parseInt(item.dataset.id);
                if (action === 'rename') {
                    showModal('input', { type, id });
                } else if (action === 'delete') {
                    await window.db.deleteItem(type === 'file' ? 'files' : 'repositories', id);
                    renderContent();
                } else if (action === 'download') {
                    const file = await window.db.getItemById('files', id);
                    window.fileEngine.downloadFile(file.name, file.content);
                } else if (action === 'download-zip') {
                    // Placeholder for ZIP download (requires additional logic)
                    alert('ZIP download not implemented yet.');
                }
            }
        });
    }

    async function renderEditor(fileId) {
        const file = await window.db.getItemById('files', fileId) || { name: 'untitled', content: '' };
        state.currentFileId = fileId;
        mainContainer.classList.add('expanded');
        contentContainer.classList.remove('hidden');
        const fileType = window.fileEngine.getFileType(file.name);
        const fileIconClass = window.fileEngine.getFileIconClass(fileType);
        contentContainer.innerHTML = `
            <div class="header">
                <div class="header-actions">
                    <button class="header-btn" id="back-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                </div>
                <h2 class="header-title">${file.name}</h2>
                <div class="header-actions">
                    <button class="header-btn" id="dropdown-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="item-divider"></div>
            <div class="code-editor-container">
                <div class="line-numbers"></div>
                <textarea id="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
                <pre class="syntax-highlighting-layer" aria-hidden="true"></pre>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => viewManager.pop());
        document.getElementById('dropdown-btn').addEventListener('click', (e) => {
            showItemDropdown({ dataset: { id: fileId } }, 'file');
        });

        const editor = document.getElementById('code-editor');
        const lineNumbers = document.querySelector('.line-numbers');
        const highlighter = document.querySelector('.syntax-highlighting-layer');

        let codeContent = file.content || '';
        editor.value = codeContent;

        const updateLineNumbers = () => {
            const lines = editor.value.split('\n');
            lineNumbers.innerHTML = Array.from({ length: lines.length }, (_, i) => `<div>${i + 1}</div>`).join('');
            highlighter.innerHTML = window.fileEngine.highlightCode(codeContent, file.name);
        };

        editor.addEventListener('input', () => {
            codeContent = editor.value;
            updateLineNumbers();
            window.db.updateItem('files', fileId, { content: codeContent });
        });

        editor.addEventListener('scroll', () => {
            highlighter.scrollTop = editor.scrollTop;
            lineNumbers.scrollTop = editor.scrollTop;
        });

        updateLineNumbers();
    }

    async function renderRepoTree(repoId) {
        const repo = await window.db.getItemById('repositories', repoId) || { name: 'Unknown' };
        state.currentRepoId = repoId;
        mainContainer.classList.add('expanded');
        contentContainer.classList.remove('hidden');
        contentContainer.innerHTML = `
            <div class="header">
                <div class="header-actions">
                    <button class="header-btn" id="back-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                </div>
                <h2 class="header-title">${repo.name}</h2>
                <div class="header-actions">
                    <button class="header-btn" id="add-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                    <button class="header-btn" id="dropdown-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="item-divider"></div>
            <div id="content-list" class="scrollable-content"></div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => viewManager.pop());
        document.getElementById('add-btn').addEventListener('click', (e) => {
            showModal('dropdown', {
                options: [
                    { label: 'New File', action: 'new-file' },
                    { label: 'New Folder', action: 'new-folder' }
                ],
                top: e.target.getBoundingClientRect().top + 30,
                callback: (action) => {
                    showModal('input', { type: action === 'new-file' ? 'file' : 'folder', repoId });
                }
            });
        });
        document.getElementById('dropdown-btn').addEventListener('click', (e) => {
            showItemDropdown({ dataset: { id: repoId } }, 'repo');
        });

        const contentList = document.getElementById('content-list');
        const files = (await window.db.getAllItems('files')).filter(f => f.repositoryId === repoId);
        contentList.innerHTML = files.map(file => {
            const fileType = window.fileEngine.getFileType(file.name);
            const fileIconClass = window.fileEngine.getFileIconClass(fileType);
            return `
                <div class="item" data-id="${file.id}" data-type="${file.type}">
                    <div class="item-icon ${fileIconClass}">
                        <svg>${window.fileEngine.getIconSvg(fileType)}</svg>
                    </div>
                    <div class="item-info">
                        <span class="item-name">${file.name}</span>
                        <span class="item-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="item-actions">
                        <button class="header-btn dropdown-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
                <div class="item-divider"></div>
            `;
        }).join('') || '<div class="no-items">No items found. Tap the "+" button to add one.</div>';
        contentList.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('.dropdown-trigger')) {
                    showItemDropdown(item, item.dataset.type);
                } else if (item.dataset.type === 'file') {
                    const id = parseInt(item.dataset.id);
                    viewManager.push('editor', { fileId: id });
                }
            });
        });
    }

    viewManager.push('home');
});
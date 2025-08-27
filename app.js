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
        isInRepo: false,
        currentRepoId: null,
        currentParentId: null,
    };

    // View Manager for handling page transitions and state
    const viewManager = {
        history: [{ page: 'home', data: {} }],
        push(pageName, data = {}) {
            if (this.history[this.history.length - 1].page !== pageName || JSON.stringify(this.history[this.history.length - 1].data) !== JSON.stringify(data)) {
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
        if (state.isInRepo) {
            showModal('input', { type: 'folder' });
        } else {
            showModal('input', { type: 'repo' });
        }
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

        const title = filenameTitle.textContent;
        if (title.startsWith('Rename')) {
            const itemType = title.split(' ')[1].toLowerCase();
            const store = itemType === 'repo' ? 'repositories' : 'files';
            const updates = { name };
            try {
                await window.db.updateItem(store, state.currentItemId, updates);
                hideModal();
                refreshCurrentView();
            } catch (e) {
                console.error("Error renaming item:", e);
                alert("An error occurred. Please try again.");
            }
            return;
        }

        const itemType = title.replace('New ', '').toLowerCase();
        let store = 'files';
        const newItem = { name };
        if (itemType === 'repo') {
            store = 'repositories';
        } else {
            newItem.type = itemType;
            if (itemType === 'file') {
                newItem.content = '';
            } else {
                newItem.content = null; // For folders
            }
            if (state.currentRepoId) {
                newItem.repositoryId = state.currentRepoId;
                if (state.currentParentId) {
                    newItem.parentId = state.currentParentId;
                }
            }
        }

        try {
            const newItemId = await window.db.addItem(store, newItem);
            console.log(`${itemType} created:`, newItem);
            hideModal();
            if (itemType === 'file') {
                const createdFile = await window.db.getItemById('files', newItemId);
                viewManager.push('editor', { file: createdFile });
            } else {
                refreshCurrentView();
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

    // Helper to refresh current view
    function refreshCurrentView() {
        const current = viewManager.history[viewManager.history.length - 1];
        viewManager.push(current.page, current.data);
    }

    // --- UI Rendering Functions ---
    async function renderPage(pageName, data = {}) {
        state.currentPage = pageName;
        state.isInRepo = pageName === 'repo-tree';
        state.currentRepoId = state.isInRepo ? data.repo.id : null;
        state.currentParentId = state.isInRepo ? data.parentId || null : null;
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
            const fileListHtml = files.filter(file => !file.repositoryId && file.type !== 'folder').map(file => {
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
            attachDropdownListeners(mainContent);
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
            attachDropdownListeners(mainContent, 'repo');
        }
    }

    async function renderRepoTreePage(data) {
        const repo = data.repo || { name: 'Unknown', id: null };
        const parentId = data.parentId || null;
        let title = repo.name;
        if (parentId) {
            const parent = await window.db.getItemById('files', parentId);
            title += ' / ' + parent.name;
        }
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
                        <h2 class="header-title">${title}</h2>
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
        document.getElementById('new-item-button').addEventListener('click', () => showModal('options', {}, 'repo'));

        const repoContent = document.getElementById('repo-content');
        const files = await window.db.getAllItems('files');
        const repoItems = files.filter(file => file.repositoryId === repo.id && file.parentId === parentId);
        const repoListHtml = repoItems.map(item => {
            const itemType = item.type || 'file';
            const fileType = itemType === 'folder' ? 'folder' : window.fileEngine.getFileType(item.name);
            const fileIconClass = itemType === 'folder' ? 'repo-bg' : window.fileEngine.getFileIconClass(fileType);
            const iconSvg = itemType === 'folder' ? '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' : window.fileEngine.getIconSvg(fileType);
            return `
                <div class="file-item" data-id="${item.id}" data-type="${itemType}">
                    <div class="file-icon-bg ${fileIconClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${iconSvg}</svg>
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
            `;
        }).join('');
        repoContent.innerHTML = repoListHtml || '<div class="no-items">No items in this folder. Tap the "plus" button to create one.</div>';

        repoContent.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('.dropdown-trigger')) return; // Prevent triggering on dropdown click
                const id = parseInt(item.dataset.id);
                const fileItem = await window.db.getItemById('files', id);
                if (fileItem.type === 'folder') {
                    viewManager.push('repo-tree', { repo, parentId: id });
                } else {
                    viewManager.push('editor', { file: fileItem });
                }
            });
        });
        attachDropdownListeners(repoContent);
    }

    function attachDropdownListeners(container, itemType = 'file') {
        container.querySelectorAll('.dropdown-trigger').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const existingMenu = document.querySelector('.dropdown-menu');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }

                const itemElem = btn.closest('.file-item');
                const id = parseInt(itemElem.dataset.id);
                const type = itemElem.dataset.type;
                const store = type === 'repo' ? 'repositories' : 'files';
                const item = await window.db.getItemById(store, id);

                const menu = document.createElement('div');
                menu.className = 'dropdown-menu';
                let html = '';
                if (type === 'file') {
                    html += `<button data-action="download">Download</button>`;
                    html += `<button data-action="rename">Rename</button>`;
                    html += `<button data-action="move">Move to Folder</button>`;
                    html += `<button data-action="delete">Delete</button>`;
                } else if (type === 'folder') {
                    html += `<button data-action="rename">Rename</button>`;
                    html += `<button data-action="delete">Delete</button>`;
                } else if (type === 'repo') {
                    html += `<button data-action="rename">Rename</button>`;
                    html += `<button data-action="delete">Delete</button>`;
                }
                menu.innerHTML = html;
                const rect = btn.getBoundingClientRect();
                menu.style.top = `${rect.bottom + window.scrollY}px`;
                menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + btn.offsetWidth}px`;
                document.body.appendChild(menu);

                menu.querySelectorAll('button').forEach(b => {
                    b.addEventListener('click', async (ev) => {
                        const action = ev.currentTarget.dataset.action;
                        if (action === 'download') {
                            window.fileEngine.downloadFile(item.name, item.content);
                        } else if (action === 'delete') {
                            if (type === 'folder') {
                                const children = await window.db.getItemsByIndex('files', 'parentId', id);
                                if (children.length > 0) {
                                    alert('Cannot delete non-empty folder');
                                    menu.remove();
                                    return;
                                }
                            } else if (type === 'repo') {
                                const repoFiles = await window.db.getItemsByIndex('files', 'repositoryId', id);
                                if (repoFiles.length > 0) {
                                    alert('Cannot delete non-empty repository');
                                    menu.remove();
                                    return;
                                }
                            }
                            if (confirm('Are you sure you want to delete this?')) {
                                await window.db.deleteItem(store, id);
                                refreshCurrentView();
                            }
                        } else if (action === 'rename') {
                            state.currentItemId = id;
                            showModal('input', { type: 'rename', itemType: type });
                            filenameInput.value = item.name;
                            filenameInput.disabled = false;
                            filenameInput.focus();
                        } else if (action === 'move') {
                            const subMenu = document.createElement('div');
                            subMenu.className = 'dropdown-menu';
                            const allFiles = await window.db.getAllItems('files');
                            const folders = allFiles.filter(f => f.type === 'folder' && f.repositoryId === state.currentRepoId && f.id !== id);
                            subMenu.innerHTML = folders.map(f => `<button data-folder-id="${f.id}">${f.name}</button>`).join('');
                            if (folders.length === 0) {
                                subMenu.innerHTML = '<div class="no-items">No folders available</div>';
                            }
                            const mRect = menu.getBoundingClientRect();
                            subMenu.style.top = `${mRect.top}px`;
                            subMenu.style.left = `${mRect.right + 5}px`;
                            document.body.appendChild(subMenu);

                            subMenu.querySelectorAll('button').forEach(fb => {
                                fb.addEventListener('click', async () => {
                                    const folderId = parseInt(fb.dataset.folderId);
                                    await window.db.updateItem('files', id, { parentId: folderId });
                                    refreshCurrentView();
                                    subMenu.remove();
                                    menu.remove();
                                });
                            });

                            document.addEventListener('click', (ce) => {
                                if (!subMenu.contains(ce.target)) {
                                    subMenu.remove();
                                }
                            }, { once: true });
                        }
                        if (action !== 'move') {
                            menu.remove();
                        }
                    });
                });

                document.addEventListener('click', (ce) => {
                    if (!menu.contains(ce.target) && !btn.contains(ce.target)) {
                        menu.remove();
                    }
                }, { once: true });
            });
        });
    }

    async function renderCodeEditorPage(data) {
        // (unchanged from previous version)
        // ... 
    }

    function showModal(type, options = {}, context = 'home') {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
            if (type === 'options') {
                optionsContainer.classList.remove('hidden');
                inputSection.classList.add('hidden');
                if (context === 'repo') {
                    newRepoBtn.querySelector('span').textContent = 'New Folder';
                } else {
                    newRepoBtn.querySelector('span').textContent = 'New Repository';
                }
            } else if (type === 'input') {
                optionsContainer.classList.add('hidden');
                inputSection.classList.remove('hidden');
                if (options.type === 'file') {
                    filenameTitle.textContent = 'New File';
                    filenameInput.placeholder = 'e.g., index.html';
                } else if (options.type === 'folder') {
                    filenameTitle.textContent = 'New Folder';
                    filenameInput.placeholder = 'e.g., my-folder';
                } else if (options.type === 'repo') {
                    filenameTitle.textContent = 'New Repository';
                    filenameInput.placeholder = 'e.g., my-pwa-project';
                } else if (options.type === 'rename') {
                    filenameTitle.textContent = 'Rename ' + options.itemType.charAt(0).toUpperCase() + options.itemType.slice(1);
                    filenameInput.placeholder = 'Enter new name';
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
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

    const elements = {
        mainContainer: document.getElementById('main-container'),
        navContainer: document.getElementById('nav-container'),
        contentContainer: document.getElementById('content-container'),
        modal: document.getElementById('modal'),
        inputSection: document.getElementById('input-section'),
        inputField: document.getElementById('input-field'),
        inputTitle: document.getElementById('input-title'),
        confirmBtn: document.getElementById('confirm-btn'),
        cancelBtn: document.getElementById('cancel-btn'),
        dropdownMenu: document.getElementById('dropdown-menu'),
    };

    const state = {
        currentView: 'home',
        currentRepoId: null,
        currentFileId: null,
        currentParentId: null,
        history: [{ view: 'home', data: {} }],
        pushView(viewName, data = {}) {
            const lastView = this.history[this.history.length - 1];
            if (lastView && lastView.view === viewName && JSON.stringify(lastView.data) === JSON.stringify(data)) {
                return;
            }
            this.history.push({ view: viewName, data });
            renderView(viewName, data);
        },
        popView() {
            if (this.history.length > 1) {
                this.history.pop();
                const lastView = this.history[this.history.length - 1];
                renderView(lastView.view, lastView.data);
            } else {
                renderView('home');
            }
        }
    };

    function showModal(type, data = {}) {
        elements.modal.classList.remove('hidden');
        elements.inputSection.classList.add('hidden');
        elements.dropdownMenu.classList.add('hidden');

        if (type === 'input') {
            elements.inputSection.classList.remove('hidden');
            elements.inputTitle.textContent = data.title || 'Enter Name';
            elements.inputField.value = '';
            elements.inputField.focus();
            state.modalData = data;
            elements.confirmBtn.classList.remove('enabled');
            elements.confirmBtn.disabled = true;
        } else if (type === 'dropdown') {
            elements.dropdownMenu.classList.remove('hidden');
            elements.dropdownMenu.innerHTML = data.options.map(opt => `
                <button class="dropdown-option" data-action="${opt.action}" role="menuitem">${opt.label}</button>
            `).join('');
            
            const rect = data.event.target.getBoundingClientRect();
            const containerRect = elements.mainContainer.getBoundingClientRect();
            
            elements.dropdownMenu.style.top = `${rect.bottom - containerRect.top + 5}px`;
            elements.dropdownMenu.style.right = `${containerRect.right - rect.right}px`;
            
            elements.dropdownMenu.querySelectorAll('.dropdown-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    data.callback(btn.dataset.action);
                    hideModal();
                    e.stopPropagation();
                });
            });
        }
    }

    function hideModal() {
        elements.modal.classList.add('hidden');
        elements.inputSection.classList.add('hidden');
        elements.dropdownMenu.classList.add('hidden');
        elements.inputField.value = '';
        elements.confirmBtn.disabled = true;
    }

    elements.inputField.addEventListener('input', () => {
        const isInputFilled = elements.inputField.value.trim().length > 0;
        elements.confirmBtn.disabled = !isInputFilled;
        if (isInputFilled) {
            elements.confirmBtn.classList.add('enabled');
        } else {
            elements.confirmBtn.classList.remove('enabled');
        }
    });

    elements.confirmBtn.addEventListener('click', async () => {
        const name = elements.inputField.value.trim();
        if (name === '') return;

        const { type, repoId, parentId, id } = state.modalData;
        try {
            if (id) {
                await window.db.updateItem(type === 'repo' ? 'repositories' : 'files', id, { name });
            } else {
                const store = type === 'repo' ? 'repositories' : 'files';
                const newItem = { name, content: '', type: type, repositoryId: repoId, parentId: parentId };
                const newItemId = await window.db.addItem(store, newItem);
                if (type === 'file') {
                    state.pushView('editor', { fileId: newItemId });
                }
            }
            hideModal();
            renderContent();
        } catch (e) {
            console.error("Error creating/updating item:", e);
            window.logCustomError("Failed to perform action", e);
            alert("An error occurred. Please try again.");
        }
    });

    elements.cancelBtn.addEventListener('click', hideModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal || e.target.closest('.modal-content') === null) {
            hideModal();
        }
    });

    async function renderView(viewName, data = {}) {
        hideModal(); // Add this line to ensure the modal is always hidden on view change
        state.currentView = viewName;
        state.currentRepoId = data.repoId;
        state.currentFileId = data.fileId;
        state.currentParentId = data.parentId;
        elements.contentContainer.innerHTML = '';
        elements.mainContainer.classList.remove('expanded');

        if (viewName === 'home') {
            elements.navContainer.innerHTML = `
                <button id="nav-files" class="nav-btn" role="link" aria-label="Open files view">Files</button>
                <div class="nav-divider"></div>
                <button id="nav-repos" class="nav-btn" role="link" aria-label="Open repositories view">Repositories</button>
            `;
            elements.navContainer.classList.remove('hidden');
            elements.contentContainer.classList.add('hidden');
            document.getElementById('nav-files').addEventListener('click', () => {
                elements.mainContainer.classList.add('expanded');
                elements.contentContainer.classList.remove('hidden');
                state.pushView('files');
            });
            document.getElementById('nav-repos').addEventListener('click', () => {
                elements.mainContainer.classList.add('expanded');
                elements.contentContainer.classList.remove('hidden');
                state.pushView('repos');
            });
        } else {
            elements.navContainer.classList.add('hidden');
            elements.mainContainer.classList.add('expanded');
            elements.contentContainer.classList.remove('hidden');
            if (viewName === 'files' || viewName === 'repos') {
                renderList(viewName);
            } else if (viewName === 'editor') {
                renderEditor(data.fileId);
            } else if (viewName === 'repo-tree') {
                renderRepoTree(data.repoId);
            }
        }
    }

    async function renderContent() {
      const lastView = state.history[state.history.length - 1];
      if (lastView) {
        renderView(lastView.view, lastView.data);
      }
    }

    async function handleItemAction(action, id, type) {
        try {
            if (action === 'rename') {
                showModal('input', { title: 'Rename', type, id });
            } else if (action === 'delete') {
                await window.db.deleteItem(type === 'file' ? 'files' : 'repositories', id);
                renderContent();
            } else if (action === 'download') {
                const file = await window.db.getItemById('files', id);
                if (file) window.fileEngine.downloadFile(file.name, file.content);
            } else if (action === 'download-zip') {
                alert('ZIP download not implemented yet.');
            }
        } catch (e) {
            window.logCustomError(`Failed to perform ${action} action`, e);
            alert(`An error occurred while trying to ${action} this item.`);
        }
    }

    async function renderList(viewName) {
        const isFilesView = viewName === 'files';
        const title = isFilesView ? 'File Explorer' : 'Repository Explorer';
        const store = isFilesView ? 'files' : 'repositories';

        elements.contentContainer.innerHTML = `
            <div class="header">
                <h2 class="header-title">${title}</h2>
                <div class="header-actions">
                    <button class="header-btn" id="add-btn" aria-label="Add new item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                    <button class="header-btn" id="close-btn" aria-label="Close view">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>
            </div>
            <div class="item-divider"></div>
            <div id="content-list" class="scrollable-content"></div>
        `;

        document.getElementById('close-btn').addEventListener('click', state.popView);
        document.getElementById('add-btn').addEventListener('click', () => {
            showModal('input', { type: isFilesView ? 'file' : 'repo' });
        });

        const items = await window.db.getAllItems(store);
        const contentList = document.getElementById('content-list');
        if (!items || items.length === 0) {
            contentList.innerHTML = `<div class="no-items">No ${store} found. Tap the "+" button to create one.</div>`;
            return;
        }

        contentList.innerHTML = items.map(item => `
            <div class="item" data-id="${item.id}" data-type="${isFilesView ? 'file' : 'repo'}" role="listitem">
                <div class="item-icon ${window.fileEngine.getFileIconClass(window.fileEngine.getFileType(item.name))}">
                    <svg viewBox="0 0 24 24">${window.fileEngine.getIconSvg(window.fileEngine.getFileType(item.name))}</svg>
                </div>
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-date">Last modified: ${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div class="item-actions">
                    <button class="header-btn dropdown-trigger" aria-label="Options for ${item.name}">
                        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="item-divider"></div>
        `).join('');

        contentList.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = parseInt(item.dataset.id);
                if (e.target.closest('.dropdown-trigger')) {
                    const type = item.dataset.type;
                    const options = type === 'file' ?
                        [{ label: 'Rename', action: 'rename' }, { label: 'Delete', action: 'delete' }, { label: 'Download', action: 'download' }] :
                        [{ label: 'Rename', action: 'rename' }, { label: 'Delete', action: 'delete' }, { label: 'Download as ZIP', action: 'download-zip' }];
                    showModal('dropdown', { options, event: e, callback: async (action) => {
                        await handleItemAction(action, id, type);
                    }});
                } else {
                    if (isFilesView) {
                        state.pushView('editor', { fileId: id });
                    } else {
                        state.pushView('repo-tree', { repoId: id });
                    }
                }
            });
        });
    }

    async function renderEditor(fileId) {
        const file = await window.db.getItemById('files', fileId) || { name: 'untitled', content: '' };
        state.currentFileId = fileId;
        elements.contentContainer.innerHTML = `
            <div class="header">
                <div class="header-actions">
                    <button class="header-btn" id="back-btn" aria-label="Go back">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                </div>
                <h2 class="header-title">${file.name}</h2>
                <div class="header-actions">
                    <button class="header-btn" id="dropdown-btn" aria-label="More options">
                        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
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

        document.getElementById('back-btn').addEventListener('click', state.popView);
        document.getElementById('dropdown-btn').addEventListener('click', (e) => {
             const options = [{ label: 'Rename', action: 'rename' }, { label: 'Delete', action: 'delete' }, { label: 'Download', action: 'download' }];
             showModal('dropdown', { options, event: e, callback: async (action) => {
                 await handleItemAction(action, fileId, 'file');
             }});
        });

        const editor = document.getElementById('code-editor');
        const lineNumbers = document.querySelector('.line-numbers');
        const highlighter = document.querySelector('.syntax-highlighting-layer');

        let codeContent = file.content || '';
        editor.value = codeContent;

        const updateEditor = () => {
            const lines = editor.value.split('\n');
            lineNumbers.innerHTML = Array.from({ length: lines.length }, (_, i) => `<div>${i + 1}</div>`).join('');
            highlighter.innerHTML = window.fileEngine.highlightCode(codeContent, file.name);
        };

        editor.addEventListener('input', () => {
            codeContent = editor.value;
            updateEditor();
            window.db.updateItem('files', fileId, { content: codeContent });
        });

        editor.addEventListener('scroll', () => {
            highlighter.scrollTop = editor.scrollTop;
            lineNumbers.scrollTop = editor.scrollTop;
        });

        updateEditor();
    }
    
    async function renderRepoTree(repoId) {
        const repo = await window.db.getItemById('repositories', repoId) || { name: 'Unknown' };
        state.currentRepoId = repoId;
        elements.contentContainer.innerHTML = `
            <div class="header">
                <div class="header-actions">
                    <button class="header-btn" id="back-btn" aria-label="Go back">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                </div>
                <h2 class="header-title">${repo.name}</h2>
                <div class="header-actions">
                    <button class="header-btn" id="add-btn" aria-label="Add new item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                    <button class="header-btn" id="dropdown-btn" aria-label="More options">
                        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="item-divider"></div>
            <div id="content-list" class="scrollable-content"></div>
        `;
        document.getElementById('back-btn').addEventListener('click', state.popView);
        document.getElementById('add-btn').addEventListener('click', (e) => {
            showModal('dropdown', {
                options: [{ label: 'New File', action: 'new-file' }, { label: 'New Folder', action: 'new-folder' }],
                event: e,
                callback: (action) => {
                    showModal('input', { title: 'Enter New File Name', type: 'file', repoId });
                }
            });
        });
        document.getElementById('dropdown-btn').addEventListener('click', (e) => {
            const options = [{ label: 'Rename', action: 'rename' }, { label: 'Delete', action: 'delete' }, { label: 'Download as ZIP', action: 'download-zip' }];
            showModal('dropdown', { options, event: e, callback: async (action) => {
                await handleItemAction(action, repoId, 'repo');
            }});
        });

        const files = (await window.db.getAllItems('files')).filter(f => f.repositoryId === repoId);
        const contentList = document.getElementById('content-list');
        contentList.innerHTML = files.map(file => {
            const fileType = window.fileEngine.getFileType(file.name);
            const fileIconClass = window.fileEngine.getFileIconClass(fileType);
            return `
                <div class="item" data-id="${file.id}" data-type="file" role="listitem">
                    <div class="item-icon ${fileIconClass}">
                        <svg viewBox="0 0 24 24">${window.fileEngine.getIconSvg(fileType)}</svg>
                    </div>
                    <div class="item-info">
                        <span class="item-name">${file.name}</span>
                        <span class="item-date">Last modified: ${new Date(file.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="item-actions">
                        <button class="header-btn dropdown-trigger" aria-label="Options for ${file.name}">
                            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/></svg>
                        </button>
                    </div>
                </div>
                <div class="item-divider"></div>
            `;
        }).join('') || '<div class="no-items">No items found. Tap the "+" button to add one.</div>';
        contentList.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.dropdown-trigger')) {
                    const id = parseInt(item.dataset.id);
                    const options = [{ label: 'Rename', action: 'rename' }, { label: 'Delete', action: 'delete' }, { label: 'Download', action: 'download' }];
                    showModal('dropdown', { options, event: e, callback: async (action) => {
                        await handleItemAction(action, id, 'file');
                    }});
                } else if (item.dataset.type === 'file') {
                    const id = parseInt(item.dataset.id);
                    state.pushView('editor', { fileId: id });
                }
            });
        });
    }

    renderView('home');
});

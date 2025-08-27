document.addEventListener('DOMContentLoaded', () => {
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

    // Helper function to render SVG icons
    const getIconSvg = (name) => {
        const icons = {
            newFile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-plus"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`,
            openFile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
            fileExplorer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-hard-drive"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>`,
            repository: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-git-branch"><line x1="6" y1="3" x2="6" y2="15"></line><line x1="18" y1="6" x2="18" y2="18"></line><path d="M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M13 6h3.5a4.5 4.5 0 0 1 4.5 4.5v1"></path></svg>`,
            settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.83 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 5.12 19.4a1.65 1.65 0 0 0-1.82-.33L3.25 19.4a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83l2.83-2.83a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 12.88 2.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a2 2 0 0 1 2 2h.09a1.65 1.65 0 0 0 1.51 1z"></path></svg>`,
            profile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            recent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M12 8v4l3 3"></path></svg>`,
            search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
            add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
            git: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="16" x2="12" y2="21"></line><line x1="12" y1="3" x2="12" y2="8"></line><path d="M20 12h-8"></path><path d="M4 12h8"></path><line x1="16" y1="12" x2="16" y2="16"></line><line x1="8" y1="12" x2="8" y2="16"></line></svg>`,
            ai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
        };
        return icons[name] || '';
    };

    // Global state to track the active repository
    let activeRepo = null;
    let isCreatingRepo = false;

    // Function to render the home screen
    const renderHomeScreen = async () => {
        const repositories = await db.getAllItems('repositories');
        const recentProjectsHtml = repositories.map(repo => `
            <a href="#" class="project-card" data-repo-id="${repo.id}">
                <div class="project-icon">${getIconSvg('repository')}</div>
                <span class="project-title">${repo.name}</span>
                <span class="project-date">Last modified: ${new Date(repo.lastModified).toLocaleString()}</span>
            </a>
        `).join('');

        appContainer.innerHTML = `
            <main>
                <div class="logo">
                    <h1 class="titan">TITAN</h1>
                    <span class="developer">Developer</span>
                </div>
                
                <div class="recent-projects-header">
                    <h2>Recent Projects</h2>
                    <a href="#">View All</a>
                </div>
                <div class="recent-projects-grid">
                    ${recentProjectsHtml || `<p style="text-align: center; color: var(--text-secondary); padding-top: 2rem;">No repositories found.</p>`}
                </div>

                <div class="command-bar">
                    <a href="#" class="command-btn" id="new-file-btn">
                        ${getIconSvg('add')}
                        <span>New</span>
                    </a>
                    <a href="#" class="command-btn" id="open-file-btn">
                        ${getIconSvg('openFile')}
                        <span>Open</span>
                    </a>
                    <a href="#" class="command-btn" id="file-explorer-btn">
                        ${getIconSvg('fileExplorer')}
                        <span>Files</span>
                    </a>
                    <a href="#" class="command-btn" id="repository-btn">
                        ${getIconSvg('git')}
                        <span>Git</span>
                    </a>
                    <a href="#" class="command-btn" id="ai-btn">
                        ${getIconSvg('ai')}
                        <span>AI</span>
                    </a>
                    <a href="#" class="command-btn" id="settings-btn">
                        ${getIconSvg('settings')}
                        <span>Settings</span>
                    </a>
                </div>
            </main>
        `;

        document.getElementById('new-file-btn').addEventListener('click', (e) => {
            e.preventDefault();
            isCreatingRepo = false;
            showModal('Create New File');
        });

        document.getElementById('open-file-btn').addEventListener('click', (e) => {
            e.preventDefault();
            alert("Open File functionality is not yet implemented.");
        });
        
        document.getElementById('file-explorer-btn').addEventListener('click', (e) => {
            e.preventDefault();
            renderFileExplorer();
        });

        document.getElementById('repository-btn').addEventListener('click', (e) => {
            e.preventDefault();
            renderRepositoryExplorer();
        });

        document.getElementById('ai-btn').addEventListener('click', (e) => {
            e.preventDefault();
            renderTitanAIInterface();
        });

        document.getElementById('settings-btn').addEventListener('click', (e) => {
            e.preventDefault();
            alert("Settings functionality is not yet implemented.");
        });

        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                e.preventDefault();
                const repoId = parseInt(card.dataset.repo-id);
                const repositories = await db.getAllItems('repositories');
                activeRepo = repositories.find(repo => repo.id === repoId);
                if (activeRepo) {
                    renderFileExplorer();
                }
            });
        });
    };

    // Function to render the file explorer page
    const renderFileExplorer = async () => {
        if (!activeRepo) {
            appContainer.innerHTML = `<div class="container"><p style="text-align: center; color: var(--text-secondary); padding-top: 2rem;">No active repository. Please create or open one from the home screen.</p></div>`;
            return;
        }
        
        const files = await db.getAllItems('files');
        const activeRepoFiles = files.filter(file => file.repoId === activeRepo.id);

        const fileListHtml = activeRepoFiles.map(file => {
            const fileExtension = file.name.split('.').pop();
            let iconClass = 'file-icon';
            if (fileExtension === 'html') iconClass += ' html';
            if (fileExtension === 'css') iconClass += ' css';
            if (fileExtension === 'js') iconClass += ' js';

            return `
                <div class="file-item">
                    <div class="${iconClass}">
                        ${getIconSvg(fileExtension === 'html' ? 'html' : fileExtension === 'css' ? 'css' : fileExtension === 'js' ? 'js' : 'newFile')}
                    </div>
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-date">Last modified: ${new Date(file.lastModified).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');

        appContainer.innerHTML = `
            <div class="container">
                <header class="file-explorer-header">
                    <div class="header-buttons left">
                        <button class="nav-btn" id="back-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    </div>
                    <h2 class="header-title">${activeRepo.name}</h2>
                    <div class="header-buttons right">
                        <button class="nav-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </button>
                        <button class="nav-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                </header>
                <div class="file-list">
                    ${fileListHtml || `<p style="text-align: center; color: var(--text-secondary); padding-top: 2rem;">This repository is empty.</p>`}
                </div>
            </div>
        `;
        document.getElementById('back-btn').addEventListener('click', renderHomeScreen);
    };

    const renderRepositoryExplorer = async () => {
        const repositories = await db.getAllItems('repositories');
        const repoListHtml = repositories.map(repo => `
            <a href="#" class="file-item repo-item" data-repo-id="${repo.id}">
                <div class="file-icon folder">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="file-info">
                    <span class="file-name">${repo.name}</span>
                    <span class="file-date">Last modified: ${new Date(repo.lastModified).toLocaleString()}</span>
                </div>
            </a>
        `).join('');

        appContainer.innerHTML = `
            <div class="container">
                <header class="file-explorer-header">
                    <div class="header-buttons left">
                        <button class="nav-btn" id="back-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    </div>
                    <h2 class="header-title">Repositories</h2>
                    <div class="header-buttons right">
                        <button class="nav-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </button>
                        <button class="nav-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                </header>
                <div class="file-list">
                    ${repoListHtml || `<p style="text-align: center; color: var(--text-secondary); padding-top: 2rem;">No repositories found. Tap the "New Repository" button to create one.</p>`}
                </div>
            </div>
        `;
        document.getElementById('back-btn').addEventListener('click', renderHomeScreen);
        document.querySelectorAll('.repo-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const repoId = parseInt(item.dataset.repo-id);
                const repositories = await db.getAllItems('repositories');
                activeRepo = repositories.find(repo => repo.id === repoId);
                if (activeRepo) {
                    renderFileExplorer();
                }
            });
        });
    };
    
    // Function to add a message to the chat history
    const addChatMessage = (message, sender) => {
        const chatHistory = document.querySelector('.chat-history');
        if (chatHistory) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', `${sender}-message`);
            messageElement.innerHTML = `<p>${message}</p>`;
            chatHistory.appendChild(messageElement);
            chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the latest message
        }
    };

    const renderTitanAIInterface = () => {
        appContainer.innerHTML = `
            <div class="container">
                <header class="file-explorer-header">
                    <div class="header-buttons left">
                        <button class="nav-btn" id="back-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    </div>
                    <h2 class="header-title">Titan AI</h2>
                </header>
                <div class="gemini-interface-container">
                    <div class="chat-history">
                        <div class="chat-message titan-ai-message">
                            <p>Hi! I'm Titan AI. I'm a PWA-building assistant. I can analyze your files and help you write code. What can I help you with today?</p>
                        </div>
                    </div>
                    <div class="input-area">
                        <textarea id="titan-ai-prompt-input" placeholder="Type your request here..."></textarea>
                        <button id="titan-ai-send-btn">${getIconSvg('ai')}</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('back-btn').addEventListener('click', renderHomeScreen);
        
        const titanAIPromptInput = document.getElementById('titan-ai-prompt-input');
        const titanAISendBtn = document.getElementById('titan-ai-send-btn');

        if (titanAISendBtn && titanAIPromptInput) {
            titanAISendBtn.addEventListener('click', async () => {
                const userPrompt = titanAIPromptInput.value.trim();

                if (userPrompt) {
                    addChatMessage(userPrompt, 'user');
                    titanAIPromptInput.value = '';

                    titanAISendBtn.disabled = true;
                    titanAISendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="loading-spinner"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;

                    // Fetch all files from the active repository to send to the AI
                    const allFiles = activeRepo ? await db.getAllItems('files') : [];
                    const filesInRepo = allFiles.filter(file => file.repoId === activeRepo.id);
                    const fileContent = filesInRepo.map(file => ({ name: file.name, content: file.content }));
                    
                    const responseData = await callTitanAI({ 
                        prompt: userPrompt,
                        repoFiles: fileContent,
                    });

                    if (responseData) {
                        addChatMessage(responseData.message, 'titan-ai');
                    } else {
                        addChatMessage('An error occurred. Please try again.', 'titan-ai');
                    }

                    titanAISendBtn.disabled = false;
                    titanAISendBtn.innerHTML = getIconSvg('ai');
                }
            });
        }
    };
    
    // Modal functions
    const showModal = (title) => {
        filenameTitle.textContent = title;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
            optionsContainer.classList.remove('hidden');
            inputSection.classList.add('hidden');
        }, 10);
    };

    const hideModal = () => {
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
    };

    createNewFileBtn.addEventListener('click', () => {
        isCreatingRepo = false;
        optionsContainer.classList.add('hidden');
        inputSection.classList.remove('hidden');
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    newRepoBtn.addEventListener('click', () => {
        isCreatingRepo = true;
        optionsContainer.classList.add('hidden');
        inputSection.classList.remove('hidden');
        filenameInput.disabled = false;
        filenameInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
        hideModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
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
        if (!confirmBtn.disabled) {
            const name = filenameInput.value.trim();
            if (name) {
                if (isCreatingRepo) {
                    const newRepo = { name: name, lastModified: new Date() };
                    const repoId = await db.addItem('repositories', newRepo);
                    activeRepo = { id: repoId, ...newRepo };
                    alert(`Repository '${name}' created!`);
                    renderHomeScreen();
                } else {
                    if (!activeRepo) {
                        alert("Please create a repository first.");
                        return;
                    }
                    const newFile = {
                        name: name,
                        content: '', // Start with empty content
                        repoId: activeRepo.id,
                        lastModified: new Date()
                    };
                    await db.addItem('files', newFile);
                    alert(`File '${name}' created in '${activeRepo.name}'!`);
                    renderFileExplorer();
                }
                hideModal();
            }
        }
    });
    
    // -----------------------------
    // CLOUDFLARE WORKER GEMINI CALL
    // -----------------------------
    const GEMINI_WORKER_URL = 'https://titandeveloper.pjksgnkzt7-cf9.workers.dev';

    async function callTitanAI(payload) {
        try {
            const response = await fetch(GEMINI_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Worker error: ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error('Titan AI Worker call failed:', err);
            return null;
        }
    }

    // Initial render of the home screen
    renderHomeScreen();
});

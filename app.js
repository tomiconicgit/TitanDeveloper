document.addEventListener('DOMContentLoaded', async () => {
    // Wait for the db module to be ready.
    try {
        await window.db.ready;
    } catch (e) {
        console.error("Failed to initialize database:", e);
        // Display a user-friendly error message on the screen
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

    // Command Bar elements
    const commandBar = document.createElement('div');
    commandBar.className = 'command-bar';
    commandBar.innerHTML = `
        <button id="home-btn" class="command-btn active" data-page="home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 9h3v12h5v-7h2v7h5V9h3L12 2zm0 2.24l7 5.25v.76h-2v9h-3v-7h-4v7h-3v-9H5.24l7-5.25z"/>
            </svg>
            <span>Home</span>
        </button>
        <button id="ai-btn" class="command-btn" data-page="ai">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 11h2c-.5-3.32-3.8-6-7-6-3.79 0-7 2.21-7 6s3.21 6 7 6a6.99 6.99 0 005.18-2.52L17.5 15.5 19 14l-4.5-4.5zM7 7c2.42 0 4.5 2.1 4.5 4.5S9.42 16 7 16s-4.5-2.1-4.5-4.5S4.58 7 7 7z"/>
            </svg>
            <span>AI</span>
        </button>
        <button id="explore-btn" class="command-btn" data-page="explore">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
            <span>Explore</span>
        </button>
        <button id="profile-btn" class="command-btn" data-page="profile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12 8.5 10.43 8.5 8.5 10.07 5 12 5zm0 14.2c-2.67 0-5.26-.8-7.5-2.22 2.34-1.35 5.25-2.28 7.5-2.28s5.16.93 7.5 2.28c-2.24 1.42-4.83 2.22-7.5 2.22z"/>
            </svg>
            <span>Profile</span>
        </button>
        <button id="settings-btn" class="command-btn" data-page="settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8zM4 12a8 8 0 1116 0 8 8 0 01-16 0zm10-7h-4V3h4v2zm-4 14h4v-2h-4v2zM19 10h2v4h-2v-4zM3 10h2v4H3v-4zm15-4h2v2h-2V6zm-12 0h2v2H6V6zm14 12h-2v-2h2v2zM6 18h2v-2H6v2z"/>
            </svg>
            <span>Settings</span>
        </button>
        <button id="new-file-btn" class="command-btn" data-page="new">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>New</span>
        </button>
    `;
    document.body.appendChild(commandBar);

    // Initial page load
    renderPage('home');

    // Page navigation logic
    document.querySelectorAll('.command-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            // Handle the 'new' button separately to show the modal
            if (page === 'new') {
                showModal('options');
            } else {
                renderPage(page);
            }
        });
    });

    function renderPage(pageName) {
        // Remove 'active' class from all buttons and add to the clicked one
        document.querySelectorAll('.command-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.command-btn[data-page="${pageName}"]`).classList.add('active');

        // Clear existing content and render the new page
        appContainer.innerHTML = '';
        hideModal();

        switch (pageName) {
            case 'home':
                renderHomePage();
                break;
            case 'ai':
                renderAIPage();
                break;
            case 'explore':
                renderFileExplorerPage();
                break;
            case 'profile':
                appContainer.innerHTML = '<main class="center-content"><h2>Your Profile</h2><p>This page is under construction.</p></main>';
                break;
            case 'settings':
                appContainer.innerHTML = '<main class="center-content"><h2>Settings</h2><p>Customize your experience here.</p></main>';
                break;
            default:
                appContainer.innerHTML = '<main class="center-content"><h2>Page Not Found</h2><p>The page you requested does not exist.</p></main>';
                break;
        }
    }

    // Home Screen Rendering
    async function renderHomePage() {
        const files = await window.db.getAllItems('files');
        const recentProjectsHtml = files.slice(-4).reverse().map(file => `
            <a href="#" class="project-card" data-file-id="${file.id}">
                <div class="project-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2H5C3.34 2 2 3.34 2 5v14c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V9l-7-7zM7 22v-3h-2v-2h-2v3c0 1.1.9 2 2 2h2zm10 0h2c1.1 0 2-.9 2-2v-3h-2v2h-2v3zm-3-12h2v2h-2v-2zm-2-2h2V7h-2v2zm-2-2h2V7h-2v2z"/>
                    </svg>
                </div>
                <h3 class="project-title">${file.name}</h3>
                <p class="project-date">Last edited: ${new Date(file.timestamp).toLocaleDateString()}</p>
            </a>
        `).join('');

        appContainer.innerHTML = `
            <main>
                <div class="logo">
                    <h1 class="titan">TITAN</h1>
                    <p class="developer">DEVELOPER</p>
                </div>
                <div class="recent-projects-container">
                    <div class="recent-projects-header">
                        <h2>Recent Projects</h2>
                        <a href="#" onclick="renderPage('explore'); return false;">See All</a>
                    </div>
                    <div class="recent-projects-grid">
                        ${recentProjectsHtml || '<p class="no-projects">No recent projects. Create one now!</p>'}
                    </div>
                </div>
            </main>
        `;
    }

    // AI Page Rendering
    function renderAIPage() {
        appContainer.innerHTML = `
            <div class="gemini-interface-container">
                <div class="chat-history">
                    </div>
                <div class="input-area">
                    <textarea id="titan-ai-prompt-input" placeholder="Ask AI to write code..."></textarea>
                    <button id="titan-ai-send-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="send-icon">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for AI chat
        const chatHistory = document.querySelector('.chat-history');
        const promptInput = document.getElementById('titan-ai-prompt-input');
        const sendBtn = document.getElementById('titan-ai-send-btn');

        sendBtn.addEventListener('click', async () => {
            const userMessage = promptInput.value.trim();
            if (userMessage === '') return;

            // Add user message to chat
            chatHistory.innerHTML += `<div class="chat-message user-message">${userMessage}</div>`;
            promptInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Simulate AI response
            chatHistory.innerHTML += `<div class="chat-message titan-ai-message">AI is thinking...</div>`;
            chatHistory.scrollTop = chatHistory.scrollHeight;

            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

            // Replace "thinking" message with actual response
            const lastMessage = chatHistory.lastElementChild;
            lastMessage.innerHTML = `The AI has generated some amazing code for you! 🤖`;
            chatHistory.scrollTop = chatHistory.scrollHeight;
        });
    }

    // File Explorer Page Rendering
    async function renderFileExplorerPage() {
        const files = await window.db.getAllItems('files');
        const fileListHtml = files.map(file => {
            const fileType = file.name.split('.').pop().toLowerCase();
            const iconClass = ['html', 'css', 'js'].includes(fileType) ? fileType : 'default';
            return `
                <a href="#" class="file-item" data-file-id="${file.id}">
                    <div class="file-icon ${iconClass}">
                        ${iconClass === 'html' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.75 3.75v16.5h16.5V3.75H3.75zm1.5 1.5h13.5v13.5H5.25V5.25z"/></svg>' :
                      iconClass === 'css' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V5H3v2z"/></svg>' :
                      iconClass === 'js' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>' :
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>'
                      }
                    </div>
                    <div class="file-info">
                        <h3 class="file-name">${file.name}</h3>
                        <p class="file-date">${new Date(file.timestamp).toLocaleString()}</p>
                    </div>
                </a>
            `;
        }).join('');

        appContainer.innerHTML = `
            <main>
                <div class="file-explorer-header">
                    <h2 class="header-title">File Explorer</h2>
                    <div class="header-buttons">
                        <button class="nav-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                        <button class="nav-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                    </div>
                </div>
                <div class="file-list">
                    ${fileListHtml || '<p class="no-files">No files found. Create a new one!</p>'}
                </div>
            </main>
        `;
    }

    // Modal logic
    function showModal(type) {
        modal.classList.add('show');
        if (type === 'options') {
            optionsContainer.classList.remove('hidden');
            inputSection.classList.add('hidden');
        } else if (type === 'input') {
            optionsContainer.classList.add('hidden');
            inputSection.classList.remove('hidden');
        }
    }

    function hideModal() {
        modal.classList.remove('show');
        optionsContainer.classList.add('hidden');
        inputSection.classList.add('hidden');
        filenameInput.value = '';
        filenameInput.disabled = true;
        confirmBtn.classList.remove('enabled');
        confirmBtn.disabled = true;
    }

    modal.addEventListener('click', (e) => {
        if (e.target.id === 'modal' || e.target.id === 'cancel-btn') {
            hideModal();
        }
    });

    createNewFileBtn.addEventListener('click', () => {
        filenameTitle.textContent = 'New File';
        filenameInput.placeholder = 'e.g., index.html';
        filenameInput.disabled = false;
        filenameInput.focus();
        showModal('input');
    });

    newRepoBtn.addEventListener('click', () => {
        filenameTitle.textContent = 'New Repository';
        filenameInput.placeholder = 'e.g., my-pwa-project';
        filenameInput.disabled = false;
        filenameInput.focus();
        showModal('input');
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
            await window.db.addItem(store, newItem);
            console.log(`${store === 'files' ? 'File' : 'Repository'} created:`, newItem);
            hideModal();
            // Re-render the current page to show the new item
            const currentPage = document.querySelector('.command-btn.active').dataset.page;
            if (currentPage === 'home' || currentPage === 'explore') {
                renderPage(currentPage);
            }
        } catch (e) {
            console.error("Error creating item:", e);
            window.logCustomError("Failed to create new item", e);
            alert("An error occurred. Please try again.");
        }
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const modal = document.getElementById('modal');
    const optionsContainer = document.getElementById('options-container');
    const createNewFileBtn = document.getElementById('create-new-file-btn');
    const newRepoBt = document.getElementById('new-repo-btn');
    const inputSection = document.getElementById('input-section');
    const filenameInput = document.getElementById('filename');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Helper function to render SVG icons
    const getIconSvg = (name) => {
        const icons = { /* same as your original icons object */ };
        return icons[name] || '';
    };

    // Function to render the home screen
    const renderHomeScreen = () => {
        // ... your existing code
        appContainer.innerHTML = `
            <main>
                <div class="gemini-interface">
                    <textarea id="gemini-prompt-input" placeholder="Type your request here..."></textarea>
                    <button id="gemini-send-btn">Ask Gemini</button>
                </div>

                </main>
        `;

        // IMPORTANT: Re-add existing event listeners here after re-rendering the HTML
        document.getElementById('new-file-btn').addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
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
        document.getElementById('settings-btn').addEventListener('click', (e) => {
            e.preventDefault();
            alert("Settings functionality is not yet implemented.");
        });

        // NEW: Add the event listener for the new Gemini button
        const geminiPromptInput = document.getElementById('gemini-prompt-input');
        const geminiSendBtn = document.getElementById('gemini-send-btn');

        if (geminiSendBtn && geminiPromptInput) {
            geminiSendBtn.addEventListener('click', async () => {
                const userPrompt = geminiPromptInput.value.trim();

                if (userPrompt) {
                    geminiSendBtn.disabled = true;
                    geminiSendBtn.textContent = 'Generating...';

                    const responseData = await callGemini({ prompt: userPrompt });

                    geminiSendBtn.disabled = false;
                    geminiSendBtn.textContent = 'Ask Gemini';

                    if (responseData) {
                        alert(`Gemini says: ${responseData.message}`);
                    } else {
                        alert('An error occurred. Please try again.');
                    }
                }
            });
        }
    };

    // Function to render the file explorer page
    const renderFileExplorer = () => { /* same as your original renderFileExplorer */ };
    const renderRepositoryExplorer = () => { /* same as your original renderRepositoryExplorer */ };

    // Modal functions (same as original)
    const showModal = () => { /* same as original */ };
    const hideModal = () => { /* same as original */ };

    createNewFileBtn.addEventListener('click', () => { /* same */ });
    newRepoBtn.addEventListener('click', () => { /* same */ });
    cancelBtn.addEventListener('click', () => { /* same */ });
    modal.addEventListener('click', (e) => { /* same */ });
    filenameInput.addEventListener('input', () => { /* same */ });
    confirmBtn.addEventListener('click', () => { /* same */ });

    // -----------------------------
    // CLOUDFLARE WORKER GEMINI CALL
    // -----------------------------
    const GEMINI_WORKER_URL = 'https://titandeveloper.pjksgnkzt7-cf9.workers.dev';

    async function callGemini(payload) {
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
            console.error('Gemini Worker call failed:', err);
            return null;
        }
    }

    // Initial render of the home screen
    renderHomeScreen();
});

// mainpage.js

// CSS content as a single string
const pageStyles = `
/* Base styles and layout for mobile */
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    margin: 0;
    background-color: #000;
    color: #fff;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.main-content-scroll {
    flex-grow: 1;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
}

header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 20px 40px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
}

.logo svg {
    margin-right: 10px;
    width: 32px;
    height: 32px;
    fill: white;
}

.alert-banner {
    background-color: #000;
    text-align: center;
    padding: 15px 0;
    border-bottom: 1px solid #333;
    z-index: 5;
}

.alert-banner p {
    margin: 5px 0;
    font-size: 16px;
}

.footer {
    text-align: center;
    padding: 20px 0;
    font-size: 12px;
    color: #aaa;
    background-color: #000;
    z-index: 10;
    position: relative;
    margin-top: -50px;
}

@media (max-width: 768px) {
    header {
        padding: 15px 20px;
    }
}

/* New banner and button CSS */
.page-content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    padding-bottom: 50px;
}

#action-button-wrapper {
    margin-top: 20px;
}

.transform-button-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    height: 50px;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    border-radius: 50px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    z-index: 999;
}

.transform-button-container.active {
    border-radius: 10px;
}

.button-label {
    color: #000;
    font-weight: bold;
    font-size: 16px;
    white-space: nowrap;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.transform-button-container.active .button-label {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
}

.transform-dropdown-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    list-style: none;
    padding: 0;
    margin: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    background-color: #fff;
    border-radius: 50px;
}

.transform-button-container.active .transform-dropdown-menu {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    height: 200px;
    border-radius: 10px;
}

.transform-dropdown-menu li {
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
}

.transform-dropdown-menu li:not(:last-child) {
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.15);
}

.transform-dropdown-menu li a {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    font-weight: bold;
    color: #000;
    text-decoration: none;
    font-size: 14px;
    padding: 0 10%;
    border-radius: 5px;
    text-align: left;
    box-sizing: border-box;
    transition: background-color 0.1s ease, transform 0.1s ease;
}

.transform-dropdown-menu li a:active {
    background-color: #e0e0e0;
    transform: scale(0.98);
}

.hero-section {
    padding: 80px 40px;
    text-align: center;
    margin-top: 0;
    margin-bottom: 0;
    position: relative;
    z-index: 5;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hero-content {
    background-color: #1a1a1a;
    padding: 70px 40px 70px;
    border-radius: 10px;
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    z-index: 2;
}

.hero-content h1 {
    font-size: 48px;
    margin-top: -30px;
    margin-bottom: 0;
    line-height: 1.2;
    color: #fff;
}

.hero-content p {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    color: #000;
    font-weight: bold;
    position: relative;
    z-index: 3;
    margin-top: 20px;
}

.gradient-background {
    position: absolute;
    bottom: -70px;
    left: 0;
    width: 100%;
    height: 250px;
    background: linear-gradient(to right, #ff4500, #ffa500, #ffd700, #ffff00);
    mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
    z-index: 0;
}

.triangle-overlay {
    position: absolute;
    bottom: -70px;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
    width: 80px;
    height: 80px;
    background-color: #000;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    z-index: 1;
}

.fade-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
    z-index: 1;
    pointer-events: none;
}

@media (max-width: 768px) {
    .hero-content {
        padding: 70px 20px 60px;
    }
    .hero-content h1 {
        font-size: 36px;
    }
    .hero-content p {
        font-size: 16px;
    }
}

/* --- Modal Styles --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.visible {
    visibility: visible;
    opacity: 1;
}

.modal-content {
    background-color: #000;
    border: none;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    transform: scale(0.7);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    margin-top: -80px;
}

.modal-overlay.visible .modal-content {
    transform: scale(1);
}

.modal-title {
    color: #fff;
    font-size: 20px;
    margin-bottom: 20px;
}

#file-name-input {
    width: 200px;
    padding: 10px;
    border: none;
    background-color: #fff;
    color: #000;
    border-radius: 5px;
    text-align: center;
    font-size: 16px;
    outline: none;
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.modal-actions button {
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin: 0 5px;
    transition: background-color 0.2s ease, color 0.2s ease;
}

#cancel-button {
    background-color: #dc3545;
    color: #fff;
}

#confirm-button {
    background-color: #fff;
    color: #000;
}

#confirm-button:disabled {
    background-color: #555;
    color: #aaa;
    cursor: not-allowed;
}
`;

// Injects the CSS styles into the document's head
function injectStyles(styles) {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
}


// Mocking placeholders for code editor and repository manager logic
const codeEditor = {
    openFile: function(fileName) {
        console.log(`Code editor opening file: ${fileName}`);
        const extension = fileName.split('.').pop();
        console.log(`Detected file type: ${extension}`);

        switch (extension) {
            case 'js':
                console.log('Loading JavaScript plugins...');
                break;
            case 'html':
                console.log('Loading HTML plugins...');
                break;
            case 'css':
                console.log('Loading CSS plugins...');
                break;
            default:
                console.log('No specific plugins for this file type.');
        }
    }
};

const repoManager = {
    openRepo: function(repoName) {
        console.log(`Opening new repository: ${repoName}`);
        console.log(`Sliding in the repo root page...`);
    },
    unpackAndOpenRepo: function(zipFileName) {
        console.log(`Attempting to unpack zip file: ${zipFileName}`);
        console.log(`Simulating unpacking...`);
        console.log(`Successfully unpacked contents into a new repository.`);
        this.openRepo(zipFileName.replace('.zip', ''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inject the CSS first
    injectStyles(pageStyles);

    // DOM elements
    const newFileModal = document.getElementById('new-file-modal');
    const modalTitle = newFileModal.querySelector('.modal-title');
    const fileNameInput = document.getElementById('file-name-input');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');
    const fileUploadInput = document.getElementById('file-upload');
    const wrapper = document.getElementById('action-button-wrapper');

    let currentAction = null;

    // Function to create the transforming button with its menu
    function createTransformingButton(options) {
        const container = document.createElement('div');
        container.className = 'transform-button-container';

        const buttonLabel = document.createElement('span');
        buttonLabel.className = 'button-label';
        buttonLabel.textContent = 'Tap to Open';

        const menu = document.createElement('ul');
        menu.className = 'transform-dropdown-menu';

        options.forEach(optionText => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = optionText;

            if (optionText === 'New File') {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showModal('Create New File..', 'newFile', true);
                    container.classList.remove('active');
                });
            } else if (optionText === 'Open File') {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileUploadInput.setAttribute('accept', '.js,.css,.html');
                    fileUploadInput.click();
                    container.classList.remove('active');
                });
            } else if (optionText === 'Open Zip') {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileUploadInput.setAttribute('accept', '.zip');
                    fileUploadInput.click();
                    container.classList.remove('active');
                });
            } else if (optionText === 'New Repository') {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showModal('Create New Repository..', 'newRepo', false);
                    container.classList.remove('active');
                });
            } else {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Selected: ${optionText}`);
                    container.classList.remove('active');
                });
            }

            li.appendChild(a);
            menu.appendChild(li);
        });

        container.appendChild(buttonLabel);
        container.appendChild(menu);

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (container.classList.contains('active') && !container.contains(e.target)) {
                container.classList.remove('active');
            }
        });

        return container;
    }

    // Function to display the modal dynamically
    function showModal(title, action, requiresExtension) {
        modalTitle.textContent = title;
        currentAction = action;
        
        // Remove previous input listener to prevent multiple triggers
        fileNameInput.removeEventListener('input', handleInputValidation);
        
        // Add new listener with dynamic logic
        function handleInputValidation() {
            const value = fileNameInput.value.trim();
            if (requiresExtension) {
                confirmButton.disabled = !value.includes('.');
            } else {
                confirmButton.disabled = value.length === 0;
            }
        }
        fileNameInput.addEventListener('input', handleInputValidation);
        
        newFileModal.classList.add('visible');
        fileNameInput.value = '';
        confirmButton.disabled = true;
        fileNameInput.focus();
    }

    // Function to hide the modal
    function hideModal() {
        newFileModal.classList.remove('visible');
        fileNameInput.value = '';
        confirmButton.disabled = true;
        currentAction = null;
    }

    // Event listeners
    confirmButton.addEventListener('click', () => {
        const value = fileNameInput.value.trim();
        if (value.length > 0) {
            hideModal();
            if (currentAction === 'newFile') {
                codeEditor.openFile(value);
            } else if (currentAction === 'newRepo') {
                repoManager.openRepo(value);
            }
        } else {
            alert('Please enter a valid name.');
        }
    });

    cancelButton.addEventListener('click', hideModal);
    
    fileUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const isZip = file.name.toLowerCase().endsWith('.zip');
            if (isZip) {
                repoManager.unpackAndOpenRepo(file.name);
            } else {
                codeEditor.openFile(file.name);
            }
            e.target.value = '';
        }
    });

    // Initialize the transforming button
    const options = ['New File', 'Open File', 'Open Zip', 'New Repository'];
    const myTransformingButton = createTransformingButton(options);
    
    wrapper.appendChild(myTransformingButton);
});

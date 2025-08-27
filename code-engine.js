// This file is the core of our custom code editor and file system logic.
// It has no external dependencies.
(function() {
    'use strict';

    // A simple, zero-dependency syntax highlighter.
    // It uses a map of file extensions to define highlighting rules.
    const SYNTAX_RULES = {
        html: {
            tags: /(<\/?\w+[\s\S]*?>)/g,
            attributes: /(\b\w+)=/g,
            strings: /("|')([^"']*)("|')/g,
            comments: /()/g,
            doctype: /(<!DOCTYPE[\s\S]*?>)/g,
        },
        css: {
            selectors: /(.+?)(?={)/g,
            properties: /(\b\w+-?[\w-]*):/g,
            values: /:([\s\S]+?)(?=;)/g,
            comments: /(\/\*[\s\S]*?\*\/)/g,
            strings: /("|')([^"']*)("|')/g,
        },
        js: {
            keywords: /\b(let|const|var|function|class|return|if|else|for|while|do|import|export|from|async|await|new|this|try|catch|finally|throw|switch|case|break)\b/g,
            functions: /(\b\w+)\s*(?=\()/g,
            classes: /\b(String|Number|Boolean|Array|Object|Promise|Symbol|Map|Set|RegExp|Error)\b/g,
            constants: /(\b[A-Z_]+)\b/g,
            strings: /("|`)(?:\\.|[^"\\])*(")/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        },
        json: {
            keys: /"([^"]+)":/g,
            strings: /"([^"]+)"/g,
            numbers: /(\b\d+(\.\d+)?\b)/g,
            booleans: /\b(true|false|null)\b/g,
        },
        md: {
            headings: /(#+.*)/g,
            bold: /(\*\*|__)(.*?)\1/g,
            italic: /(\*|_)(.*?)\1/g,
            links: /(\[.*?\]\(.*?\))/g,
        },
        ts: {
            keywords: /\b(let|const|var|function|class|return|if|else|for|while|do|import|export|from|async|await|new|this|try|catch|finally|throw|switch|case|break|interface|type|public|private|protected)\b/g,
            types: /\b(string|number|boolean|any|void|never|unknown)\b/g,
            functions: /(\b\w+)\s*(?=\()/g,
            strings: /("|`)(?:\\.|[^"\\])*(")/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        },
        jsx: {
            keywords: /\b(let|const|var|function|class|return|if|else|for|while|do|import|export|from|async|await|new|this|try|catch|finally|throw|switch|case|break)\b/g,
            tags: /(<\/?\w+[\s\S]*?>)/g,
            attributes: /(\b\w+)=/g,
            strings: /("|')([^"']*)("|')/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        },
        vue: {
            tags: /(<\/?\w+[\s\S]*?>)/g,
            attributes: /(\b\w+)=/g,
            strings: /("|')([^"']*)("|')/g,
            comments: /(|\/\/.*|\/\*[\s\S]*?\*\/)/g,
        },
        scss: {
            selectors: /(.+?)(?={)/g,
            properties: /(\b\w+-?[\w-]*):/g,
            values: /:([\s\S]+?)(?=;)/g,
            comments: /(\/\*[\s\S]*?\*\/)/g,
            variables: /(\$\w+)/g,
            strings: /("|')([^"']*)("|')/g,
        },
        svg: {
            tags: /(<\/?\w+[\s\S]*?>)/g,
            attributes: /(\b\w+)=/g,
            strings: /("|')([^"']*)("|')/g,
            comments: /()/g,
        },
        // Add more languages as needed
    };

    const getFileType = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'yml') return 'yaml';
        if (ext === 'tsx') return 'jsx';
        if (ext === 'sass') return 'scss';
        return ext;
    };

    const getIconSvg = (fileType) => {
        const icons = {
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 16.5L14 12l-4-4"></path></svg>`,
            css: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 17.5l-2-2m4-2l-2-2"></path></svg>`,
            js: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 16.5L14 12l-4-4"></path></svg>`,
            json: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8.5 12.5L12 16l3.5-3.5"></path></svg>`,
            yaml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="8" y2="12"></line><line x1="16" y1="12" x2="16" y2="12"></line></svg>`,
            md: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 16l3-3 3 3M12 8v8"></path></svg>`,
            ts: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M11 12H9M13 12H15M12 10v4"></path></svg>`,
            jsx: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 16.5L14 12l-4-4"></path></svg>`,
            vue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 17l-3-5 3-5 3 5-3 5z"></path></svg>`,
            scss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="12" x2="15" y2="12"></line><line x1="12" y1="9" x2="12" y2="15"></line></svg>`,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="12" cy="12" r="3"></circle></svg>`,
            default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
        };
        return icons[fileType] || icons.default;
    };

    const highlightCode = (code, fileName) => {
        const fileType = getFileType(fileName);
        const rules = SYNTAX_RULES[fileType];

        if (!rules) {
            return `<span class="plain-text">${code}</span>`;
        }

        let highlightedCode = code;
        for (const [token, regex] of Object.entries(rules)) {
            highlightedCode = highlightedCode.replace(regex, `<span class="token-${token}">$&</span>`);
        }

        highlightedCode = highlightedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        for (const [token, regex] of Object.entries(rules)) {
            highlightedCode = highlightedCode.replace(new RegExp(`&lt;span class="token-${token}"&gt;(.*?)&lt;/span&gt;`, 'g'), `<span class="token-${token}">$1</span>`);
        }

        return highlightedCode;
    };

    const downloadFile = (fileName, content) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareFile = async (fileName, content) => {
        if (navigator.share) {
            try {
                const file = new File([content], fileName, { type: 'text/plain' });
                await navigator.share({
                    files: [file],
                    title: `Titan IDE: ${fileName}`,
                    text: `Check out this file I created with Titan IDE!`,
                });
            } catch (error) {
                console.error('Sharing failed:', error);
                alert('Sharing failed. Your device might not support this feature.');
            }
        } else {
            alert('Your device does not support the Web Share API.');
        }
    };

    window.fileEngine = {
        highlightCode,
        getFileType,
        getIconSvg,
        downloadFile,
        shareFile,
    };

})();

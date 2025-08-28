// File: plugins/md.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    header: '#0033B3',    // Deep blue for # headers
    link: '#22863A',      // Green for [links](url)
    code: '#6F42C1',      // Purple for `code` and code blocks
    bold: '#D73A49',      // Red for **bold**
    italic: '#1750EB',    // Blue for *italic*
    list: '#DE5833',      // Orange for - lists
    quote: '#8C8C8C',     // Gray for > quotes
    image: '#067D17',     // Green for ![alt](url)
  },
  patterns: [
    { type: 'header', regex: /^(#{1,6})\s+.*/gm },
    { type: 'bold', regex: /\*\*(.*?)\*\*/g },
    { type: 'italic', regex: /\*(.*?)\*/g },
    { type: 'code', regex: /`([^`]+)`/g },
    { type: 'code', regex: /```[\s\S]*?```/g },
    { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g },
    { type: 'image', regex: /!\[([^\]]+)\]\(([^)]+)\)/g },
    { type: 'list', regex: /^(\s*[-*+]\s+)/gm },
    { type: 'quote', regex: /^>\s+.*/gm },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, match => `<span style="color:${this.colors[pat.type]};font-weight:${pat.type === 'header' || pat.type === 'bold' ? 'bold' : 'normal'};font-style:${pat.type === 'italic' ? 'italic' : 'normal'};">${match}</span>`);
    });
    return html;
  },
  lint: function(code) {
    const errors = [];
    const lines = code.split('\n');
    lines.forEach((line, i) => {
      if (/^#{7,}/.test(line)) errors.push(`Header level too deep at line ${i + 1} (max 6)`);
      if (/\[([^\]]+)\]\(([^)]*)\)/.test(line) && !/^https?:\/\//.test(RegExp.$2)) errors.push(`Invalid link URL at line ${i + 1}`);
    });
    if (code.match(/\*\*(?![^*]*\*\*)/g)) errors.push('Unmatched bold markup');
    if (code.match(/\*(?![^*]*\*)/g)) errors.push('Unmatched italic markup');
    return errors;
  }
};
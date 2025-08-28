// File: plugins/yaml.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    key: '#6F42C1',       // Purple for keys
    string: '#067D17',    // Green for strings
    number: '#1750EB',    // Blue for numbers
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for : - |
    anchor: '#D73A49',    // Red for &anchors *aliases
    boolean: '#0033B3',   // Deep blue for true/false
  },
  patterns: [
    { type: 'comment', regex: /#.*$/gm },
    { type: 'anchor', regex: /&[\w-]+|\*[\w-]+/g },
    { type: 'string', regex: /:\s*["'][^"']*["']/g },
    { type: 'string', regex: /:\s*\|[\s\S]*?(?=\n\S|$)/g },
    { type: 'string', regex: /:\s*>\s*[\s\S]*?(?=\n\S|$)/g },
    { type: 'number', regex: /:\s*[-+]?\d+\.?\d*(?:e[+-]?\d+)?\b/g },
    { type: 'boolean', regex: /:\s*(true|false|yes|no|on|off)\b/gi },
    { type: 'key', regex: /^(\s*[\w-]+):/gm },
    { type: 'operator', regex: /[:\-|>/]/g },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, match => `<span style="color:${this.colors[pat.type]};">${match}</span>`);
    });
    return html;
  },
  lint: function(code) {
    const errors = [];
    const lines = code.split('\n');
    let indentStack = [0];
    lines.forEach((line, i) => {
      if (line.trim() === '' || line.trim().startsWith('#')) return;
      const currentIndent = line.match(/^\s*/)[0].length;
      if (currentIndent < indentStack[indentStack.length - 1]) {
        while (currentIndent < indentStack[indentStack.length - 1]) indentStack.pop();
        if (currentIndent !== indentStack[indentStack.length - 1]) errors.push(`Indent mismatch at line ${i + 1}`);
      } else if (currentIndent > indentStack[indentStack.length - 1]) {
        indentStack.push(currentIndent);
      }
      if (/:$/.test(line.trim())) errors.push(`Missing value after colon at line ${i + 1}`);
      if (/^-\s/.test(line) && currentIndent !== indentStack[indentStack.length - 1]) errors.push(`Sequence indent error at line ${i + 1}`);
    });
    return errors;
  }
};
// File: plugins/css.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    selector: '#22863A',  // Green for selectors
    property: '#6F42C1',  // Purple for properties
    value: '#005CC5',     // Blue for values
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for operators (:, ;, {})
    atrule: '#D73A49',    // Red for @rules
    pseudo: '#1750EB',    // Blue for :pseudo
    variable: '#24292E',  // Dark gray for var(--)
  },
  patterns: [
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
    { type: 'string', regex: /"[^"]*"/g },
    { type: 'string', regex: /\'[^\']*\'/g },
    { type: 'atrule', regex: /@[\w-]+/g },
    { type: 'selector', regex: /([^\s;{}]+)(?=\s*\{)/g },
    { type: 'pseudo', regex: /:[\w-]+/g },
    { type: 'property', regex: /([\w-]+)(?=\s*:)/g },
    { type: 'value', regex: /:\s*([^;]+)(?=;)/g },
    { type: 'variable', regex: /var\(--[\w-]+\)/g },
    { type: 'operator', regex: /[:;{}]/g },
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
    const stack = [];
    let inAtRule = false;
    code.split('').forEach((c, i) => {
      if (c === '{') {
        stack.push(c);
        if (/@/.test(code.slice(i-10, i))) inAtRule = true;
      } else if (c === '}') {
        if (stack.pop() !== '{') errors.push(`Mismatched brace at position ${i + 1}`);
        if (stack.length === 0) inAtRule = false;
      }
    });
    if (stack.length) errors.push(`Unclosed braces: ${stack.length} remaining`);
    code.split(';').forEach(dec => {
      if (dec.trim() && !/:/.test(dec)) errors.push(`Invalid declaration (missing :): ${dec.trim()}`);
    });
    return errors;
  }
};
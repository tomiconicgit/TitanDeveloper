// File: plugins/jsx.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    keyword: '#0033B3',   // Deep blue for keywords
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    number: '#1750EB',    // Blue for numbers
    function: '#6F42C1',  // Purple for functions
    operator: '#DE5833',  // Orange for operators
    variable: '#24292E',  // Dark gray for variables
    tag: '#22863A',       // Green for JSX tags
    attribute: '#6F42C1', // Purple for JSX attributes
    punctuation: '#24292E', // Dark gray for punctuation
  },
  patterns: [
    { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
    { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'string', regex: /'(?:[^'\\]|\\.)*'/g },
    { type: 'string', regex: /`(?:[^`\\]|\\.)*`/g },
    { type: 'number', regex: /\b-?\d+\.?\d*(?:e[+-]?\d+)?\b/gi },
    { type: 'keyword', regex: /\b(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|class|try|catch|throw|finally|async|await|import|export|from|true|false|null|undefined|typeof|instanceof|this|super|extends|static|React|useState|useEffect)\b/g },
    { type: 'function', regex: /\b([a-z_]\w*)\s*(?=\()/gi },
    { type: 'operator', regex: /[-+*%&|/!<>=?:;]/g },
    { type: 'tag', regex: /<\/?[\w.]+/g },
    { type: 'attribute', regex: /\b[\w-]+(?==|{)/g },
    { type: 'punctuation', regex: /[{}[\](),.]/g },
    { type: 'variable', regex: /\b([a-z_]\w*)\b/gi },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, match => `<span style="color:${this.colors[pat.type]};">${match}</span>`);
    });
    html = html.replace(/\{([\s\S]*?)\}/g, (match, jsExpr) => {
      const highlightedExpr = jsExpr.replace(/\b(return|if)\b/g, '<span style="color:#0033B3;">$&</span>');
      return `{${highlightedExpr}}`;
    });
    return html;
  },
  lint: function(code) {
    const errors = [];
    const jsxStack = [];
    const parensStack = [];
    const parens = { '(': ')', '[': ']', '{': '}' };
    let inString = false, stringChar, inJsx = false;
    code.split('').forEach((c, i) => {
      if (inString) {
        if (c === stringChar && code[i-1] !== '\\') inString = false;
      } else {
        if (['"', "'", '`'].includes(c)) { inString = true; stringChar = c; return; }
        if (c === '<' && /[a-zA-Z]/.test(code[i+1])) { inJsx = true; jsxStack.push('<'); }
        else if (c === '>' && inJsx) { if (jsxStack.pop() !== '<') errors.push(`Mismatched JSX tag at ${i + 1}`); if (jsxStack.length === 0) inJsx = false; }
        else if (Object.keys(parens).includes(c)) parensStack.push(c);
        else if (Object.values(parens).includes(c)) {
          if (parens[parensStack.pop()] !== c) errors.push(`Mismatched parenthesis at position ${i + 1}`);
        }
      }
    });
    if (parensStack.length) errors.push(`Unclosed parentheses: ${parensStack.length} remaining`);
    if (jsxStack.length) errors.push(`Unclosed JSX tags: ${jsxStack.length} remaining`);
    if (inString) errors.push('Unclosed string');
    return errors;
  }
};
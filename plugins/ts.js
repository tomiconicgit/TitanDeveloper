// File: plugins/ts.js
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
    punctuation: '#24292E', // Dark gray for punctuation
    type: '#22863A',      // Green for types
    interface: '#D73A49', // Red for interface/type names
  },
  patterns: [
    { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
    { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'string', regex: /'(?:[^'\\]|\\.)*'/g },
    { type: 'string', regex: /`(?:[^`\\]|\\.)*`/g },
    { type: 'number', regex: /\b-?\d+\.?\d*(?:e[+-]?\d+)?\b/gi },
    { type: 'keyword', regex: /\b(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|class|try|catch|throw|finally|async|await|import|export|from|as|default|true|false|null|undefined|typeof|instanceof|this|super|extends|static|delete|in|of|yield|void|debugger|with|implements|interface|package|private|protected|public|enum|declare|readonly|abstract|override|namespace|type|keyof|infer|never|unknown|any|asserts|is|module|require|global|augment)\b/g },
    { type: 'interface', regex: /\b(interface|type)\s+([a-z_]\w*)\b/gi },
    { type: 'function', regex: /\b([a-z_]\w*)\s*(?=\()/gi },
    { type: 'type', regex: /\b(string|number|boolean|any|void|unknown|never|object|Array|Promise|Record|Partial|Pick|Omit)\b/g },
    { type: 'operator', regex: /[-+*%&|/!<>=?:;]/g },
    { type: 'punctuation', regex: /[{}[\](),.]/g },
    { type: 'variable', regex: /\b([a-z_]\w*)\b/gi },
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
    const parens = { '(': ')', '[': ']', '{': '}' };
    let inString = false, stringChar;
    code.split('').forEach((c, i) => {
      if (inString) {
        if (c === stringChar && code[i-1] !== '\\') inString = false;
      } else {
        if (['"', "'", '`'].includes(c)) { inString = true; stringChar = c; }
        else if (Object.keys(parens).includes(c)) stack.push(c);
        else if (Object.values(parens).includes(c)) {
          if (parens[stack.pop()] !== c) errors.push(`Mismatched parenthesis at position ${i + 1}`);
        }
      }
    });
    if (stack.length) errors.push(`Unclosed parentheses: ${stack.length} remaining`);
    if (inString) errors.push('Unclosed string');
    if (/\b(let|const|var)\s+[a-z_]\w*\s*(?=[=;])/gi.test(code)) errors.push('Possibly missing type annotation');
    return errors;
  }
};
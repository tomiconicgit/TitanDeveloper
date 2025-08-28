// File: plugins/scss.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    selector: '#22863A',  // Green for selectors
    property: '#6F42C1',  // Purple for properties
    value: '#005CC5',     // Blue for values
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for operators (:, ;, {})
    atrule: '#D73A49',    // Red for @rules (@mixin, @include)
    variable: '#24292E',  // Dark gray for $variables
    pseudo: '#1750EB',    // Blue for :pseudo
  },
  patterns: [
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
    { type: 'string', regex: /"[^"]*"/g },
    { type: 'string', regex: /\'[^\']*\'/g },
    { type: 'atrule', regex: /@(mixin|include|extend|if|else|each|while|for|function|return|import|media|keyframes|content)/g },
    { type: 'selector', regex: /([^\s;{}&+>~]+)(?=\s*\{)/g },
    { type: 'pseudo', regex: /:[\w-]+/g },
    { type: 'property', regex: /([\w-]+)(?=\s*:)/g },
    { type: 'value', regex: /:\s*([^;]+)(?=;)/g },
    { type: 'variable', regex: /\$[\w-]+/g },
    { type: 'operator', regex: /[:;{}&+>~]/g },
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
    code.split('').forEach((c, i) => {
      if (c === '{') stack.push(c);
      else if (c === '}') {
        if (stack.pop() !== '{') errors.push(`Mismatched brace at position ${i + 1}`);
      }
    });
    if (stack.length) errors.push(`Unclosed braces: ${stack.length} remaining`);
    const varsDefined = new Set(code.match(/\$[\w-]+(?=\s*:)/g) || []);
    const varsUsed = code.match(/\$[\w-]+/g) || [];
    varsUsed.forEach(v => {
      if (!varsDefined.has(v)) errors.push(`Possibly undefined variable: ${v}`);
    });
    return errors;
  }
};
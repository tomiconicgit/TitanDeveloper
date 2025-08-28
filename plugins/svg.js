// File: plugins/svg.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    tag: '#22863A',       // Green for tags (e.g., <svg>, <path>)
    attribute: '#6F42C1', // Purple for attributes (e.g., viewBox)
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for =
    pathdata: '#005CC5',  // Blue for d="..." path data
  },
  patterns: [
    { type: 'comment', regex: /<!--[\s\S]*?-->/g },
    { type: 'string', regex: /="[^"]*"/g },
    { type: 'string', regex: /='[^']*'/g },
    { type: 'tag', regex: /<\/?(svg|path|rect|circle|ellipse|line|polyline|polygon|g|defs|use|symbol|image|text|textPath|tspan|clipPath|mask|filter|fe[a-z]+|animate|set|metadata)/gi },
    { type: 'attribute', regex: /\b(viewBox|width|height|d|cx|cy|r|x|y|x1|y1|x2|y2|points|transform|fill|stroke|stroke-width|opacity|id|class|style)(?==)/gi },
    { type: 'operator', regex: /=/g },
    { type: 'pathdata', regex: /d="([MmLlHhVvCcSsQqTtAaZz0-9.,\s]+)"/gi },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, (match, data) => {
        if (data) {
          const highlightedData = data.replace(/([MmLlHhVvCcSsQqTtAaZz])/g, '<span style="color:#D73A49;">$&</span>');
          return match.replace(data, highlightedData);
        }
        return `<span style="color:${this.colors[pat.type]};">${match}</span>`;
      });
    });
    return html;
  },
  lint: function(code) {
    const errors = [];
    const stack = [];
    const tagRegex = /<(\/)?([\w-]+)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(code)) !== null) {
      const isClose = match[1];
      const tag = match[2].toLowerCase();
      if (isClose) {
        if (stack.length === 0 || stack.pop() !== tag) {
          errors.push(`Mismatched closing tag </${tag}> at position ${match.index + 1}`);
        }
      } else {
        stack.push(tag);
      }
    }
    if (stack.length > 0) errors.push(`Unclosed tags: ${stack.join(', ')}`);
    if (!/<svg/.test(code)) errors.push('Missing root <svg> tag');
    return errors;
  }
};
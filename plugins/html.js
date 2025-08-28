// File: plugins/html.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    tag: '#22863A',       // Green for tags
    attribute: '#6F42C1', // Purple for attributes
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for operators (e.g., =)
    doctype: '#D73A49',   // Red for <!DOCTYPE>
    entity: '#1750EB',    // Blue for &entities;
  },
  patterns: [
    { type: 'comment', regex: /<!--[\s\S]*?-->/g },
    { type: 'doctype', regex: /<!DOCTYPE[^>]*>/gi },
    { type: 'string', regex: /="[^"]*"/g },
    { type: 'string', regex: /='[^']*'/g },
    { type: 'tag', regex: /<\/?[\w-]+/g },
    { type: 'attribute', regex: /\b[\w-]+(?==)/g },
    { type: 'operator', regex: /=/g },
    { type: 'entity', regex: /&[\w]+;/g },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, match => `<span style="color:${this.colors[pat.type]};">${match}</span>`);
    });
    html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, jsCode) => {
      const jsPlugin = { highlight: (c) => c.replace(/(function|return)/g, '<span style="color:#0033B3;">$&</span>') };
      return match.replace(jsCode, jsPlugin.highlight(escapeHtml(jsCode)));
    });
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssCode) => {
      const cssPlugin = { highlight: (c) => c.replace(/([a-z-]+)(?=:)/g, '<span style="color:#6F42C1;">$&</span>') };
      return match.replace(cssCode, cssPlugin.highlight(escapeHtml(cssCode)));
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
      } else if (!['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tag)) {
        stack.push(tag);
      }
    }
    if (stack.length > 0) errors.push(`Unclosed tags: ${stack.join(', ')}`);
    if (!/<!DOCTYPE html>/i.test(code)) errors.push('Missing or incorrect DOCTYPE declaration');
    return errors;
  }
};
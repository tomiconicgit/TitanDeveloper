// File: plugins/xml.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    tag: '#22863A',       // Green for tags
    attribute: '#6F42C1', // Purple for attributes
    string: '#067D17',    // Green for strings
    comment: '#8C8C8C',   // Gray for comments
    operator: '#DE5833',  // Orange for =
    cdata: '#005CC5',     // Blue for <![CDATA[]]>
    pi: '#D73A49',        // Red for <?xml ?>
  },
  patterns: [
    { type: 'comment', regex: /<!--[\s\S]*?-->/g },
    { type: 'cdata', regex: /<!\[CDATA\[[\s\S]*?\]\]>/g },
    { type: 'pi', regex: /<\?[\s\S]*?\?>/g },
    { type: 'string', regex: /="[^"]*"/g },
    { type: 'string', regex: /='[^']*'/g },
    { type: 'tag', regex: /<\/?[\w:-]+/g },
    { type: 'attribute', regex: /\b[\w:-]+(?==)/g },
    { type: 'operator', regex: /=/g },
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
    const tagRegex = /<(\/)?([\w:-]+)[^>]*>/g;
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
    if (!/<\?xml/.test(code)) errors.push('Missing XML declaration');
    return errors;
  }
};
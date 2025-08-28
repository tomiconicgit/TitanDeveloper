// File: plugins/json.js
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const plugin = {
  colors: {
    keyword: '#0033B3',   // Deep blue for true/false/null
    string: '#067D17',    // Green for strings
    number: '#1750EB',    // Blue for numbers
    operator: '#DE5833',  // Orange for : , [ ] { }
    punctuation: '#24292E', // Dark gray for , :
  },
  patterns: [
    { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'number', regex: /\b-?\d+\.?\d*(?:e[+-]?\d+)?\b/gi },
    { type: 'keyword', regex: /\b(true|false|null)\b/g },
    { type: 'punctuation', regex: /[:,]/g },
    { type: 'operator', regex: /[{}[\]]/g },
  ],
  highlight: function(code) {
    let html = escapeHtml(code);
    this.patterns.forEach(pat => {
      html = html.replace(pat.regex, match => `<span style="color:${this.colors[pat.type]};">${match}</span>`);
    });
    return html;
  },
  lint: function(code) {
    try {
      JSON.parse(code);
      return [];
    } catch (e) {
      return [e.message];
    }
  }
};
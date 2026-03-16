const fs = require('fs');
const path = require('path');

const root = process.cwd();
const MAX = 14;
const exts = new Set(['.js']);
const ignoreDirs = new Set(['.git', 'node_modules', '.vscode', 'memories']);

function listFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (!ignoreDirs.has(name)) listFiles(full, out);
    } else if (exts.has(path.extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function stripLineComment(line) {
  const state = _scanState();
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (_consumeEscape(state, ch)) continue;
    if (_toggleQuoteState(state, ch)) continue;
    if (_isLineCommentStart(state, line, i)) return line.slice(0, i);
  }
  return line;
}

function countBraces(line) {
  const state = _scanState();
  const braces = { open: 0, close: 0 };
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (_consumeEscape(state, ch)) continue;
    if (_toggleQuoteState(state, ch)) continue;
    _countBrace(ch, state, braces);
  }
  return braces;
}

function sanitizeLine(raw, state) {
  const noLeading = _stripLeadingBlockComment(raw, state);
  if (noLeading === '') return '';
  const noBlocks = _stripInlineBlockComments(noLeading, state);
  return stripLineComment(noBlocks);
}

function detectFunctionStart(line) {
  const t = line.trim();
  if (!t.includes('{')) return null;
  const found = _matchNamedFunction(t) || _matchArrowFunction(t) || _matchMethodFunction(t);
  return found ? { name: found } : null;
}

function _matchNamedFunction(t) {
  const m = t.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/);
  return m ? m[1] : null;
}

function _matchArrowFunction(t) {
  let m = t.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/);
  if (m) return m[1];
  m = t.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?[A-Za-z0-9_$]+\s*=>\s*\{/);
  return m ? m[1] : null;
}

function _matchMethodFunction(t) {
  const m = t.match(/^(?:static\s+)?(?:async\s+)?([A-Za-z0-9_$#]+)\s*\([^)]*\)\s*\{/);
  if (!m) return null;
  const kw = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'do', 'try']);
  return kw.has(m[1]) ? null : m[1];
}

function auditFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const offenders = [];
  const state = { inBlockComment: false };
  for (let i = 0; i < lines.length; i++) {
    const start = detectFunctionStart(sanitizeLine(lines[i], state));
    if (!start) continue;
    const measured = _measureFunction(lines, i);
    if (measured.loc > MAX) offenders.push(_offender(file, i, start.name, measured.loc));
    i = Math.max(i, measured.endIndex);
  }
  return offenders;
}

function _scanState() {
  return { inSingle: false, inDouble: false, inTemplate: false, escaped: false };
}

function _consumeEscape(state, ch) {
  if (state.escaped) {
    state.escaped = false;
    return true;
  }
  if (ch !== '\\') return false;
  state.escaped = true;
  return true;
}

function _toggleQuoteState(state, ch) {
  if (!state.inDouble && !state.inTemplate && ch === "'") state.inSingle = !state.inSingle;
  else if (!state.inSingle && !state.inTemplate && ch === '"') state.inDouble = !state.inDouble;
  else if (!state.inSingle && !state.inDouble && ch === '`') state.inTemplate = !state.inTemplate;
  else return false;
  return true;
}

function _isLineCommentStart(state, line, i) {
  if (state.inSingle || state.inDouble || state.inTemplate) return false;
  return line[i] === '/' && line[i + 1] === '/';
}

function _countBrace(ch, state, braces) {
  if (state.inSingle || state.inDouble || state.inTemplate) return;
  if (ch === '{') braces.open++;
  else if (ch === '}') braces.close++;
}

function _stripLeadingBlockComment(line, state) {
  if (!state.inBlockComment) return line;
  const end = line.indexOf('*/');
  if (end === -1) return '';
  state.inBlockComment = false;
  return line.slice(end + 2);
}

function _stripInlineBlockComments(raw, state) {
  let line = raw;
  while (true) {
    const start = line.indexOf('/*');
    if (start === -1) return line;
    const end = line.indexOf('*/', start + 2);
    if (end === -1) {
      state.inBlockComment = true;
      return line.slice(0, start);
    }
    line = line.slice(0, start) + line.slice(end + 2);
  }
}

function _measureFunction(lines, startIndex) {
  let depth = 0;
  let loc = 0;
  let j = startIndex;
  const innerState = { inBlockComment: false };
  for (; j < lines.length; j++) {
    const san = sanitizeLine(lines[j], innerState);
    const braces = countBraces(san);
    depth += braces.open - braces.close;
    if (j > startIndex) loc += _countLocLine(san);
    if (j > startIndex && depth === 0) break;
  }
  return { loc, endIndex: j };
}

function _countLocLine(san) {
  const t = san.trim();
  if (_isNonCodeLine(t)) return 0;
  if (/^import\s+/.test(t) || /^export\s+/.test(t)) return 0;
  return 1;
}

function _isNonCodeLine(t) {
  return t === '' || t === '{' || t === '}' || t === '};' || t === '},' || t === ');';
}

function _offender(file, i, name, loc) {
  return { loc, file: path.relative(root, file), line: i + 1, name };
}

const files = listFiles(root);
const offenders = [];
for (const file of files) offenders.push(...auditFile(file));

offenders.sort((a, b) => b.loc - a.loc || a.file.localeCompare(b.file) || a.line - b.line);
for (const o of offenders) {
  console.log(`${String(o.loc).padEnd(4)} ${o.file}:${o.line} ${o.name}`);
}
console.log(`TOTAL_OFFENDERS ${offenders.length}`);

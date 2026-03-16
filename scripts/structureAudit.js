const fs = require('fs');
const path = require('path');

const root = process.cwd();
const MAX_FUNCTION_LOC = 14;
const MAX_FILE_LOC = 400;
const exts = new Set(['.js']);
const scopeRoots = [
  'src',
  'config',
  'core',
  'entities',
  'ui',
  'world',
  'scripts',
  'main.js',
];
const ignoreDirs = new Set(['.git', 'node_modules', '.vscode', 'memories']);

function scanState() {
  return { inSingle: false, inDouble: false, inTemplate: false, escaped: false };
}

function consumeEscape(state, ch) {
  if (state.escaped) {
    state.escaped = false;
    return true;
  }
  if (ch !== '\\') return false;
  state.escaped = true;
  return true;
}

function toggleQuoteState(state, ch) {
  if (!state.inDouble && !state.inTemplate && ch === "'") state.inSingle = !state.inSingle;
  else if (!state.inSingle && !state.inTemplate && ch === '"') state.inDouble = !state.inDouble;
  else if (!state.inSingle && !state.inDouble && ch === '`') state.inTemplate = !state.inTemplate;
  else return false;
  return true;
}

function isLineCommentStart(state, line, i) {
  if (state.inSingle || state.inDouble || state.inTemplate) return false;
  return line[i] === '/' && line[i + 1] === '/';
}

function stripLineComment(line) {
  const state = scanState();
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (consumeEscape(state, ch)) continue;
    if (toggleQuoteState(state, ch)) continue;
    if (isLineCommentStart(state, line, i)) return line.slice(0, i);
  }
  return line;
}

function countBraces(line) {
  const state = scanState();
  const braces = { open: 0, close: 0 };
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (consumeEscape(state, ch)) continue;
    if (toggleQuoteState(state, ch)) continue;
    if (state.inSingle || state.inDouble || state.inTemplate) continue;
    if (ch === '{') braces.open++;
    else if (ch === '}') braces.close++;
  }
  return braces;
}

function stripLeadingBlockComment(line, state) {
  if (!state.inBlockComment) return line;
  const end = line.indexOf('*/');
  if (end === -1) return '';
  state.inBlockComment = false;
  return line.slice(end + 2);
}

function stripInlineBlockComments(raw, state) {
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

function sanitizeLine(raw, state) {
  const noLead = stripLeadingBlockComment(raw, state);
  if (noLead === '') return '';
  const noBlocks = stripInlineBlockComments(noLead, state);
  return stripLineComment(noBlocks);
}

function detectFunctionStart(line) {
  const t = line.trim();
  if (!t.includes('{')) return null;
  let m = t.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/);
  if (m) return m[1];
  m = t.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/);
  if (m) return m[1];
  m = t.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?[A-Za-z0-9_$]+\s*=>\s*\{/);
  if (m) return m[1];
  m = t.match(/^(?:static\s+)?(?:async\s+)?([A-Za-z0-9_$#]+)\s*\([^)]*\)\s*\{/);
  if (!m) return null;
  const kw = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'do', 'try']);
  if (kw.has(m[1])) return null;
  return m[1];
}

function isNonExecutableLine(t) {
  if (!t) return true;
  if (t === '{' || t === '}' || t === '};' || t === '},' || t === ');') return true;
  if (/^import\s+/.test(t) || /^export\s+/.test(t)) return true;
  return false;
}

function countExecutableLoc(lines) {
  const state = { inBlockComment: false };
  let loc = 0;
  for (const raw of lines) {
    const t = sanitizeLine(raw, state).trim();
    if (!isNonExecutableLine(t)) loc++;
  }
  return loc;
}

function measureFunction(lines, startIndex) {
  let depth = 0;
  let loc = 0;
  let j = startIndex;
  const state = { inBlockComment: false };
  for (; j < lines.length; j++) {
    const san = sanitizeLine(lines[j], state);
    const braces = countBraces(san);
    depth += braces.open - braces.close;
    if (j > startIndex) {
      const t = san.trim();
      if (!isNonExecutableLine(t)) loc++;
    }
    if (j > startIndex && depth === 0) break;
  }
  return { loc, endIndex: j };
}

function collectScopeFiles() {
  const out = [];
  for (const scope of scopeRoots) {
    const full = path.join(root, scope);
    if (!fs.existsSync(full)) continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) collectDir(full, out);
    else if (exts.has(path.extname(full))) out.push(full);
  }
  return Array.from(new Set(out));
}

function collectDir(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (ignoreDirs.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) collectDir(full, out);
    else if (exts.has(path.extname(full))) out.push(full);
  }
}

function auditFunctions(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  return _scanFunctionsInLines(file, lines);
}

function _scanFunctionsInLines(file, lines) {
  const acc = { scanned: 0, offenders: [] };
  const state = { inBlockComment: false };
  for (let i = 0; i < lines.length; i++) {
    const start = _detectFunctionAtLine(lines, i, state);
    if (!start) continue;
    i = _consumeFunctionMeasure(file, lines, i, start, acc);
  }
  return acc;
}

function _detectFunctionAtLine(lines, i, state) {
  const name = detectFunctionStart(sanitizeLine(lines[i], state));
  return name ? { name, line: i + 1 } : null;
}

function _consumeFunctionMeasure(file, lines, i, start, acc) {
  acc.scanned++;
  const measured = measureFunction(lines, i);
  if (measured.loc > MAX_FUNCTION_LOC) {
    acc.offenders.push(_functionOffender(path.relative(root, file), start.line, start.name, measured.loc));
  }
  return Math.max(i, measured.endIndex);
}

function _functionOffender(file, line, name, loc) {
  return { file, line, name, loc };
}

function auditFileSizes(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  return countExecutableLoc(lines);
}

function verifyRelativeImports(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const errs = [];
  const importRe = /(?:import\s+[^'"\n]+from\s+|import\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(txt)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const base = path.resolve(path.dirname(file), spec);
    const ok = [base, `${base}.js`, path.join(base, 'index.js')].some(p => fs.existsSync(p));
    if (!ok) errs.push({ file: rel, import: spec });
  }
  return errs;
}

function run() {
  const files = collectScopeFiles();
  const totals = _collectAuditTotals(files);
  _sortAuditResults(totals);
  console.log(JSON.stringify(_buildAuditReport(files.length, totals), null, 2));
}

function _collectAuditTotals(files) {
  const totals = { totalFunctions: 0, functionOffenders: [], fileOffenders: [], importErrors: [] };
  for (const file of files) _collectFileAudit(file, totals);
  return totals;
}

function _collectFileAudit(file, totals) {
  const fa = auditFunctions(file);
  totals.totalFunctions += fa.scanned;
  totals.functionOffenders.push(...fa.offenders);
  _collectFileSizeOffender(file, totals.fileOffenders);
  totals.importErrors.push(...verifyRelativeImports(file));
}

function _collectFileSizeOffender(file, fileOffenders) {
  const fileLoc = auditFileSizes(file);
  if (fileLoc <= MAX_FILE_LOC) return;
  fileOffenders.push({ file: path.relative(root, file), loc: fileLoc });
}

function _sortAuditResults(totals) {
  totals.functionOffenders.sort((a, b) => b.loc - a.loc || a.file.localeCompare(b.file) || a.line - b.line);
  totals.fileOffenders.sort((a, b) => b.loc - a.loc || a.file.localeCompare(b.file));
}

function _buildAuditReport(filesScanned, totals) {
  return {
    filesScanned,
    functionsScanned: totals.totalFunctions,
    functionOffenders: totals.functionOffenders,
    fileOffenders: totals.fileOffenders,
    importErrors: totals.importErrors,
  };
}

run();

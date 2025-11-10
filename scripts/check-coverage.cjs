const fs = require('fs');
const path = require('path');

const threshold = Number(process.argv[2] || 80);
const coveragePathCandidates = [
  path.resolve(process.cwd(), 'coverage', 'coverage-summary.json'),
  path.resolve(process.cwd(), 'coverage-summary.json'),
  path.resolve(process.cwd(), 'coverage', 'coverage-summary.json'),
];

let found = null;
for (const p of coveragePathCandidates) {
  if (fs.existsSync(p)) {
    found = p;
    break;
  }
}

if (!found) {
  console.error('coverage-summary.json not found in coverage/ — ensure tests were run with --coverage');
  process.exit(2);
}

const raw = fs.readFileSync(found, 'utf8');
let json;
try {
  json = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse coverage-summary.json:', err.message || err);
  process.exit(3);
}

const totals = json.total || json;
const statements = totals.statements && totals.statements.pct;
if (typeof statements !== 'number') {
  console.error('Could not read statements coverage percentage from coverage summary');
  process.exit(4);
}

console.log(`Statements coverage: ${statements}% — required: ${threshold}%`);
if (statements < threshold) {
  console.error(`Coverage threshold not met: ${statements}% < ${threshold}%`);
  process.exit(1);
}

console.log('Coverage threshold satisfied');
process.exit(0);

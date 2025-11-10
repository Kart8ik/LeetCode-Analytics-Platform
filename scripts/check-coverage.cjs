const fs = require('fs');
const path = require('path');

const threshold = Number(process.argv[2] || 80);
// Recursively search coverage directory for JSON files that contain a coverage summary
function findCoverageSummary(dir) {
  if (!fs.existsSync(dir)) return null
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      const found = findCoverageSummary(full)
      if (found) return found
    } else if (e.isFile() && e.name.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(full, 'utf8')
        const parsed = JSON.parse(raw)
        // Common places: parsed.total.statements.pct or parsed.statements.pct
        const totals = parsed.total || parsed
        if (totals && totals.statements && typeof totals.statements.pct === 'number') {
          return { path: full, parsed }
        }
      } catch (e) {
        // ignore parse errors and continue
      }
    }
  }
  return null
}

const coverageDir = path.resolve(process.cwd(), 'coverage')
const found = findCoverageSummary(coverageDir)
if (!found) {
  // If nothing found, list coverage directory to help debugging
  console.error('coverage-summary.json not found in coverage/ — ensure tests were run with --coverage')
  try {
    const walk = (d, prefix = '') => {
      if (!fs.existsSync(d)) return console.error(`${prefix}${path.basename(d)} (missing)`)
      const items = fs.readdirSync(d)
      for (const it of items) {
        const p = path.join(d, it)
        const stat = fs.statSync(p)
        if (stat.isDirectory()) {
          console.error(`${prefix}${it}/`)
          walk(p, prefix + '  ')
        } else {
          console.error(`${prefix}${it}`)
        }
      }
    }
    console.error('Contents of coverage/:')
    walk(coverageDir)
  } catch (e) {
    console.error('Failed to list coverage directory:', e.message || e)
  }
  process.exit(2)
}

let totals = found.parsed.total || found.parsed
let statements = totals && totals.statements && totals.statements.pct

// Special-case: Istanbul/nyc coverage-final.json format (per-file coverage object)
if (typeof statements !== 'number') {
  try {
    // If the parsed object looks like coverage-final.json (keys are file paths, values have 's' or 'statementMap')
    const firstVal = Object.values(found.parsed)[0]
    if (firstVal && (firstVal.s || firstVal.statementMap)) {
      let totalStatements = 0
      let coveredStatements = 0
      for (const fileKey of Object.keys(found.parsed)) {
        const f = found.parsed[fileKey]
        if (f && f.s) {
          const counts = Object.values(f.s).map(n => Number(n) || 0)
          totalStatements += counts.length
          coveredStatements += counts.filter(c => c > 0).length
        } else if (f && f.statementMap) {
          // If statementMap exists but 's' counts not present, try to infer via other keys
          const stmtCount = Object.keys(f.statementMap).length
          totalStatements += stmtCount
          // covered info may be under f.s; if missing assume 0 covered
          if (f.s) {
            const counts = Object.values(f.s).map(n => Number(n) || 0)
            coveredStatements += counts.filter(c => c > 0).length
          }
        }
      }
      if (totalStatements > 0) {
        const pct = (coveredStatements / totalStatements) * 100
        statements = Math.round(pct * 100) / 100
        totals = { statements: { pct: statements } }
      }
    }
  } catch (e) {
    // ignore and fall through
  }
}
if (typeof statements !== 'number') {
  console.error('Could not read statements coverage percentage from coverage summary')
  process.exit(4)
}

console.log(`Found coverage summary at: ${found.path}`)
console.log(`Statements coverage: ${statements}% — required: ${threshold}%`)
if (statements < threshold) {
  console.error(`Coverage threshold not met: ${statements}% < ${threshold}%`)
  process.exit(1)
}

console.log('Coverage threshold satisfied')
process.exit(0)

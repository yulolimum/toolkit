#!/usr/bin/env node
// Mechanical gate validator for toolkit-graph-dev-v2 bundles.
//
//   node validate-bundle.mjs <bundle-root>
//
// Settles the mechanical integrity gates in schema.md, plus the format
// statements the schema makes in prose. A failure sets exit code 1 and
// blocks closing. Warnings never change the exit code; each one gets
// resolved or carried into the report. The manual section at the end
// lists the judgment gates this script cannot settle.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const UNIT_STATUS = ['pending', 'in_progress', 'done']
const PHASES = ['deep', 'review', 'refining', 'final']
const DISPOSITIONS = ['reuse_as_is', 'modify', 'build_new', 'reference_only', 'no_target_equivalent', 'out_of_scope']
const EDGE_TYPES = ['renders', 'calls', 'navigates_to', 'imports', 'reads', 'writes', 'mirrors', 'precedent_for']
const SIDE_EFFECTS = ['none', 'repo', 'external']
const CONSTRAINT_VERDICTS = ['satisfied', 'violated', 'satisfied_with_reframe']
const CRITERION_VERDICTS = ['met', 'deviated']
const CHECK_STATUS = ['pass', 'fail']

const failures = []
const warnings = []
const manual = []
const fail = (gate, msg) => failures.push(`${gate}: ${msg}`)
const warn = (gate, msg) => warnings.push(`${gate}: ${msg}`)
const str = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (v) => (Array.isArray(v) ? v : [])
const trunc = (s) => (String(s).length > 72 ? `${String(s).slice(0, 69)}...` : String(s))

const root = process.argv[2]
if (!root || process.argv.length > 3) {
  console.error('usage: node validate-bundle.mjs <bundle-root>')
  process.exit(1)
}

function readJson(rel) {
  const path = join(root, rel)
  if (!existsSync(path)) return { missing: true }
  try {
    return { doc: JSON.parse(readFileSync(path, 'utf8')) }
  } catch (e) {
    return { error: e.message }
  }
}

const indexRead = readJson('index.json')
if (indexRead.missing) {
  console.error(`${root}: no index.json here; point at the bundle root`)
  process.exit(1)
}
if (indexRead.error) {
  console.error(`index.json unreadable: ${indexRead.error}`)
  process.exit(1)
}
const index = indexRead.doc

const specRead = readJson('spec.json')
if (specRead.missing) fail('Bundle layout', 'spec.json does not exist')
if (specRead.error) fail('Bundle layout', `spec.json unreadable: ${specRead.error}`)
const spec = specRead.doc ?? {}

function listJsonFiles(relDir) {
  const dir = join(root, relDir)
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
}

const unitDocs = new Map()
for (const f of listJsonFiles('units')) {
  const r = readJson(`units/${f}`)
  if (r.error) {
    fail('Bundle layout', `units/${f} unreadable: ${r.error}`)
    continue
  }
  const id = f.slice(0, -5)
  if (r.doc?.id !== id) fail('Bundle layout', `units/${f}: id "${r.doc?.id}" does not match the filename`)
  unitDocs.set(id, r.doc ?? {})
}

const builtDocs = new Map()
for (const f of listJsonFiles('built')) {
  const r = readJson(`built/${f}`)
  if (r.error) {
    fail('Bundle layout', `built/${f} unreadable: ${r.error}`)
    continue
  }
  const id = f.slice(0, -5)
  if (r.doc?.id !== id) fail('Bundle layout', `built/${f}: id "${r.doc?.id}" does not match the filename`)
  builtDocs.set(id, r.doc ?? {})
}

const notesFiles = new Set()
;(function walk(relDir) {
  const dir = join(root, relDir)
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const rel = `${relDir}/${entry.name}`
    if (entry.isDirectory()) walk(rel)
    else notesFiles.add(rel)
  }
})('notes')

// index.json

if (!PHASES.includes(index.phase)) {
  fail('Bundle layout', `phase "${index.phase}" is not one of: ${PHASES.join(', ')}`)
}

const indexUnits = arr(index.units)
const unitPos = new Map()
for (const [i, u] of indexUnits.entries()) {
  if (!str(u?.id)) {
    fail('Bundle layout', `index.json units[${i}] has no id`)
    continue
  }
  if (unitPos.has(u.id)) {
    fail('Bundle layout', `index.json lists unit "${u.id}" twice`)
    continue
  }
  unitPos.set(u.id, i)
  if (!UNIT_STATUS.includes(u.status)) {
    fail('Bundle layout', `unit "${u.id}" status "${u.status}" is not one of: ${UNIT_STATUS.join(', ')}`)
  }
}

for (const id of unitPos.keys()) {
  if (!unitDocs.has(id)) fail('Bundle layout', `index.json lists unit "${id}" but units/${id}.json does not exist`)
}
for (const id of unitDocs.keys()) {
  if (!unitPos.has(id)) fail('Bundle layout', `units/${id}.json exists but index.json does not list it`)
}

for (const iu of indexUnits) {
  const doc = unitDocs.get(iu?.id)
  if (!doc) continue
  const a = [...arr(iu.depends_on)].sort().join(', ')
  const b = [...arr(doc.depends_on)].sort().join(', ')
  if (a !== b) {
    fail('Bundle layout', `unit "${iu.id}" depends_on disagrees between index.json [${a}] and its unit file [${b}]`)
  }
}

for (const d of arr(index.deviations)) {
  if (typeof d?.authorized !== 'boolean') {
    warn('Bundle layout', `deviation "${trunc(d?.detail ?? d?.id ?? '?')}" has no boolean authorized flag`)
  }
}

// chunks

const chunks = arr(index.chunks)
const chunkPos = new Map()
const chunkOf = new Map()
if (chunks.length === 0) fail('Chunk coverage', 'the bundle has no chunks; every bundle has at least one')
for (const [ci, c] of chunks.entries()) {
  if (!str(c?.id)) {
    fail('Bundle layout', `chunks[${ci}] has no id`)
    continue
  }
  if (chunkPos.has(c.id)) {
    fail('Bundle layout', `chunk id "${c.id}" appears twice`)
    continue
  }
  chunkPos.set(c.id, ci)
  if (!str(c.covers)) fail('Chunk boundary', `chunk "${c.id}" has no covers statement`)
  const us = arr(c.units)
  if (us.length === 0) warn('Chunk coverage', `chunk "${c.id}" holds no units`)
  for (const [pos, uid] of us.entries()) {
    if (!unitPos.has(uid)) {
      fail('Chunk coverage', `chunk "${c.id}" lists "${uid}", which is not a unit`)
      continue
    }
    if (chunkOf.has(uid)) {
      fail('Chunk coverage', `unit "${uid}" belongs to both "${chunkOf.get(uid).chunk}" and "${c.id}"; exactly one`)
    } else {
      chunkOf.set(uid, { chunk: c.id, ci, pos })
    }
  }
}
if (chunks.length > 0) {
  for (const id of unitPos.keys()) {
    if (!chunkOf.has(id)) fail('Chunk coverage', `unit "${id}" belongs to no chunk`)
  }
}
for (const c of chunks) {
  if (!str(c?.id)) continue
  for (const le of arr(c.incomplete_after)) {
    const rb = le?.resolved_by
    if (!chunkPos.has(rb)) {
      fail('Loose ends', `chunk "${c.id}" leaves "${trunc(le?.detail ?? '?')}" to "${rb}", which is not a chunk`)
    } else if (chunkPos.get(rb) <= chunkPos.get(c.id)) {
      fail('Loose ends', `chunk "${c.id}" leaves "${trunc(le?.detail ?? '?')}" to "${rb}", which does not come later`)
    }
  }
}

// constraints

const constraints = arr(index.constraints).filter(str)
const verdictFor = new Map()
for (const v of arr(index.constraint_verdicts)) {
  if (!CONSTRAINT_VERDICTS.includes(v?.verdict)) {
    fail(
      'Constraint check',
      `verdict "${v?.verdict}" on "${trunc(v?.constraint ?? '?')}" is not one of: ${CONSTRAINT_VERDICTS.join(', ')}`,
    )
  }
  if (str(v?.constraint)) verdictFor.set(v.constraint, v)
}
for (const c of constraints) {
  const v = verdictFor.get(c)
  if (!v) fail('Constraint check', `constraint "${trunc(c)}" has no verdict`)
  else if (v.verdict === 'violated')
    warn(
      'Constraint check',
      `constraint "${trunc(c)}" is violated: ${trunc(v.detail || 'no detail')}; this reaches the user`,
    )
}
for (const key of verdictFor.keys()) {
  if (!constraints.includes(key))
    warn('Constraint check', `a verdict names "${trunc(key)}", which index.constraints does not list`)
}

// spec.json surface

const surfaceById = new Map()
for (const s of arr(spec.surface)) {
  if (!str(s?.id)) {
    fail('Bundle layout', 'a surface entry has no id')
    continue
  }
  if (surfaceById.has(s.id)) {
    fail('Bundle layout', `surface id "${s.id}" appears twice`)
    continue
  }
  surfaceById.set(s.id, s)
}

const mirrorSeen = new Set()
for (const s of surfaceById.values()) {
  if (!DISPOSITIONS.includes(s.disposition)) {
    fail(
      'Disposition coverage',
      `surface "${s.id}" disposition "${s.disposition ?? 'missing'}" is not one of: ${DISPOSITIONS.join(', ')}`,
    )
  }
  const grounded = arr(s.evidence).filter((e) => str(e?.source))
  if (grounded.length === 0) fail('Evidence grounding', `surface "${s.id}" has no evidence record with a source`)
  for (const e of arr(s.evidence)) {
    if (str(e?.source) && !str(e?.detail))
      warn('Evidence grounding', `surface "${s.id}" evidence "${trunc(e.source)}" has no detail`)
  }
  if (str(s.path) && (s.path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(s.path))) {
    fail('Bundle layout', `surface "${s.id}" path "${trunc(s.path)}" is absolute; paths are repo-relative`)
  }
  for (const e of arr(s.edges)) {
    if (!EDGE_TYPES.includes(e?.type))
      fail('Bundle layout', `surface "${s.id}" edge type "${e?.type}" is not in the schema`)
    if (!surfaceById.has(e?.to)) {
      fail('Reference integrity', `surface "${s.id}" edge points at "${e?.to}", which is not a surface entry`)
      continue
    }
    if (e.type === 'mirrors') {
      const key = [s.id, e.to].sort().join(' ~ ')
      if (mirrorSeen.has(key)) {
        fail(
          'Bundle layout',
          `mirrors between "${s.id}" and "${e.to}" appears more than once; record it once, on the source-platform entry`,
        )
      }
      mirrorSeen.add(key)
      const other = surfaceById.get(e.to)
      if (str(s.platform) && str(other.platform) && s.platform === other.platform) {
        fail(
          'Bundle layout',
          `mirrors joins "${s.id}" and "${e.to}" on the same platform; that relationship is precedent_for`,
        )
      }
    }
  }
}

// spec.json decisions

const decisionById = new Map()
for (const d of arr(spec.decisions)) {
  if (!str(d?.id)) {
    fail('Bundle layout', 'a decision has no id')
    continue
  }
  if (decisionById.has(d.id)) {
    fail('Bundle layout', `decision id "${d.id}" appears twice`)
    continue
  }
  decisionById.set(d.id, d)
}
for (const d of decisionById.values()) {
  if (d.status === 'open') fail('Decision closure', `decision "${d.id}" is open`)
  else if (d.status !== 'resolved')
    fail('Bundle layout', `decision "${d.id}" status "${d.status}" is not open or resolved`)
  if (d.status === 'resolved' && !str(d.resolution))
    warn('Decision closure', `decision "${d.id}" is resolved but records no resolution`)
  for (const t of arr(d.affects)) {
    if (!unitPos.has(t) && !surfaceById.has(t)) {
      fail('Reference integrity', `decision "${d.id}" affects "${t}", which is neither a unit nor a surface entry`)
    }
  }
}

// units

const referencedSurface = new Set()
const referencedNotes = new Set()
const refinements = []
const unitsRefBySurface = new Map()

for (const [id, u] of unitDocs) {
  const srefs = arr(u.surface_refs).filter(str)
  if (srefs.length === 0) fail('Unit grounding', `unit "${id}" references no surface entry`)
  for (const r of srefs) {
    if (!surfaceById.has(r)) {
      fail('Reference integrity', `unit "${id}" surface_refs "${r}" does not exist`)
    } else {
      referencedSurface.add(r)
      if (!unitsRefBySurface.has(r)) unitsRefBySurface.set(r, [])
      unitsRefBySurface.get(r).push(id)
    }
  }
  for (const r of arr(u.decision_refs).filter(str)) {
    if (!decisionById.has(r)) fail('Reference integrity', `unit "${id}" decision_refs "${r}" does not exist`)
  }
  for (const p of arr(u.notes_refs).filter(str)) {
    if (p.startsWith('/')) {
      fail('Bundle layout', `unit "${id}" notes_refs "${trunc(p)}" is absolute; paths are bundle-relative`)
      continue
    }
    if (!existsSync(join(root, p))) {
      fail('Reference integrity', `unit "${id}" notes_refs "${p}" does not exist`)
    } else {
      referencedNotes.add(p)
      if (!p.startsWith('notes/')) warn('Reference integrity', `unit "${id}" notes_refs "${p}" sits outside notes/`)
    }
  }
  for (const d of arr(u.depends_on).filter(str)) {
    if (!unitPos.has(d)) {
      fail('Reference integrity', `unit "${id}" depends_on "${d}" does not exist`)
    } else if (unitPos.has(id) && unitPos.get(d) > unitPos.get(id)) {
      fail('Unit order', `index.json lists "${id}" before its dependency "${d}"; units are listed in dependency order`)
    }
  }
  if (arr(u.acceptance).filter(str).length === 0) {
    fail(
      'Acceptance present',
      `unit "${id}" states no acceptance criteria; a unit with nothing checkable is a placeholder`,
    )
  }
  const titleWords = String(u.title ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
  if (titleWords.includes('and')) warn('Unit scope', `unit "${id}" title contains "and"; confirm it is one job`)
  for (const st of arr(u.states)) {
    if (typeof st?.applies !== 'boolean') {
      fail(
        'Bundle layout',
        `unit "${id}" state "${st?.state ?? '?'}" has no boolean applies; considered-and-ruled-out must be explicit`,
      )
    }
    if (str(st?.source)) {
      const src = st.source
      const ok =
        surfaceById.has(src) ||
        unitPos.has(src) ||
        decisionById.has(src) ||
        /^https?:\/\//.test(src) ||
        (!src.startsWith('/') && existsSync(join(root, src)))
      if (!ok)
        warn(
          'Reference integrity',
          `unit "${id}" state "${st.state}" source "${trunc(src)}" resolves to no id, bundle path, or URL`,
        )
    }
  }
  if (u.side_effects === undefined) warn('Bundle layout', `unit "${id}" has no side_effects`)
  else if (!SIDE_EFFECTS.includes(u.side_effects))
    fail('Bundle layout', `unit "${id}" side_effects "${u.side_effects}" is not one of: ${SIDE_EFFECTS.join(', ')}`)
  for (const v of arr(u.verify)) {
    if (!str(v)) fail('Bundle layout', `unit "${id}" verify holds an entry that is not a command`)
  }
  if (u.refines !== undefined && u.refines !== null) refinements.push(id)
}

// chunk order against dependencies

for (const [id, u] of unitDocs) {
  const mine = chunkOf.get(id)
  if (!mine) continue
  for (const d of arr(u.depends_on).filter(str)) {
    const dep = chunkOf.get(d)
    if (!dep) continue
    if (dep.ci > mine.ci) {
      fail('Chunk order', `unit "${id}" in chunk "${mine.chunk}" depends on "${d}" in the later chunk "${dep.chunk}"`)
    } else if (dep.ci === mine.ci && dep.pos > mine.pos) {
      fail('Chunk order', `unit "${id}" comes before its dependency "${d}" inside chunk "${mine.chunk}"`)
    }
  }
}

// acyclicity

{
  const color = new Map()
  let cycle = null
  const visit = (id, stack) => {
    if (cycle) return
    color.set(id, 1)
    stack.push(id)
    for (const d of arr(unitDocs.get(id)?.depends_on).filter(str)) {
      if (!unitDocs.has(d) || cycle) continue
      const c = color.get(d) ?? 0
      if (c === 1) {
        cycle = [...stack.slice(stack.indexOf(d)), d]
        return
      }
      if (c === 0) visit(d, stack)
    }
    stack.pop()
    color.set(id, 2)
  }
  for (const id of unitDocs.keys()) {
    if ((color.get(id) ?? 0) === 0) visit(id, [])
    if (cycle) break
  }
  if (cycle) fail('Acyclicity', `depends_on cycles: ${cycle.join(' -> ')}`)
}

// claim coverage, reuse reachability, overlap worklist

for (const s of surfaceById.values()) {
  if ((s.disposition === 'modify' || s.disposition === 'build_new') && !referencedSurface.has(s.id)) {
    fail(
      'Claim coverage',
      `surface "${s.id}" (${s.disposition}) is referenced by no unit; the change was researched and never planned`,
    )
  }
  if (s.disposition === 'reuse_as_is' && !referencedSurface.has(s.id)) {
    fail(
      'Reuse reachability',
      `surface "${s.id}" (reuse_as_is) is referenced by no unit; the do-not-rebuild finding reaches no builder`,
    )
  }
}
for (const [sid, us] of unitsRefBySurface) {
  const s = surfaceById.get(sid)
  if (s && (s.disposition === 'modify' || s.disposition === 'build_new') && us.length > 1) {
    manual.push(
      `Claim overlap: surface "${sid}" is claimed by ${us.join(', ')}; confirm no two claim the same change and each declares the split in non_goals`,
    )
  }
}

// notes reachability

for (const f of notesFiles) {
  if (!referencedNotes.has(f)) fail('Notes reachability', `${f} is referenced by no unit and will never be read`)
}

// refinement gates

for (const id of refinements) {
  const target = unitDocs.get(id).refines
  if (!str(target) || !unitPos.has(target)) {
    fail('Refinement target', `unit "${id}" refines "${target}", which is not a unit`)
    continue
  }
  const status = indexUnits[unitPos.get(target)]?.status
  if (status !== 'done') fail('Target built', `unit "${id}" refines "${target}", whose status is "${status}", not done`)
  const mine = chunkOf.get(id)
  const t = chunkOf.get(target)
  if (mine && t) {
    if (mine.chunk !== t.chunk) {
      fail(
        'Placement',
        `refinement "${id}" sits in chunk "${mine.chunk}" but its target "${target}" sits in "${t.chunk}"`,
      )
    } else if (mine.pos <= t.pos) {
      fail('Placement', `refinement "${id}" does not come after its target "${target}" in chunk "${mine.chunk}"`)
    }
  }
}

// built records

for (const iu of indexUnits) {
  if (iu?.status === 'done' && str(iu?.id) && !builtDocs.has(iu.id)) {
    fail('Build record coverage', `unit "${iu.id}" is done but built/${iu.id}.json does not exist`)
  }
}
for (const [id, b] of builtDocs) {
  const pos = unitPos.get(id)
  if (pos === undefined) {
    fail('Build record coverage', `built/${id}.json exists but "${id}" is not a unit`)
    continue
  }
  const status = indexUnits[pos]?.status
  const isDone = status === 'done'
  if (!isDone) {
    warn(
      'Build record coverage',
      `built/${id}.json exists but unit "${id}" is ${status}; a run died before the status flip, or work remains`,
    )
  }
  const mine = chunkOf.get(id)
  if (mine && str(b.chunk) && b.chunk !== mine.chunk) {
    fail('Build record coverage', `built/${id}.json names chunk "${b.chunk}" but the unit sits in "${mine.chunk}"`)
  }
  if (!str(b.branch)) warn('Build record coverage', `built/${id}.json records no branch`)
  if (isDone && arr(b.commits).filter(str).length === 0) {
    fail('Build record coverage', `unit "${id}" is done but its record lists no commits; one commit per unit`)
  }

  const unit = unitDocs.get(id)

  if (b.checks === undefined) {
    if (isDone)
      warn(
        'Check results',
        `built/${id}.json has no checks; the record predates check results, or the builder skipped them`,
      )
  } else {
    const checks = arr(b.checks)
    const passed = new Set()
    for (const c of checks) {
      if (!str(c?.command)) {
        fail('Check results', `built/${id}.json holds a check with no command`)
        continue
      }
      if (!CHECK_STATUS.includes(c?.status)) {
        fail('Check results', `built/${id}.json check "${trunc(c.command)}" status "${c?.status}" is not pass or fail`)
      } else if (c.status === 'fail' && isDone) {
        fail('Check results', `unit "${id}" is done but records a failing check: ${trunc(c.command)}`)
      } else if (c.status === 'pass') {
        passed.add(c.command.trim())
      }
    }
    if (isDone && unit) {
      for (const v of arr(unit.verify).filter(str)) {
        if (!passed.has(v.trim()))
          fail('Check results', `unit "${id}" is done but verify command has no passing entry in checks: ${trunc(v)}`)
      }
    }
  }

  const deviationFor = new Map()
  for (const dv of arr(b.criteria_deviations)) {
    if (str(dv?.criterion)) deviationFor.set(dv.criterion, dv)
  }
  if (unit) {
    const acceptance = arr(unit.acceptance).filter(str)
    for (const crit of deviationFor.keys()) {
      if (!acceptance.includes(crit))
        warn(
          'Criteria verdicts',
          `built/${id}.json criteria_deviations names a criterion the unit does not state: ${trunc(crit)}`,
        )
    }
  }

  if (b.criteria === undefined) {
    if (isDone)
      warn(
        'Criteria verdicts',
        `built/${id}.json has no criteria verdicts; the record predates verdicts, or the builder skipped them`,
      )
  } else {
    const seen = new Map()
    for (const c of arr(b.criteria)) {
      if (!str(c?.criterion)) {
        fail('Criteria verdicts', `built/${id}.json holds a verdict with no criterion text`)
        continue
      }
      seen.set(c.criterion, (seen.get(c.criterion) ?? 0) + 1)
      if (!CRITERION_VERDICTS.includes(c?.verdict)) {
        fail(
          'Criteria verdicts',
          `built/${id}.json criterion "${trunc(c.criterion)}" verdict "${c?.verdict}" is not met or deviated`,
        )
      }
      if (!str(c?.evidence)) {
        fail(
          'Criteria verdicts',
          `built/${id}.json criterion "${trunc(c.criterion)}" carries no evidence; a verdict without evidence is a claim`,
        )
      }
      if (c?.verdict === 'deviated' && !deviationFor.has(c.criterion)) {
        fail(
          'Criteria verdicts',
          `built/${id}.json criterion "${trunc(c.criterion)}" is deviated but has no criteria_deviations entry`,
        )
      }
      if (c?.verdict === 'met' && deviationFor.has(c.criterion)) {
        fail(
          'Criteria verdicts',
          `built/${id}.json criterion "${trunc(c.criterion)}" is met but criteria_deviations records a deviation for it`,
        )
      }
    }
    if (unit) {
      const acceptance = arr(unit.acceptance).filter(str)
      for (const a of acceptance) {
        if (!seen.has(a)) fail('Criteria verdicts', `built/${id}.json holds no verdict for criterion: ${trunc(a)}`)
      }
      for (const [crit, n] of seen) {
        if (!acceptance.includes(crit))
          fail(
            'Criteria verdicts',
            `built/${id}.json holds a verdict for a criterion the unit does not state: ${trunc(crit)}`,
          )
        if (n > 1) fail('Criteria verdicts', `built/${id}.json holds ${n} verdicts for one criterion: ${trunc(crit)}`)
      }
    }
  }
}

// manual gates

manual.push('Unit scope: every unit is one job; any title warned above is the first candidate')
manual.push('Prose references: every unit id named inside an acceptance, non_goals, or behavior string exists')
manual.push(
  'Prose agreement: no count, name, or claim in a criterion contradicts a notes file, a constraint verdict, or a resolved decision',
)
if (refinements.length > 0) {
  manual.push('Self-contained: no refinement criterion reads as a delta against another unit')
  manual.push("Covers freshness: every refined chunk's covers accounts for the refinement")
  manual.push('No edits: no pre-existing unit file changed, except an agreed amendment')
}
manual.push('Project reference gates: run whatever the loaded reference adds; this script does not know them')

// report

console.log(`bundle  ${root}`)
console.log(
  `counts  units ${unitDocs.size}, chunks ${chunks.length}, surface ${surfaceById.size}, decisions ${decisionById.size}, built ${builtDocs.size}, notes ${notesFiles.size}`,
)
console.log('')
for (const f of failures) console.log(`FAIL  ${f}`)
for (const w of warnings) console.log(`WARN  ${w}`)
if (failures.length + warnings.length > 0) console.log('')
console.log('manual gates, settled by reading:')
for (const m of manual) console.log(`  ${m}`)
console.log('')
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
console.log(
  `result  ${failures.length ? 'FAIL' : 'PASS'} (${plural(failures.length, 'failure')}, ${plural(warnings.length, 'warning')})`,
)
process.exit(failures.length ? 1 : 0)

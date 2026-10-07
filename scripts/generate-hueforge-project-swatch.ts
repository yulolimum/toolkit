import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

type Point = [number, number, number]
type Triangle = [Point, Point, Point]

function micrometers(value: string, label: string) {
  if (!/^\d+(?:\.\d{1,3})?$/.test(value)) {
    throw new Error(`${label} must be a positive millimeter value with at most 3 decimal places.`)
  }
  const [whole = '', fraction = ''] = value.split('.')
  const result = Number(whole) * 1000 + Number(fraction.padEnd(3, '0'))
  if (!Number.isSafeInteger(result) || result <= 0) throw new Error(`${label} is out of range.`)
  return result
}

function parseExport(text: string) {
  function extract(pattern: RegExp, label: string) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length !== 1 || !matches[0]?.[1]) throw new Error(`Expected exactly one ${label} in the export.`)
    return micrometers(matches[0][1], label)
  }
  const layer = extract(/\blayer height of\s+([^\s]+?)\s*mm\b/gi, 'layer height')
  const first = extract(/\bbase layer of\s+([^\s]+?)\s*mm\b/gi, 'first-layer height')
  const actual = extract(/\bActual Thickness is\s+([^\s]+?)\s*mm\b/gi, 'actual thickness')
  const count = 1 + (actual - first) / layer
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Actual thickness must equal first-layer height plus a whole number of subsequent layers.')
  }
  // ponytail: band meshing is O(N²); use an edge-specific mesher if more than 1000 steps are needed.
  if (count > 1000) throw new Error('This generator supports at most 1000 layers.')
  return { first, layer, actual, count }
}

function grid(count: number) {
  const columns = Math.ceil(Math.sqrt(count))
  return { rows: Math.ceil(count / columns), columns }
}

function mesh(spec: ReturnType<typeof parseExport>, cell: number) {
  const { rows, columns } = grid(spec.count)
  const triangles: Triangle[] = []
  function quad(a: Point, b: Point, c: Point, d: Point) {
    triangles.push([a, b, c], [a, c, d])
  }
  const top = (n: number) => (n === 0 ? 0 : spec.first + (n - 1) * spec.layer)
  const height = (x: number, y: number) => {
    if (x < 0 || x >= columns || y < 0 || y >= rows) return 0
    // Keep heights nondecreasing: trailing low cells can create non-manifold diagonal contacts.
    return Math.max(0, y * columns + x + 1 - (rows * columns - spec.count))
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const n = height(x, y)
      if (n === 0) continue
      const x0 = x * cell,
        x1 = (x + 1) * cell
      const y0 = y * cell,
        y1 = (y + 1) * cell
      const z = top(n)
      quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z])
      quad([x0, y1, 0], [x1, y1, 0], [x1, y0, 0], [x0, y0, 0])
      // All vertical faces share the same Z bands, including at corners: no T-junctions.
      for (let band = 1; band <= n; band++) {
        const lo = top(band - 1),
          hi = top(band)
        if (height(x, y - 1) < band) quad([x0, y0, lo], [x1, y0, lo], [x1, y0, hi], [x0, y0, hi])
        if (height(x + 1, y) < band) quad([x1, y0, lo], [x1, y1, lo], [x1, y1, hi], [x1, y0, hi])
        if (height(x, y + 1) < band) quad([x1, y1, lo], [x0, y1, lo], [x0, y1, hi], [x1, y1, hi])
        if (height(x - 1, y) < band) quad([x0, y1, lo], [x0, y0, lo], [x0, y0, hi], [x0, y1, hi])
      }
    }
  }
  return triangles
}

function normal([a, b, c]: Triangle): Point {
  const u = b.map((value, i) => value - a[i]!) as Point
  const v = c.map((value, i) => value - a[i]!) as Point
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
}

function stl(triangles: Triangle[]) {
  const buffer = Buffer.alloc(84 + triangles.length * 50)
  buffer.write('HueForge actual-thickness swatch; coordinates in mm')
  buffer.writeUInt32LE(triangles.length, 80)
  let offset = 84
  for (const triangle of triangles) {
    const direction = normal(triangle)
    const magnitude = Math.hypot(...direction)
    for (const value of direction) {
      buffer.writeFloatLE(value / magnitude, offset)
      offset += 4
    }
    for (const point of triangle) {
      for (const value of point) {
        buffer.writeFloatLE(value / 1000, offset)
        offset += 4
      }
    }
    offset += 2
  }
  return buffer
}

function selfTest() {
  const source =
    'Print at 100% infill with a layer height of 0.08mm with a base layer of 0.16mm\nThe Max allowed Thickness is 2.24mm and the Actual Thickness is 2mm'
  const spec = parseExport(source)
  assert.deepEqual(spec, { first: 160, layer: 80, actual: 2000, count: 24 })
  for (const [count, columns, rows] of [
    [24, 5, 5],
    [26, 6, 5],
    [27, 6, 5],
    [28, 6, 5],
    [29, 6, 5],
    [13, 4, 4],
    [36, 6, 6],
    [1, 1, 1],
  ]) {
    assert.deepEqual(grid(count!), { columns, rows })
    const testSpec = { ...spec, count: count!, actual: spec.first + (count! - 1) * spec.layer }
    const triangles = mesh(testSpec, 15000)
    const tops = triangles.filter((triangle) => normal(triangle)[2] > 0)
    assert.equal(tops.length, count! * 2)
    for (let cell = 0; cell < count!; cell++) {
      const z = spec.first + cell * spec.layer
      for (const triangle of tops.slice(cell * 2, cell * 2 + 2)) {
        for (const point of triangle) assert.equal(point[2], z)
      }
    }
    const edges = new Map<string, { count: number; balance: number }>()
    const vertices = new Set<string>()
    let volume = 0
    for (const triangle of triangles) {
      const [a, b, c] = triangle
      assert(Math.hypot(...normal(triangle)) > 0)
      volume +=
        (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) /
        6
      for (const [start, end] of [
        [a, b],
        [b, c],
        [c, a],
      ] as [Point, Point][]) {
        const s = start.join(','),
          e = end.join(',')
        vertices.add(s)
        const key = s < e ? `${s}|${e}` : `${e}|${s}`
        const edge = edges.get(key) ?? { count: 0, balance: 0 }
        edge.count++
        edge.balance += s < e ? 1 : -1
        edges.set(key, edge)
      }
    }
    for (const edge of edges.values()) assert.deepEqual(edge, { count: 2, balance: 0 })
    assert.equal(vertices.size - edges.size + triangles.length, 2)
    const expected = 15000 ** 2 * (count! * spec.first + (spec.layer * count! * (count! - 1)) / 2)
    assert(Math.abs(volume - expected) < expected * 1e-10)
    const output = stl(triangles)
    assert.equal(output.readUInt32LE(80), triangles.length)
    const bounds = [
      [Infinity, -Infinity],
      [Infinity, -Infinity],
      [Infinity, -Infinity],
    ]
    for (let face = 0; face < triangles.length; face++) {
      for (let vertex = 0; vertex < 3; vertex++) {
        for (let axis = 0; axis < 3; axis++) {
          const value = output.readFloatLE(84 + face * 50 + 12 + vertex * 12 + axis * 4)
          bounds[axis]![0] = Math.min(bounds[axis]![0]!, value)
          bounds[axis]![1] = Math.max(bounds[axis]![1]!, value)
        }
      }
    }
    assert.deepEqual(bounds.slice(0, 2), [
      [0, columns! * 15],
      [0, rows! * 15],
    ])
    assert.equal(bounds[2]![0], 0)
    assert(Math.abs(bounds[2]![1]! - testSpec.actual / 1000) < 1e-6)
  }
  assert.throws(() => parseExport(source.replace('is 2mm', 'is 2.01mm')), /whole number/)
  assert.throws(() => parseExport(source.replace('is 2mm', 'is 0.08mm')), /whole number/)
  assert.throws(() => parseExport(''), /exactly one/)
  assert.throws(() => parseExport(source + '\nActual Thickness is 2mm'), /exactly one/)
  for (const invalid of ['0', '-1', 'NaN', '0.0001']) assert.throws(() => micrometers(invalid, 'cell size'))
  console.log(
    'Self-check passed: parsing, grids, bounds, winding, watertight edges, volume, STL encoding, and invalid inputs.',
  )
}

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'cell-mm': { type: 'string', default: '15' },
      output: { type: 'string' },
      'self-test': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(`Usage: pnpm hueforge:swatch <describe.txt> [--cell-mm 15] [--output card.stl]
       pnpm hueforge:swatch --self-test

Uses Actual Thickness, first-layer height, and subsequent layer height.
Default output: <export-name>-swatch.stl beside the input; never overwrites.
Square cells increase left-to-right, then bottom-to-top. No added backing.
Near-square grid; unused cells are empty spaces before the ascending steps.
Slice at the source layer heights with Z scale 100% and variable layers disabled.
Filament changes and all other print settings remain your responsibility in the slicer.`)
  } else if (values['self-test']) {
    selfTest()
  } else {
    if (positionals.length !== 1) throw new Error('Supply one HueForge export path. Use --help for usage.')
    const input = path.resolve(positionals[0]!)
    const cell = micrometers(values['cell-mm'], 'cell size')
    const spec = parseExport(await readFile(input, 'utf8'))
    const { rows, columns } = grid(spec.count)
    if (Math.max(rows, columns) * cell > 1000000) throw new Error('Card dimensions must not exceed 1000 mm.')
    const output = path.resolve(values.output ?? path.join(path.dirname(input), `${path.parse(input).name}-swatch.stl`))
    await writeFile(output, stl(mesh(spec, cell)), { flag: 'wx' })
    console.log(
      `${spec.count} steps + ${columns * rows - spec.count} empty cells; ${columns} × ${rows} grid; ${(columns * cell) / 1000} × ${(rows * cell) / 1000} mm; ${spec.actual / 1000} mm tall.`,
    )
    console.log(`Layer heights: first ${spec.first / 1000} mm, subsequent ${spec.layer / 1000} mm.`)
    console.log(`Saved ${output}`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}

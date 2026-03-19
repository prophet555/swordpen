/**
 * convert-words.mjs
 * Converts SwordPen CSV word files to app JSON format.
 * Usage: node scripts/convert-words.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── CSV parser ───────────────────────────────────────────────────────────────
// Handles both RFC-4180 quoting and the triple-quoted style in these files.
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote → single quote char
        current += '"'
        i += 2
        continue
      }
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(stripQuotes(current.trim()))
      current = ''
      i++
      continue
    } else {
      current += ch
    }
    i++
  }
  fields.push(stripQuotes(current.trim()))
  return fields
}

function stripQuotes(s) {
  // Remove any leading/trailing quote chars left over from double-encoded rows
  return s.replace(/^"+|"+$/g, '').trim()
}

// ── Difficulty heuristic ─────────────────────────────────────────────────────
const ADVANCED_WORDS = new Set([
  'aerosols','bioluminescence','photosynthesis','supercapacitor','graphene',
  'latency','de-orbited','cartilage','ligaments','marrow','pesticide',
  'ecosystem','pollination','fossil fuels','emissions','durability',
  'cacophony','acrid','lichen','threshold','interstellar','sonar',
  'constellation','bioluminescence','malnourished','verification',
  'enforcement','sustainability','sustainable','distractions','flexibility',
  'navigation','observatory','intersection','pedestrians','foundations',
])

const BEGINNER_WORDS = new Set([
  'quiet','nearby','crowd','faint','ordinary','recent','available','major',
  'gradually','rose','carried','strong','flexible','delicate','pollution',
  'environment','species','wildlife','talent','banned','careless','recycled',
  'decade','traditional','resources','anxious','relief','familiar','casually',
  'traffic','exhaust','gentle','nervous','confident','buzzing','clutch',
  'fumble','volunteer','survive','unsure','rattled','evidence','awkward',
  'rehearse','faded','reflection','identity','headline','realised','backpack',
  'gates','begged','vibrate','gripped','leapt','vanished','drifted','barely',
  'shrink','moss','discover','shiver','hidden','mist','murmur','sway',
  'crooked','cheerful','reliable','energy','however','wondering','promised',
  'surface','pathway','empty','noisy','crowded','restless','hesitant',
  'suspended','quiet','velvety','unhurried','gentle','confident','nervous',
  'scarce','remote','portable','vital','variety','diverse','climate',
  'designed','region','noticeable','extreme','ordinary','wealthy','privileged',
])

function inferDifficulty(word) {
  const w = word.toLowerCase().trim()
  if (ADVANCED_WORDS.has(w)) return 'advanced'
  if (BEGINNER_WORDS.has(w)) return 'beginner'
  return 'intermediate'
}

// ── Main converter ────────────────────────────────────────────────────────────
function convertCSV(filepath, categories, idPrefix) {
  const raw = fs.readFileSync(filepath, 'utf8')
  const lines = raw.split(/\r?\n/).filter(l => l.trim())

  const words = []
  let counter = 1

  // Skip header row (row 0)
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])

    // Expect at least: word, definition, partOfSpeech, synonyms, antonyms, example
    const word       = fields[0] || ''
    const definition = fields[1] || ''
    const pos        = fields[2] || ''
    const synRaw     = fields[3] || ''
    const example    = fields[5] || ''

    // Skip empty or header-like rows
    if (!word || !definition || word.toLowerCase().includes('vocabulary')) continue

    const synonyms = synRaw
      ? synRaw.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const entry = {
      id: `${idPrefix}-${String(counter).padStart(3, '0')}`,
      word,
      definition,
      synonyms,
      exampleSentences: example ? [example] : [],
      difficulty: inferDifficulty(word),
      categories,
      partOfSpeech: pos,
    }

    words.push(entry)
    counter++
  }

  return words
}

// ── Paths ─────────────────────────────────────────────────────────────────────
// Adjust these paths to match where your OneDrive files are:
const ONEDRIVE = 'C:/Users/mrbig/OneDrive - AG'

const informativePath = path.join(ONEDRIVE, 'informative_words.csv')
const narrativePath   = path.join(ONEDRIVE, 'narrative_words.csv')
const outDir          = path.join(ROOT, 'public', 'data')

// ── Convert ───────────────────────────────────────────────────────────────────
console.log('\n  SwordPen word converter')
console.log('  ────────────────────────────')

const informativeWords = convertCSV(informativePath, ['essay', 'report'], 'inf')
const narrativeWords   = convertCSV(narrativePath,   ['journal', 'essay'], 'nar')

// De-duplicate: if same word appears in both files, keep both (different category)
// But deduplicate within each file by word (case-insensitive)
function dedup(words) {
  const seen = new Set()
  return words.filter(w => {
    const key = w.word.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const dedupedInformative = dedup(informativeWords)
const dedupedNarrative   = dedup(narrativeWords)

// Write output files
fs.writeFileSync(
  path.join(outDir, 'words-informative.json'),
  JSON.stringify(dedupedInformative, null, 2),
  'utf8'
)

fs.writeFileSync(
  path.join(outDir, 'words-narrative.json'),
  JSON.stringify(dedupedNarrative, null, 2),
  'utf8'
)

// Summary
const byDiff = (words, d) => words.filter(w => w.difficulty === d).length

console.log(`\n  words-informative.json → ${dedupedInformative.length} words`)
console.log(`    beginner:     ${byDiff(dedupedInformative, 'beginner')}`)
console.log(`    intermediate: ${byDiff(dedupedInformative, 'intermediate')}`)
console.log(`    advanced:     ${byDiff(dedupedInformative, 'advanced')}`)

console.log(`\n  words-narrative.json   → ${dedupedNarrative.length} words`)
console.log(`    beginner:     ${byDiff(dedupedNarrative, 'beginner')}`)
console.log(`    intermediate: ${byDiff(dedupedNarrative, 'intermediate')}`)
console.log(`    advanced:     ${byDiff(dedupedNarrative, 'advanced')}`)

console.log('\n  Done. Update wordStore.ts to load these files.\n')

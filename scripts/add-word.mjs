#!/usr/bin/env node
/**
 * add-word.mjs — interactively add a word to a public/data/*.json file
 *
 * Usage:
 *   node scripts/add-word.mjs
 *   node scripts/add-word.mjs --file advanced   (skip file prompt)
 */

import { createInterface } from 'readline'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dir, '../public/data')

const FILES = {
  beginner:     'words-beginner.json',
  intermediate: 'words-intermediate.json',
  advanced:     'words-advanced.json',
  informative:  'words-informative.json',
  narrative:    'words-narrative.json',
  persuasive:   'words-persuasive.json',
}

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))

function nextId(words, prefix) {
  const nums = words
    .map(w => parseInt(w.id.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

async function main() {
  // --- pick file ---
  const fileArg = process.argv.find((a, i) => process.argv[i - 1] === '--file')
  let fileKey = fileArg?.toLowerCase()

  if (!fileKey || !FILES[fileKey]) {
    console.log('\nAvailable files:')
    Object.keys(FILES).forEach((k, i) => console.log(`  ${i + 1}. ${k}`))
    const choice = await ask('\nChoose file (name or number): ')
    fileKey = Object.keys(FILES)[parseInt(choice) - 1] ?? choice.toLowerCase()
  }

  if (!FILES[fileKey]) {
    console.error(`Unknown file: "${fileKey}"`)
    process.exit(1)
  }

  const filePath = resolve(DATA_DIR, FILES[fileKey])
  const words = JSON.parse(readFileSync(filePath, 'utf8'))

  console.log(`\n→ Editing ${FILES[fileKey]} (${words.length} words)\n`)

  // --- collect fields ---
  const word = (await ask('Word *: ')).trim()
  if (!word) { console.error('Word is required.'); process.exit(1) }

  const duplicate = words.find(w => w.word.toLowerCase() === word.toLowerCase())
  if (duplicate) { console.error(`"${duplicate.word}" already exists.`); process.exit(1) }

  const definition = (await ask('Definition *: ')).trim()
  if (!definition) { console.error('Definition is required.'); process.exit(1) }

  const partOfSpeech = (await ask('Part of speech (noun/verb/adjective/…) *: ')).trim() || 'noun'
  const difficulty   = (await ask('Difficulty [beginner/intermediate/advanced]: ')).trim() || 'intermediate'
  const categories   = (await ask('Categories (comma-sep: essay,journal,report,speech,general): ')).trim()
  const synonyms     = (await ask('Synonyms (comma-sep, optional): ')).trim()
  const antonyms     = (await ask('Antonyms (comma-sep, optional): ')).trim()
  const sentences    = (await ask('Example sentences (pipe-sep | optional): ')).trim()
  const tip          = (await ask('Memory tip (optional): ')).trim()

  rl.close()

  const prefix = fileKey === 'beginner' ? 'beg'
    : fileKey === 'intermediate' ? 'int'
    : fileKey === 'advanced'     ? 'adv'
    : fileKey.slice(0, 3)

  const newWord = {
    id: nextId(words, prefix),
    word,
    definition,
    synonyms: synonyms ? synonyms.split(',').map(s => s.trim()).filter(Boolean) : [],
    ...(antonyms ? { antonyms: antonyms.split(',').map(s => s.trim()).filter(Boolean) } : {}),
    exampleSentences: sentences ? sentences.split('|').map(s => s.trim()).filter(Boolean) : [],
    difficulty,
    categories: categories ? categories.split(',').map(s => s.trim()).filter(Boolean) : ['general'],
    partOfSpeech,
    ...(tip ? { tip } : {}),
  }

  words.push(newWord)
  writeFileSync(filePath, JSON.stringify(words, null, 2) + '\n', 'utf8')

  console.log(`\n✓ Added "${word}" (${newWord.id}) to ${FILES[fileKey]}`)
}

main().catch(err => { console.error(err); process.exit(1) })

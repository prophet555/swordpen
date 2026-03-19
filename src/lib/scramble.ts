export function scrambleWord(word: string): string {
  const letters = word.split('')
  let scrambled = letters.slice()

  // Keep scrambling until it's different from the original
  let attempts = 0
  do {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]]
    }
    attempts++
  } while (scrambled.join('') === word && attempts < 10)

  return scrambled.join('')
}

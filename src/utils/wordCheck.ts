export function isConsonant(character: string) {
  return /[ㄱ-ㅎ]/.test(character);
}

export function isVowel(character: string) {
  return /[ㅏ-ㅣ]/.test(character);
}

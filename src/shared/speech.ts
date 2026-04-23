export function normalizeSpeech(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

export function utteranceMatchesTarget(target: string, said: string): boolean {
  const t = normalizeSpeech(target)
  const s = normalizeSpeech(said)
  if (!s) return false
  if (s.includes(t) || t.includes(s)) return true
  const ta = t.replace(/\s/g, '')
  const sa = s.replace(/\s/g, '')
  if (sa.includes(ta) || ta.includes(sa)) return true
  return levenshtein(ta, sa) <= Math.max(2, Math.floor(ta.length / 3))
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

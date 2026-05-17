const smallLabels = ['size: xs', 'size: small', 'small', 'good first issue', 'easy', 'beginner']
const mediumLabels = ['size: m', 'size: medium', 'medium']
const largeLabels = ['size: l', 'size: large', 'large', 'epic']

export function getIssueSize(labels: string[]): 'small' | 'medium' | 'large' | undefined {
  const normalized = labels.map((label) => label.toLowerCase())

  if (normalized.some((label) => smallLabels.includes(label))) {
    return 'small'
  }

  if (normalized.some((label) => mediumLabels.includes(label))) {
    return 'medium'
  }

  if (normalized.some((label) => largeLabels.includes(label))) {
    return 'large'
  }

  return undefined
}

export function scoreIssue(labels: string[], historicalLabelWeights: Map<string, number>): {score: number; reasons: string[]} {
  const reasons: string[] = []
  let score = 0

  const size = getIssueSize(labels)
  if (size === 'small') {
    score += 20
    reasons.push('small issue')
  } else if (size === 'medium') {
    score += 8
    reasons.push('medium issue')
  } else if (size === 'large') {
    score -= 10
    reasons.push('large issue')
  }

  for (const label of labels) {
    const weight = historicalLabelWeights.get(label.toLowerCase()) || 0
    if (weight > 0) {
      score += Math.min(weight * 6, 18)
      reasons.push(`matches ${label}`)
    }
  }

  if (labels.some((label) => label.toLowerCase() === 'good first issue')) {
    score += 10
    reasons.push('beginner friendly')
  }

  return {score, reasons}
}

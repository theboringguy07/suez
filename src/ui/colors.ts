const enabled = process.env.NO_COLOR !== '1'

function color(code: number, value: string): string {
  return enabled ? `\u001B[${code}m${value}\u001B[0m` : value
}

export const colors = {
  blue: (value: string) => color(34, value),
  cyan: (value: string) => color(36, value),
  dim: (value: string) => color(2, value),
  green: (value: string) => color(32, value),
  red: (value: string) => color(31, value),
  yellow: (value: string) => color(33, value),
  bold: (value: string) => (enabled ? `\u001B[1m${value}\u001B[0m` : value),
}

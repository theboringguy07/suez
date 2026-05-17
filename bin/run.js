#!/usr/bin/env node

const {execute} = require('@oclif/core')

if (process.argv.length === 2) {
  try {
    require('../dist/ui/full-help').printFullHelp()
    process.exit(0)
  } catch {
    // Fall back to oclif's built-in help if dist has not been built yet.
  }
}

execute({dir: __dirname + '/..'}).catch(require('@oclif/core/handle'))

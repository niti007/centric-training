#!/usr/bin/env node
// Stop hook: prints a short completion notice. Exit 0 always — this hook
// only informs, it never blocks.
import process from 'node:process';

process.stdout.write(`[taskflow] Claude finished a turn at ${new Date().toISOString()}\n`);
process.exit(0);

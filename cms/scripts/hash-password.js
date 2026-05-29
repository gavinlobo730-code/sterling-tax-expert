#!/usr/bin/env node
/**
 * Sterling Tax Expert CMS — Password Hash Generator
 *
 * Run this script once to generate a bcrypt hash of your admin password.
 * Then insert the hash into D1 using the wrangler command printed at the end.
 *
 * Usage:
 *   node scripts/hash-password.js
 *
 * Requirements:
 *   npm install   (installs bcryptjs from package.json)
 *
 * This script runs locally in Node.js — it never sends your password anywhere.
 * The plain-text password is only held in memory during this process.
 */

const bcrypt   = require('bcryptjs');
const readline = require('readline');

const COST_FACTOR = 12; // ~300ms per attempt on modern hardware — good balance for a single-admin CMS

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
});

// Disable terminal echo so the password is not displayed as you type
function ask(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);

    const stdin = process.stdin;
    stdin.setRawMode?.(true);

    let password = '';

    stdin.resume();
    stdin.setEncoding('utf8');

    function onData(char) {
      if (char === '\n' || char === '\r' || char === '') {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '') {
        // Ctrl-C
        process.stdout.write('\nCancelled.\n');
        process.exit(0);
      } else if (char === '') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    }

    stdin.on('data', onData);
  });
}

async function main() {
  console.log('\nSterling Tax Expert CMS — Admin Password Setup');
  console.log('═'.repeat(50));
  console.log('This generates a bcrypt hash of your chosen password.');
  console.log('The hash is stored in D1. Your plain-text password is never saved.\n');

  console.log('Password requirements:');
  console.log('  • At least 12 characters');
  console.log('  • Mix of letters, numbers, and symbols recommended\n');

  const password = await ask('Enter new admin password: ');

  if (password.length < 12) {
    console.error('\n❌  Password must be at least 12 characters. Please try again.');
    rl.close();
    process.exit(1);
  }

  const confirm = await ask('Confirm password:         ');

  if (password !== confirm) {
    console.error('\n❌  Passwords do not match. Please try again.');
    rl.close();
    process.exit(1);
  }

  process.stdout.write('\nGenerating bcrypt hash (cost factor ' + COST_FACTOR + ') … ');

  const hash = await bcrypt.hash(password, COST_FACTOR);

  console.log('done.\n');
  console.log('═'.repeat(50));
  console.log('Hash generated:\n');
  console.log('  ' + hash);
  console.log('\n' + '═'.repeat(50));
  console.log('\nNext step — insert the hash into D1:\n');
  console.log('  For the deployed database (production):');
  console.log(`  wrangler d1 execute sterling-cms --command "UPDATE admin SET password_hash = '${hash}', failed_attempts = 0, locked_until = 0 WHERE id = 1;"`);
  console.log('\n  For local development:');
  console.log(`  wrangler d1 execute sterling-cms --local --command "UPDATE admin SET password_hash = '${hash}', failed_attempts = 0, locked_until = 0 WHERE id = 1;"`);
  console.log('\n  Then verify it was stored:');
  console.log('  wrangler d1 execute sterling-cms --command "SELECT id, SUBSTR(password_hash,1,7) AS hash_prefix, failed_attempts FROM admin;"');
  console.log('\n✅  Your password is ready. Do not share the hash above with anyone.\n');

  rl.close();
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});

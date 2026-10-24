const { detectRuntime } = require('../src/launcher');

async function main() {
  const runtime = await detectRuntime();
  console.log('=== Runtime report ===');
  console.log(JSON.stringify(runtime, null, 2));

  if (!runtime.available) {
    console.log('\nTo install Wine on macOS Intel:');
    console.log('brew install --cask wine-stable');
  }
}

main();

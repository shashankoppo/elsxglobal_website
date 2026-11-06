const { execSync } = require('child_process');
const MAX_ATTEMPTS = 20;

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  console.log(`\n=== Build attempt ${attempt}/${MAX_ATTEMPTS} ===\n`);
  try {
    const output = execSync(
      'NODE_OPTIONS="--require ./fs-eagain-patch.js --max-old-space-size=4096" npx next build 2>&1',
      { timeout: 300000, env: { ...process.env, UV_THREADPOOL_SIZE: '128' }, maxBuffer: 20 * 1024 * 1024 }
    ).toString();
    console.log(output.slice(-3000));
    console.log(`\n=== Build succeeded on attempt ${attempt} ===\n`);
    process.exit(0);
  } catch (err) {
    const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
    if (output.includes('EAGAIN')) {
      console.log(`\n=== EAGAIN error on attempt ${attempt}, retrying... ===\n`);
      console.log(output.slice(-500));
      continue;
    }
    console.error(`\n=== Build failed with non-EAGAIN error on attempt ${attempt} ===\n`);
    console.error(output.slice(-3000));
    process.exit(1);
  }
}
console.error(`\n=== Build failed after ${MAX_ATTEMPTS} attempts ===\n`);
process.exit(1);

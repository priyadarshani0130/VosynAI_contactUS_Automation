const { spawnSync } = require('child_process');

console.log('🔄 Running Playwright tests...');
const testProcess = spawnSync('npx', ['playwright', 'test'], { stdio: 'inherit', shell: true });

console.log('\n🔄 Tests complete! Triggering automated email report...');
spawnSync('node', ['send_report.js'], { stdio: 'inherit', shell: true });

// Exit with Playwright's actual code, so CI/CD pipelines know if tests failed
process.exit(testProcess.status || 0);

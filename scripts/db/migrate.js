const { spawn } = require('child-process-promise');

const isSilent = process.argv.includes('--silent');
const spawnOptions = { stdio: isSilent ? 'pipe' : 'inherit' };

(async () => {
    const url = 'postgres://postgres:root@localhost:5432/sim_ilc_test';

    try {
        await spawn(
            './node_modules/.bin/sequelize',
            ['db:migrate', `--url=${url}`],
            spawnOptions,
        );
        if (!isSilent) {
            console.log('[Test] Migration Successful\n');
        }
    } catch (err) {
        console.log('[Test] Migration failed. Error:', err.message);
        process.exit(1);
    }

    process.exit(0);
})();

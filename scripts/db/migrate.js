const { spawn } = require('child-process-promise');
const { host, port, username, password, database, dialect } =
    require('../../src/configs/sequelize')['test'];

const isSilent = process.argv.includes('--silent');
const spawnOptions = { stdio: isSilent ? 'pipe' : 'inherit' };

(async () => {
    const url = `${dialect}://${username}:${password}@${host}:${port}/${database}`;

    try {
        await spawn(
            './node_modules/.bin/sequelize',
            ['db:migrate', `--url=${url}`],
            spawnOptions,
        );
        console.log('[Test] Migration Successful\n');
    } catch (err) {
        console.log('[Test] Migration failed. Error:', err.message);
        process.exit(1);
    }

    process.exit(0);
})();

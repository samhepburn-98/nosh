import { rmSync } from 'node:fs';

import { databaseFile, setUpDatabase } from './set-up.ts';

// `pnpm db:reset`: deletes the database, then creates and seeds it again.
for (const suffix of ['', '-wal', '-shm']) rmSync(databaseFile + suffix, { force: true });
setUpDatabase(databaseFile).$client.close();
console.log(`Reset ${databaseFile}`);

import { createApp } from './app.ts';
import { databaseFile, setUpDatabase } from './db/set-up.ts';

// API_PORT, not PORT, which dev runners often set for the web app. 3002, to stay clear of other
// local APIs on the common 3001.
const port = Number(process.env.API_PORT ?? 3002);

createApp(setUpDatabase(databaseFile)).listen(port, () => {
  console.log(`API on http://localhost:${port}`);
});

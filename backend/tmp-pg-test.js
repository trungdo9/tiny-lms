const { Client } = require('pg');
const [host, port, user, password] = process.argv.slice(2);
const c = new Client({ host, port: Number(port), user, password, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
c.connect()
  .then(async () => {
    console.log(`OK ${host} ${port}`);
    await c.end();
  })
  .catch((e) => {
    console.log(`ERR ${host} ${port} ${String(e.message).replace(/\n/g, ' ')}`);
    process.exit(1);
  });

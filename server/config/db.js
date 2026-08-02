const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Aiven (and most managed MySQL hosts) require SSL with their own CA cert —
// Node's default trusted certificate list won't recognize it. Download the
// CA cert from your provider's dashboard and save it to server/certs/ca.pem,
// then set DB_SSL=true in your environment variables.
let sslConfig;
if (process.env.DB_SSL === "true") {
  const caPath = path.join(__dirname, "..", "certs", "ca.pem");
  sslConfig = fs.existsSync(caPath)
    ? { ca: fs.readFileSync(caPath) }
    : { rejectUnauthorized: false }; // fallback if cert file isn't present — works, but skips cert validation
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: sslConfig,
});

module.exports = pool.promise();

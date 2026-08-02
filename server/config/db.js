const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  // Aiven (and most managed MySQL hosts) require SSL. Set DB_SSL=true in
  // your deployment environment variables; leave unset for local MySQL.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
});

module.exports = pool.promise();

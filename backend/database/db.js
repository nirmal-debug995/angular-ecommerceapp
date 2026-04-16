const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Pool Connection Failed:", err);
    return;
  }
  if (connection) connection.release();
  console.log("MySQL Pool Connected...");
});

module.exports = pool;

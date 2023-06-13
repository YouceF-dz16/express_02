require("dotenv").config();

const mysql = require("mysql2/promise");
const port = process.env.DB_PORT ?? 3306;

const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
database
  .getConnection()
  .then(() => {
    console.log("Can reach database");
  })
  .catch((err) => {
    console.error(err);
  });
database
  .query("select * from movies")
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
database
  .query("select * from movies")
  .then(([movies]) => {
    console.log(movies);
  })
  .catch((err) => {
    console.error(err);
  });
//users
database
  .query("select * from users")
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
database
  .query("select * from users")
  .then(([users]) => {
    console.log(users);
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = database;

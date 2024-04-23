const mysql = require('mysql');


const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root', 
  password: 'root', 
  database: 'userdb' 
});


module.exports = pool;

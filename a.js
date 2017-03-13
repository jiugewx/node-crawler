var mysql = require('mysql');  
var conn = mysql.createConnection({  
    host: 'localhost',  
    user: 'root',  
    password: '',  
    database: 'job',  
    port: 3306  
});

conn.connect();  
conn.query('SELECT id  FROM users LIMIT 1',
function(err, rows, fields) {  
    if (err) throw err;  
    console.log('The solution is: ', rows[0])  
});  
conn.end();
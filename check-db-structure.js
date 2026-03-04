const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'admin',
    database: 'QLCongDoanCoSo'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
    
    // Check organization table structure
    connection.query('DESCRIBE organization', function(error, results, fields) {
        if (error) {
            console.error('Error describing organization table:', error);
        } else {
            console.log('\n=== Organization Table Structure ===');
            console.table(results);
        }
        
        // Check collations for key tables
        connection.query(`
            SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
            FROM information_schema.columns 
            WHERE table_schema = 'QLCongDoanCoSo' 
            AND TABLE_NAME IN ('user', 'organization', 'thong_bao', 'nguoi_nhan_su_kien')
            AND COLLATION_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        `, function(error2, results2) {
            if (error2) {
                console.error('Error checking collations:', error2);
            } else {
                console.log('\n=== Current Collations ===');
                console.table(results2);
            }
            
            connection.end();
        });
    });
});

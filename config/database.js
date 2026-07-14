const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', {
            code: err.code,
            sqlState: err.sqlState,
            message: err.message
        });
        return;
    }

    console.log('Connected to EquipTrack MySQL database');
});

module.exports = db;

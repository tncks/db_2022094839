const mysql = require('mysql2');
const targetDB = "db_2022094839";
const db_info = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "1234",
    database: targetDB,
    multipleStatements: true,
    timezone: "+09:00",
    dateStrings: true,
};
const sql_connection = mysql.createConnection(db_info); //
sql_connection.connect(err => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }

    sql_connection.query("SET time_zone = 'Asia/Seoul'", (err) => {
        if (err) {
            console.log('Failed to set time zone:', err);
        }
    });

}
);
module.exports = sql_connection;
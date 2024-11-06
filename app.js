
const express = require('express');
const path = require('path');
const app = express();
const session = require('./config/session');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sql_connection = require('./config/db');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);
app.use('/', userRoutes);
app.use('/api', orderRoutes);
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("views", path.join(__dirname, 'views'));
const cron = require('node-cron');
app.get('/', (req, res) => {
    res.render('sitemapDeveloperPage');
});


// Fetch all
const getAllStockSymbols = (callback) => {
    const query = 'SELECT StockSymbol FROM stock';
    sql_connection.query(query, (err, results) => {
        if (err) throw err;
        callback(results.map(row => row.StockSymbol));
    });
};
// Save closing price to stockpricehistory
const saveClosingPrice = (stockSymbol) => {

    sql_connection.query(`INSERT INTO stockpricehistory (StockSymbol, SharePrice, Timestamp_) VALUES (?, (SELECT SharePrice FROM stock WHERE StockSymbol = ?), ?) `, [stockSymbol, stockSymbol, new Date()], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            //console.log(`saveClosingPrice:  results.length > 0`);
        } else {
            //console.log(`saveClosingPrice:  NOT results.length > 0 NOT`);
        }

    });


};

// Check if it should record every close price
cron.schedule('* * * * *', () => {
    const now = new Date();
    const currentHour = now.getHours(); // 1 ~ 23 .. 
    const currentMinute = now.getMinutes();

    // Check if market
    if ([15, 35, 55].includes(currentMinute)) {
        sql_connection.query(`DELETE FROM order_book WHERE BidPrice is NULL AND AskQuantity <= 0`);
        sql_connection.query(`DELETE FROM order_book WHERE AskPrice is NULL AND BidQuantity <= 0`);

        // console.log('** Market timer onoff: Make Record closing prices... **');
        getAllStockSymbols((symbols) => {

            for (let i = 0; i < symbols.length; i++) {

                saveClosingPrice(symbols[i]);
            }
        });
    }
});







app.listen(3001, () => {
    console.log("서버 실행 중");
});







module.exports = app;



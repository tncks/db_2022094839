const fs = require('fs');
const path = require('path');

const getPageContent = (pageName) => {
  return fs.readFileSync(path.join(__dirname, 'views', `${pageName}.ejs`), 'utf8');
};

const basicQ = `WITH Previous_Close_ AS (
    SELECT 
        stocksymbol,
        MAX(timestamp_) AS latest_timestamp
    FROM 
        stockpricehistory
    GROUP BY 
        stocksymbol
),
old_stock AS (
    select
    Previous_Close_.stocksymbol,
    stockpricehistory.shareprice AS previous_close_price    
    from stockpricehistory
    join Previous_Close_ on Previous_Close_.stocksymbol = stockpricehistory.stocksymbol
    where stockpricehistory.timestamp_ = Previous_Close_.latest_timestamp
)
SELECT 
  Stock.stockname, 
  Stock.stocksymbol, 
  Stock.shareprice AS current_price, 
  ROUND(
    (
      (
        (
          Stock.shareprice - old_stock.previous_close_price
        ) / old_stock.previous_close_price
      ) * 100
    ), 
    2
  ) AS change_percent 
FROM 
  Stock 
  JOIN old_stock ON Stock.stocksymbol = old_stock.stocksymbol`;

module.exports = {
  getWelcomePage: () => getPageContent('welcomePage'),
  getLoginPage: () => getPageContent('loginPage'),
  getSignupPage: () => getPageContent('signupPage'),
  getPlaceStockPage: () => getPageContent('placeStockPage'),
  getOrdersAllLogPage: () => getPageContent('ordersAllLogPage'),
  getTransactionsPage: () => getPageContent('transactionsPage'),
  getFundPage: () => getPageContent('fundPage'),
  getHomePage: () => getPageContent('homePage'),
  getMaterialWebListOfMine: () => getPageContent('materialWebListOfMine'),
  getPortfolioPage: () => getPageContent('portfolioPage'),
  getBidPage: () => getPageContent('bidPage'),
  getOrderCancelPage: () => getPageContent('orderCancelPage'),
  basicQ
};




















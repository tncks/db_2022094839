const sql_connection = require('../config/db');











// for money adjustment (buyer's money -> be sended to  seller's money)
const tradeResultMoneyToss = async (sellOrder, matchedQuantity) => {
    console.log(`tradeResultMoneyToss`);
    await sql_connection.promise().query(`UPDATE account_ SET MarginAvailable = (MarginAvailable + ?) WHERE CusId = ?`, [parseInt((sellOrder.StopPrice * matchedQuantity)), sellOrder.CusAccNum]);

}

const emptySharePortfolioDelCheckingAllRows = async () => {
    try {
        const [result] = await sql_connection.promise().query(`DELETE FROM portfolio WHERE NumShares = 0`);
        if (result && result.affectedRows > 0) {
            console.log('A one of portfolio row has been deleted, and total row affected count: ', result.affectedRows);
        }
    } catch (err) {
        console.log(err);
    }

}
// util function for porfolio & account_ marginBalance update or delete or insert (when matched)
exports.savePairOfPeersPortfolios = async (buyOrder, sellOrder, symbol, matchedQuantity) => {  // buyOrder, sellOrder -> readonly  정보 활용 용도로 read
    console.log(`savePairOfPeersPortfolios..`);

    let isStockFoundFromBuyerPortfolio; // check condition purpose

    const s_query = `SELECT * FROM portfolio WHERE StockSymbol = ? AND AccNum = ?`;
    const [result] = await sql_connection.promise().query(s_query, [symbol, buyOrder.CusAccNum]);
    isStockFoundFromBuyerPortfolio = (result.length > 0) ? true : false; // 기존 보유 주식 데이터 확인됨(result 존재) -> true 그렇지 않으면 false not found 

    // case 1:
    // select 해왔는데 테이블에서 해당 유저에 대해 기존 보유 주식이 발견 -> update /  else 발견되지 않고 && 매수주문이다 그럼 insert
    if (isStockFoundFromBuyerPortfolio) {
        // case 1-1 에 해당 update query
        // update
        try {
            // 매수가: 주식을산가격•(주식을사는데총지불한가격)/(주식수)     •만약삼성전자주식을5만원에10주, 10만원에10주매수했다면매수가는7만5천원이됩니다

            // 주식을사는데총지불한가격 구하기  그다음 총지불가격 구하기 == 그 변수 값 + 새로운추정합산값(buyOrder.PurchasePrice * matchedQuantity)    =>  그 다음 이거를 n.0(==기존 보유수량(select로 읽은거) + matchedQuantity) 실수로 나누고 정수로 round 하기.  =>  이거를 portfolio.PurchasePrice 컬럼에 overwirte 업데이트 하기
            const s_query = `SELECT * FROM portfolio WHERE StockSymbol = ? AND AccNum = ?`;
            const [result] = await sql_connection.promise().query(s_query, [symbol, buyOrder.CusAccNum]);
            let existingTotal = parseInt(result[0].NumShares) * parseInt(result[0].PurchasePrice);
            const newCalculatedTotal = existingTotal + (parseInt(buyOrder.StopPrice) * matchedQuantity);
            const calculationPPriceResult = Math.round(newCalculatedTotal / (result[0].NumShares + matchedQuantity));
            const u_query = `UPDATE portfolio SET PurchasePrice = ?, NumShares = (NumShares + ?) WHERE AccNum = ? AND StockSymbol = ?`;
            await sql_connection.promise().query(u_query, [calculationPPriceResult, matchedQuantity, buyOrder.CusAccNum, symbol]);
        } catch (err) {
            console.log(err);
        }
    } else {
        // case 1-2 에 해당 insert query - done
        try {
            const i_query = `INSERT INTO portfolio(AccNum, StockSymbol, NumShares, PurchasePrice) values (?, ?, ?, ?)`;
            await sql_connection.promise().query(i_query, [buyOrder.CusAccNum, symbol, matchedQuantity, buyOrder.StopPrice]);
        } catch (err) {
            console.log(err);
        }
    }



    /************************************************************************/


    // case 2:
    // 기존에 portfolio 에 있는 걸 판 주문(매칭페어중Sell)이다 

    try {
        // 1
        const [result] = await sql_connection.promise().query(`UPDATE portfolio SET NumShares = (NumShares - ?), SellingShares = (SellingShares - ?) WHERE StockSymbol = ? AND AccNum = ?`, [matchedQuantity, matchedQuantity, symbol, sellOrder.CusAccNum]);
        // 2
        await tradeResultMoneyToss(sellOrder, matchedQuantity);  // 나머지 chore 작업 위한 함수 호출
        // 3
        await emptySharePortfolioDelCheckingAllRows(); // 함수 호출(finally) -> deleteion situation check
    } catch (err) {
        console.log(err);
    }


}
// description for 'savePairOfPeersPortfolios'
//:  
/* NumShares:  파는상태에있는거 포함한 총 주식 보유수량
SellingShares: 순수 파는중인 주식수량
buyOrder.NumShares: 매칭된 매수주문의 원하는 구매하려는 주식수량
sellOrder.NumShares: 매칭된 매도주문의 원하는 sellingshares 수량(==NumShares)  */













/********************************************************** */

/********************************************************** */




exports.setLatestStockSharePrice = async (symbol) => {
    

    try {
        const [bestbid] = await sql_connection.promise().query(
            `SELECT MAX(ob.BidPrice) AS highest_buy
            FROM order_book ob
            WHERE ob.StockSymbol = ? AND ob.BidPrice is NOT NULL`
            , [symbol]); // pre-data1
        const [bestask] = await sql_connection.promise().query(
            `SELECT MIN(ob.AskPrice) AS lowest_sell
            FROM order_book ob
            WHERE ob.StockSymbol = ? AND ob.AskPrice is NOT NULL`
            , [symbol]); // pre-data2

        const highest_buy = (bestbid && bestbid.length > 0 && bestbid[0].highest_buy !== null) ? bestbid[0].highest_buy : -1;  // extract from pre-data1
        const lowest_sell = (bestask && bestask.length > 0 && bestask[0].lowest_sell !== null) ? bestask[0].lowest_sell : -1;  // extract from pre-data2
        
        const [myResult] = await sql_connection.promise().query(
            `WITH LatestPrices AS (
                SELECT PricePerShare 
                FROM transact
                JOIN order_ ON order_.OrderId = transact.OrderId
                WHERE order_.StockSymbol = ?  
                ORDER BY transact.TimeStamp_ DESC 
                LIMIT 1
            )
            SELECT 
                CASE 
                    WHEN PricePerShare = ? THEN PricePerShare
                    WHEN PricePerShare = ? THEN PricePerShare
                    ELSE NULL
                END AS currentPrice
            FROM 
                LatestPrices`
            , [symbol, highest_buy, lowest_sell]);
        

        if (myResult && myResult.length > 0 && myResult[0].currentPrice !== null) {
            // no problem then           

            // 1
            const [stockResult] = await sql_connection.promise().query(`UPDATE stock SET SharePrice = ? WHERE StockSymbol = ?`, [myResult[0].currentPrice, symbol]);


            // 2         
            const [reflectExecResult] = await sql_connection.promise().query(`UPDATE order_ SET CurSharePrice = ? WHERE StockSymbol = ?`, [myResult[0].currentPrice, symbol]);


            console.log('Stock price has been updated on setLatestStockSharePrice');

            
        } 

    } catch (err) {
        console.log(`Some Error on setLatestStockSharePrice function`);
        console.log(err);
    }

}
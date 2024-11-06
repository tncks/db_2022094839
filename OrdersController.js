const sql_connection = require('../config/db');
const ejs = require('ejs');
const { getPlaceStockPage, getOrdersAllLogPage, getTransactionsPage,
    getMaterialWebListOfMine, getBidPage } = require('../shared');
const { savePairOfPeersPortfolios, setLatestStockSharePrice } = require('./matchingutil');
const { consumeAsMuchAsPossible } = require('./submatchingutilformarket');


// POST METHOD





// 주문 매칭 함수 
const matchOrders = async (symbol, OrderType, cid, insertId) => {
    const sql_connection__ = sql_connection.promise();  // important!
    let totalMatches = 0;
    let transactionArr = [];

    try {
        await sql_connection__.beginTransaction();

        // 매도 및 매수 주문 가져오기 
        const [allExistingOrders] = await sql_connection__.query(
            `SELECT * FROM order_ WHERE StockSymbol = ? AND Completed = 0 AND StopPrice is not NULL`,
            [symbol]
        );

        const buyOrders = allExistingOrders.filter(o => o.OrderType === 'Buy');
        const sellOrders = allExistingOrders.filter(o => o.OrderType === 'Sell');



        // 매칭 로직
        for (let buyOrder of buyOrders) {
            for (let sellOrder of sellOrders) {
                if (buyOrder.CusAccNum === sellOrder.CusAccNum) // same person match himself ; cannot trade with self
                {
                    continue;
                }
                if (buyOrder.StopPrice === sellOrder.StopPrice) {
                    // 매칭이 일어나 이 if 블록으로 들어옴

                    const matchedQuantity = Math.min(buyOrder.NumShares, sellOrder.NumShares);

                    console.log(`Matched: ${matchedQuantity} quantities of ${sellOrder.StockSymbol} at [ ${sellOrder.StopPrice} won ]`);

                    // 트랜잭션 데이터 두번 push (1차적 과정)
                    transactionArr.push({
                        OrderId: parseInt(buyOrder.OrderId),
                        PricePerShare: parseInt(buyOrder.StopPrice),
                        TradeQuantity: matchedQuantity,
                    });
                    transactionArr.push({
                        OrderId: parseInt(sellOrder.OrderId),
                        PricePerShare: parseInt(sellOrder.StopPrice),
                        TradeQuantity: matchedQuantity,
                    });

                    // 포트폴리오 업데이트
                    await savePairOfPeersPortfolios(buyOrder, sellOrder, symbol, matchedQuantity);

                    // 수량 업데이트
                    buyOrder.NumShares -= matchedQuantity;
                    sellOrder.NumShares -= matchedQuantity;

                    // 데이터베이스 업데이트
                    await sql_connection__.query(
                        `UPDATE order_ SET NumShares = ?, isPartiallyFilled = 1, Completed = ? WHERE OrderId = ?`,
                        [buyOrder.NumShares, buyOrder.NumShares === 0 ? 1 : 0, buyOrder.OrderId]
                    );
                    await sql_connection__.query(
                        `UPDATE order_ SET NumShares = ?, isPartiallyFilled = 1, Completed = ? WHERE OrderId = ?`,
                        [sellOrder.NumShares, sellOrder.NumShares === 0 ? 1 : 0, sellOrder.OrderId]
                    );

                    // 매칭 횟수 증가
                    totalMatches += 1;

                    // Transact data append
                    if (!Array.isArray(transactionArr) || !transactionArr.length) {
                        console.log('Transaction array is empty');
                    } else {
                        await sql_connection__.query(`INSERT INTO transact (OrderId, PricePerShare, TradeQuantity) VALUES (?, ?, ?)`, [transactionArr[0].OrderId, transactionArr[0].PricePerShare, transactionArr[0].TradeQuantity]);
                        await sql_connection__.query(`INSERT INTO transact (OrderId, PricePerShare, TradeQuantity) VALUES (?, ?, ?)`, [transactionArr[1].OrderId, transactionArr[1].PricePerShare, transactionArr[1].TradeQuantity]);

                        console.log('Transaction record insertion done.');

                        transactionArr = [];   // clear code  (flush array)
                    }

                    // << 작업 >>
                    // 완전히 100% 서로서로 체결된 경우
                    if (buyOrder.NumShares === 0 && sellOrder.NumShares === 0) {




                        await setLatestStockSharePrice(symbol);

                        if (buyOrder.CusAccNum == cid || sellOrder.CusAccNum == cid) {
                            if (OrderType == "Sell" && sellOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                                // bid quantity 감소 업데이트 쿼리문 실행
                            }
                            else if (OrderType == "Buy" && buyOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                                // ask quantity 감소 업데이트 쿼리문 실행
                            } else {
                                // pass 
                            }
                        } else {
                            await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                            await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                            // 감소 업데이트 bid, ask 양쪽다 실행
                        }
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity <= 0`, [symbol]);
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity <= 0`, [symbol]);

                        break;
                    }  // 매도주문이 complete 될 경우
                    else if (buyOrder.NumShares > 0 && sellOrder.NumShares === 0) {





                        await setLatestStockSharePrice(symbol);

                        if (buyOrder.CusAccNum == cid || sellOrder.CusAccNum == cid) {
                            if (OrderType == "Sell" && sellOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                                // bid quantity 감소 업데이트 쿼리문 실행
                            }
                            else if (OrderType == "Buy" && buyOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                                // ask quantity 감소 업데이트 쿼리문 실행
                            } else {
                                // pass 
                            }
                        } else {
                            await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                            await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                            // 감소 업데이트 bid, ask 양쪽다 실행
                        }
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity <= 0`, [symbol]);
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity <= 0`, [symbol]);





                    } // 매수주문이 complete 될 경우
                    else if (buyOrder.NumShares === 0 && sellOrder.NumShares > 0) {





                        await setLatestStockSharePrice(symbol);

                        if (buyOrder.CusAccNum == cid || sellOrder.CusAccNum == cid) {
                            if (OrderType == "Sell" && sellOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                                // bid quantity 감소 업데이트 쿼리문 실행
                            }
                            else if (OrderType == "Buy" && buyOrder.CusAccNum == cid) {
                                await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                                // ask quantity 감소 업데이트 쿼리문 실행
                            } else {
                                // pass 
                            }
                        } else {
                            await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, symbol, buyOrder.StopPrice]);
                            await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, symbol, sellOrder.StopPrice]);
                            // 감소 업데이트 bid, ask 양쪽다 실행
                        }
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity <= 0`, [symbol]);
                        await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity <= 0`, [symbol]);


                    } else {
                        // pass 
                    }
                } else {
                    break; // 더 이상 매칭이 불가능한 경우
                }
            }
        }

        // after for for 

        // partial test case - 넘친 order 
        const [checker] = await sql_connection__.query(
            `select * from order_ where OrderId = ?`,
            [insertId]
        );
        if (checker && checker.length > 0) {
            if (checker[0].Completed == 0 && checker[0].NumShares > 0) {
                await insertIntoOrderBook(symbol, checker[0].StopPrice, checker[0].NumShares, checker[0].OrderType);
                const ret = (totalMatches !== 0) ? totalMatches : -10;
                return ret;
            }
        }





        // MYSQL 수정사항 커밋
        await sql_connection__.commit();
    } catch (error) {
        console.error(`Err:`, error);
        await sql_connection__.rollback();  // 에러시 수정사항 롤백
    }

    return totalMatches; // 매칭된 총 주문 수 반환
}



// Insert into order_book table
const insertIntoOrderBook = async (symbol, StopPrice, NumShares, OrderType) => {
    await sql_connection.promise().execute(
        `INSERT INTO order_book (StockSymbol, 
        BidPrice, BidQuantity,
        AskPrice, AskQuantity) VALUES (?, ?, ?, ?, ?)`,
        [symbol,
            OrderType === 'Buy' ? parseInt(StopPrice) : null, OrderType === 'Buy' ? parseInt(NumShares) : null,
            OrderType === 'Sell' ? parseInt(StopPrice) : null, OrderType === 'Sell' ? parseInt(NumShares) : null
        ]
    );


}


// 새로운 주문 요청 처리 API
exports.myOrders = async (req, res) => {
    //console.log(`myOrders`);
    let { StockSymbol, StopPrice, NumShares, OrderType } = req.body;
    console.log(`${StockSymbol}, ${StopPrice}, ${NumShares}, ${OrderType}`);


    // 입력값 유효성 검사
    if (!StockSymbol || !NumShares || !OrderType) {
        return res.status(400).json({ error: 'Missing required fields' });
        // StockSymbol 입력값없음 -> reject   NumShare 입력값없음 -> reject   OrderType 입력값없음 -> reject 
    }

    if (StockSymbol) {
        const [result] = await sql_connection.promise().query(`SELECT StockSymbol FROM stock WHERE StockSymbol = ?`, [StockSymbol]);
        if (result == null || result.length === 0) {
            return res.status(400).json({ error: 'Cannot find stock name of that. Invalid request' });
        }
    }

    if (NumShares <= 0) {
        return res.status(400).json({ error: 'Invalid num request' });
    }

    if (OrderType == "Sell") {

        const [result] = await sql_connection.promise().query(`SELECT NumShares, SellingShares FROM portfolio WHERE StockSymbol = ? AND AccNum = ?`, [StockSymbol, req.session.CusId]);

        if (result.length === 0) {
            return res.status(400).json({ error: 'impossible situation.. misinformation' });
        }
        if (result && result[0].NumShares && result[0].SellingShares && (NumShares > (result[0].NumShares - result[0].SellingShares))) {
            return res.status(400).json({ error: '해당 수량으로 sell 주문을 넣었기에 거래가능수량을 초과함.' });
        }
    }

    if (StopPrice && StopPrice <= 0) {
        return res.status(400).json({ error: 'Invalid val request' });
    }

    if (!(OrderType == "Sell" || OrderType == "Buy")) {
        return res.status(400).json({ error: 'Sell Buy type is unknown fields' });
    }

    if (OrderType == "Sell") {
        if (NumShares <= 0) {
            return res.status(400).json({ error: 'Unknown values' });
        }

        const [validatingNumRes] = await sql_connection.promise().query(`SELECT NumShares FROM portfolio WHERE AccNum = ? AND StockSymbol = ?`, [req.session.CusId, StockSymbol]);
        let comp;
        if (validatingNumRes && validatingNumRes.length > 0) {
            comp = validatingNumRes[0].NumShares;
        } else {
            console.log('weird case..');
        }
        if (!(NumShares >= 1 && (NumShares - comp) <= 0)) {
            return res.status(400).json({ error: 'Invalid NumShares the number of selling share can not exceed your ownings shares num' });
        }

    }

    if (isNaN(NumShares)) {
        return res.status(400).json({ error: 'Quantity must be numbers' });
    }

    // 끝. 입력값 유효성 검사 통과
    let isMarket = (StopPrice == null || typeof StopPrice == 'undefined' || StopPrice == '' || StopPrice.length == 0);
    let marketStopLimitWhichIs = isMarket ? 'Market' : 'Limit_Stop';


    try {

        if (isMarket) {
            const isYet = await consumeAsMuchAsPossible(StockSymbol, NumShares, OrderType, req.session.CusId);
            if (!isYet) {
                console.log('isDone. -> so next is return statement. -> do not proceed anymore.');



                return res.status(201).json({ id: 0 });
            } else {
                // remainingShares still exist
                console.log('is Not Done. -> Still do the next flow code instructions..');
                const [currentStock] = await sql_connection.promise().query(
                    `SELECT SharePrice FROM stock where StockSymbol = ?`,
                    [StockSymbol]
                );
                const [result] = await sql_connection.promise().execute(
                    `INSERT INTO order_ (StockSymbol, StopPrice, NumShares, OrderType , CurSharePrice, isPartiallyFilled, Completed, CusAccNum, PriceType, OriginalNumShares) VALUES (?, (select ${OrderType == "Sell" ? 'Bid' : 'Ask'}Price from order_book where StockSymbol = ? AND BidPrice is NOT NULL order by ${OrderType == "Sell" ? 'Bid' : 'Ask'}Price ${OrderType == "Sell" ? 'DESC' : 'ASC'} LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [StockSymbol, StockSymbol, isYet, OrderType, currentStock[0].SharePrice, (isYet != NumShares), 0, req.session.CusId, marketStopLimitWhichIs, NumShares]
                );
                const [marketO] = await sql_connection.promise().query(
                    `SELECT StopPrice FROM order_ where OrderId = ?`,
                    [result.insertId]
                );


                await insertIntoOrderBook(StockSymbol, marketO[0].StopPrice, isYet, OrderType);

                return res.status(201).json({ id: result.insertId });
            }













        } else {
            const [currentMoney] = await sql_connection.promise().query(`SELECT MarginAvailable FROM account_ WHERE CusId = ?`, [req.session.CusId]);
            if (currentMoney.length > 0 && (OrderType === 'Buy') && (currentMoney[0].MarginAvailable - (StopPrice * NumShares) < 0)) {
                console.log(`return res.status(400).json({ error: 'Not enough cash balance.' })`);
                return res.status(400).json({ error: 'Not enough cash balance.' });
            }
        }


        console.log('after checking, normal status, then')
        // after checking, normal status, then 
        // subtract buyer's cash by total calculated stockprice
        // update seller's portfolio, sellingshares number
        if (OrderType === 'Buy') await sql_connection.promise().query(`UPDATE account_ SET MarginAvailable = (MarginAvailable - ?) WHERE CusId = ?`, [parseInt((StopPrice * NumShares)), req.session.CusId]);
        if (OrderType === 'Sell') await sql_connection.promise().query(`UPDATE portfolio SET SellingShares = (SellingShares + ?) WHERE AccNum = ? AND StockSymbol = ?`, [NumShares, req.session.CusId, StockSymbol]);


        //console.log('StopPrice:', StopPrice);
        const [currentStock] = await sql_connection.promise().query(
            `SELECT SharePrice FROM stock where StockSymbol = ?`,
            [StockSymbol]
        );
        const [result] = await sql_connection.promise().execute(
            `INSERT INTO order_ (StockSymbol, StopPrice, NumShares, OrderType , CurSharePrice, isPartiallyFilled, Completed, CusAccNum, PriceType, OriginalNumShares) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [StockSymbol, StopPrice, NumShares, OrderType, currentStock[0].SharePrice, 0, 0, req.session.CusId, marketStopLimitWhichIs, NumShares]
        );

        const matchesMade = await matchOrders(StockSymbol, OrderType, req.session.CusId, result.insertId); // 주문 추가 후 매칭 호출

        if (matchesMade > 0 || matchesMade == -10) {
            if (matchesMade > 0) console.log(`Matched ${matchesMade} orders for symbol ${StockSymbol}`);

            return res.status(201).json({ id: result.insertId });
        } else {

            await insertIntoOrderBook(StockSymbol, StopPrice, NumShares, OrderType);

            return res.status(201).json({ id: result.insertId });
        }




    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process order.' });
    }
};



// 펜딩, 접수상태인 주문 목록 조회 API
exports.myPending = async (req, res) => {

    try {
        const [orders_] = await sql_connection.promise().query(`SELECT * FROM order_ WHERE CusAccNum = ? AND Completed = 0 ORDER BY StockSymbol ASC`, [req.session.CusId]);

        if (orders_ && orders_.length > 0) {
            const orders = orders_;

            // 결과를 JSON 형태로 반환
            return res.status(200).json({ orders });


        } else {
            return res.status(200).json({ orders: orders_, error: 'Failed to fetch orders' });
        }



    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};


// 취소 API
exports.myOrderCancel = async (req, res) => {

    // First:  유효성 검사 코드
    //      1. 유효성 검사? 

    // 정보 추출
    const [extractedPreResult] = await sql_connection.promise().query(`SELECT Timestamp_, OrderType, PriceType, NumShares, StopPrice, StockSymbol from order_ WHERE OrderId = ?`, [req.body.OrderId]);

    const myOrderType = extractedPreResult[0].OrderType;
    const myPriceType = extractedPreResult[0].PriceType;
    const myNumShares = extractedPreResult[0].NumShares;
    const myStopPrice = extractedPreResult[0].StopPrice;
    const myStockSymbol = extractedPreResult[0].StockSymbol;

    if (extractedPreResult && extractedPreResult.length > 0) {

        try {

            if (myOrderType == "Sell") {
                // do following action      
                const [updatePortfolioResult] = await sql_connection.promise().query(`UPDATE portfolio SET SellingShares = (SellingShares - ?) WHERE AccNum = ? AND StockSymbol = ?`, [myNumShares, req.session.CusId, myStockSymbol]);  // 포트폴리오 sellingshares 업데이트
            }
            else {
                if (myPriceType == 'Market') {

                } else {
                    const calculation = parseInt(myNumShares) * parseInt(myStopPrice);
                    // do following action
                    const [updateAccountResult] = await sql_connection.promise().query(`UPDATE account_ SET MarginAvailable = (MarginAvailable + ?) WHERE CusId = ?`, [calculation, req.session.CusId]);  // 계좌 marginbalnance 업데이트
                }





            }


        } catch (err) {
            console.log(err);
            return res.status(400).json({ error: "fail, abnormal" });
        }

    } else {
        console.error(`abnormal`);
        return res.status(400).json({ error: "fail, abnormal" });
    }

    try {
        // 1
        await sql_connection.promise().query(`DELETE from transact where OrderId = ?`, [req.body.OrderId]);

        // 2
        await sql_connection.promise().query(`DELETE from order_ where OrderId = ?`, [req.body.OrderId]);

        // 3
        if (myPriceType === 'Limit_Stop') {
            if (myOrderType === "Sell") {
                const [result] = await sql_connection.promise().query(`select * from order_book where stocksymbol = ? AND AskPrice is NOT NULL AND AskPrice = ?`, [myStockSymbol, myStopPrice]);
                if (result && result.length > 0) {
                    await sql_connection.promise().query(`UPDATE order_book SET AskQuantity = (AskQuantity - ?) WHERE stocksymbol = ? AND AskPrice is NOT NULL AND AskPrice = ?`, [result[0].AskQuantity, myStockSymbol, myStopPrice]);
                }

            } else {
                const [result] = await sql_connection.promise().query(`
                    select * from order_book 
                    where stocksymbol = ? 
                    AND BidPrice is NOT NULL 
                    AND BidPrice = ?`, [myStockSymbol, myStopPrice]);

                if (result && result.length > 0) {
                    await sql_connection.promise().query(`
                        UPDATE order_book 
                        SET BidQuantity = (BidQuantity - ?) 
                        WHERE stocksymbol = ? 
                        AND BidPrice is NOT NULL 
                        AND BidPrice = ?`, [result[0].BidQuantity, myStockSymbol, myStopPrice]);
                }
            }
        }



        // optional) 조건 추가 ->  만약  mainResult affectedNum  이 1 이 아니라면 -> 문제.   1이면 ->  성공 
        return res.status(200).json({ cancelResult: "success" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
};



/******************************************************** */
// 히스토리, 주문 목록 조회(체결 미체결 스플릿) API
exports.myOrdersBySymbol = async (req, res) => {
    const { symbol } = req.params;
    try {
        const [orders] = await sql_connection.promise().query(`SELECT * FROM order_ WHERE StockSymbol = ? AND CusAccNum = ? ORDER BY Timestamp_ DESC`, [symbol, req.session.CusId]);

        // 미체결주문과 체결주문으로 분리
        const openOrders = orders.filter(order => order.Completed === 0);
        const completedOrders = orders.filter(order => order.Completed === 1);

        // 결과를 JSON 형태로 반환
        return res.json({ openOrders, completedOrders });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
// 체결 미체결 페이지 렌더링
exports.myMaterialWebListOfMineBySymbol = async (req, res) => {
    try {
        const { symbol } = req.params;
        let page = ejs.render(getMaterialWebListOfMine(), { symbol });
        return res.send(page);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch symbols' });
    }
};
/******************************************************** */







/******************************************************** */
// (호가 데이터 로드 함수) Limit 5 Bid and Ask
const myGetOrderBook = async (symbol) => {

    const queryTopBidSelectionQ = `
        WITH bid_side AS (SELECT BidPrice, BidQuantity FROM order_book WHERE StockSymbol = ? AND BidPrice is NOT NULL)
        SELECT BidPrice AS StopPrice, SUM(BidQuantity) AS total_quantity
        FROM bid_side
        GROUP BY BidPrice
        ORDER BY BidPrice DESC
        LIMIT 5;
        `;
    const queryTopAskSelectionQ = `
        WITH ask_side AS (SELECT AskPrice, AskQuantity FROM order_book WHERE StockSymbol = ? AND AskPrice is NOT NULL)
        SELECT AskPrice AS StopPrice, SUM(AskQuantity) AS total_quantity
        FROM ask_side
        GROUP BY AskPrice
        ORDER BY AskPrice ASC
        LIMIT 5;
        `;

    const [buyOrders] = await sql_connection.promise().query(
        queryTopBidSelectionQ,
        [symbol]
    );

    const [sellOrders] = await sql_connection.promise().query(
        queryTopAskSelectionQ,
        [symbol]
    );


    const mybids = buyOrders.map(order => ({ StopPrice: order.StopPrice, NumShares: order.total_quantity }));
    const myasks = sellOrders.map(order => ({ StopPrice: order.StopPrice, NumShares: order.total_quantity }));

    if ((buyOrders.length === 0) && (sellOrders.length === 0)) {
        return null;
    } else if ((buyOrders.length !== 0) && (sellOrders.length === 0)) {
        return {
            bids: mybids.reverse(),
            asks: []
        };
    } else if ((buyOrders.length === 0) && (sellOrders.length !== 0)) {
        return {
            bids: [],
            asks: myasks
        };
    } else { // case - normal status 
        return {
            bids: mybids.reverse(),
            asks: myasks
        };
    }


};
// 호가 페이지 렌더링
exports.myBidBySymbol = async (req, res) => {
    const { symbol } = req.params;
    const orderBook = await myGetOrderBook(symbol);

    let page = ejs.render(getBidPage(), { symbol, orderBook });
    res.send(page);
};
/******************************************************** */




// 주문 작성 폼 페이지 렌더링
exports.myPlaceStockBySymbol = (req, res) => {
    //placeStockPage
    const { symbol } = req.params;

    let page = ejs.render(getPlaceStockPage(), {
        qdata: req.query.stocksymbol || '',
        symbol: symbol || ''
    });
    res.send(page);
};





// 사용자 모든 주문내용 뷰 페이지 렌더링
exports.myOrdersAllLog = async (req, res) => {
    const my_custom_selall_query = `SELECT stock.StockName, stock.StockSymbol,	OrderType,	NumShares,	CusAccNum,	Timestamp_,	PriceType,	StopPrice,	CurSharePrice,	isPartiallyFilled,	Completed,	OriginalNumShares from order_ join stock on stock.StockSymbol = order_.StockSymbol WHERE CusAccNum = ? ORDER BY Timestamp_ DESC`;
    const t_query = `SELECT stock.StockName, order_.StockSymbol as Symbol, transact.Timestamp_ as TradedTimeAt, transact.PricePerShare as Price, transact.TradeQuantity, order_.OrderType as TradePosition FROM transact JOIN order_ ON transact.OrderId = order_.OrderId INNER JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE order_.CusAccNum = ? ORDER BY transact.Timestamp_ DESC`;
    try {

        const [results] = await sql_connection.promise().query(my_custom_selall_query, [req.session.CusId]);

        const orders = results;

        let [ts] = await sql_connection.promise().query(t_query, [req.session.CusId]);

        if (ts && ts.length > 0) {
            let page = ejs.render(getOrdersAllLogPage(), {
                orders: orders,
                data: ts
            });
            return res.send(page);
        } else {
            let page = ejs.render(getOrdersAllLogPage(), {
                orders: orders,
                data: []
            });
            return res.send(page);
        }






    } catch (err) {
        res.status(500).json({ message: err.message });
    }










};





// 사용자 종목별 거래 내역 페이지 렌더링
exports.myTransactionsBySymbol = async (req, res) => {
    const my_custom_selall_query = `SELECT stock.StockName, order_.StockSymbol as Symbol, transact.Timestamp_ as TradedTimeAt, transact.PricePerShare as Price, transact.TradeQuantity, order_.OrderType as TradePosition FROM transact JOIN order_ ON transact.OrderId = order_.OrderId INNER JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE order_.CusAccNum = ? AND order_.StockSymbol = ? ORDER BY transact.Timestamp_ DESC`;
    try {

        const [results] = await sql_connection.promise().query(my_custom_selall_query, [req.session.CusId, req.query.stocksymbol]);

        if (results && results.length > 0) {

            let page = ejs.render(getTransactionsPage(), {
                data: results
            });
            return res.send(page);

        } else {
            let page = ejs.render(getTransactionsPage(), {
                data: []
            });
            return res.send(page);
        }







    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};



















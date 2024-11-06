const sql_connection = require('../config/db');

exports.consumeAsMuchAsPossible = async (StockSymbol, NumShares, OrderType, cid) => {
    console.log('consume started..')

    let transactionArr = [];
    let remainingShares = NumShares;
    const sql_connection__ = sql_connection.promise();
    await sql_connection__.beginTransaction();

    try {




        while (remainingShares > 0) {
            console.log('while: remainshare: ', remainingShares);

            const [matchingOrders] = await sql_connection__.query(`
            SELECT OrderId, StopPrice, NumShares 
            FROM order_ 
            WHERE 
                CusAccNum != ?  
                AND StockSymbol = ?
                AND OrderType = ?
                AND PriceType = 'Limit_Stop'
                AND Completed = 0 
            ORDER BY 
                StopPrice ${OrderType === 'Sell' ? 'DESC' : 'ASC'}, 
                Timestamp_ ASC 
            LIMIT 1`, [cid, StockSymbol, OrderType === 'Sell' ? 'Buy' : 'Sell']
            );
            console.log('while: await: matchingOrders.length:', matchingOrders.length);

            if (matchingOrders.length === 0) {
                console.log('No more matching orders found.'); // 더 이상 매칭할 수 있는 주문이 없다면 종료
                break;
            }

            const order = matchingOrders[0];
            const orderId = order.OrderId;
            const orderStopPrice = order.StopPrice;
            const orderNumShares = order.NumShares;
            const matchedQuantity = Math.min(remainingShares, orderNumShares);

            // 잔고 확인
            if (OrderType === "Buy") {
                const [currentMoney] = await sql_connection__.query(`SELECT MarginAvailable FROM account_ WHERE CusId = ?`, [cid]);
                if (currentMoney.length !== 0 && currentMoney[0].MarginAvailable - (orderStopPrice * matchedQuantity) < 0) {
                    console.log(`Not enough cash balance.`);
                    break;  // 잔고 부족시
                }
            }

            // 트랜잭션 데이터 두번 push (1차적 과정)
            transactionArr.push({
                OrderId: parseInt(3 * cid + 11 + NumShares + 2 * cid - 13), // rand
                PricePerShare: parseInt(orderStopPrice),
                TradeQuantity: matchedQuantity,
            });
            transactionArr.push({
                OrderId: parseInt(orderId),
                PricePerShare: parseInt(orderStopPrice),
                TradeQuantity: matchedQuantity,
            });

            // 거래 체결 로직 
            await sql_connection__.query(`
            UPDATE order_ 
            SET NumShares = NumShares - ?, Completed = CASE WHEN NumShares - ? <= 0 THEN 1 ELSE 0 END, isPartiallyFilled = 1
            WHERE OrderId = ?`, [matchedQuantity, matchedQuantity, orderId]); // 매칭된 지정가 주문의 정보 업데이트

            console.log('while: await: matchedQuantity:', matchedQuantity);

            // 잔여 수량 업데이트
            remainingShares -= matchedQuantity;

            if (!Array.isArray(transactionArr) || !transactionArr.length) {
                console.log('Transaction array is empty');
            } else {
                await sql_connection__.query(`INSERT INTO transact (OrderId, PricePerShare, TradeQuantity) VALUES (?, ?, ?)`, [transactionArr[0].OrderId, transactionArr[0].PricePerShare, transactionArr[0].TradeQuantity]);
                await sql_connection__.query(`INSERT INTO transact (OrderId, PricePerShare, TradeQuantity) VALUES (?, ?, ?)`, [transactionArr[1].OrderId, transactionArr[1].PricePerShare, transactionArr[1].TradeQuantity]);

                console.log('tArr: ', transactionArr);
                console.log('Transaction record insertion done.');
                transactionArr = [];   // clear code  (flush array)
            }

            // 오더북 수량 업데이트
            if (OrderType == "Sell") {
                await sql_connection__.query(`UPDATE order_book SET BidQuantity = BidQuantity - ? WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity != 0 AND BidPrice = ?`, [matchedQuantity, StockSymbol, orderStopPrice]);
                // bid quantity 감소 업데이트 쿼리문 실행
            }
            else {
                await sql_connection__.query(`UPDATE order_book SET AskQuantity = AskQuantity - ? WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity != 0 AND AskPrice = ?`, [matchedQuantity, StockSymbol, orderStopPrice]);
                // ask quantity 감소 업데이트 쿼리문 실행
            }
            await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND BidPrice is NULL AND AskQuantity = 0`, [StockSymbol]);
            await sql_connection__.query(`DELETE FROM order_book WHERE StockSymbol = ? AND AskPrice is NULL AND BidQuantity = 0`, [StockSymbol]);

            // 부수적 작업 로직 (포트폴리오 업데이트 와 marginAvailable 조정 등 처리)
            if (OrderType === 'Sell') {  // 시장가 매도 요청 넣은 유저는 결과적으로 매도했으니까 NumShares(보유수량) 감소해야 하고 SellingShares 0을 향하며 감소해야하고 -> 맨 마지막에 그냥 set sellingshares = remaningshares  인가
                await sql_connection__.query(`
                UPDATE portfolio 
                SET NumShares = NumShares - ? 
                WHERE AccNum = ? AND StockSymbol = ?`, [matchedQuantity, cid, StockSymbol]);  // 시장가 매도 요청을 넣은 유저는 예수금이 판만큼 계산되어 반복마다 증가해야함 
                await sql_connection__.query(`
                    UPDATE account_ 
                    SET MarginAvailable = MarginAvailable + ? 
                    WHERE CusId = ?`, [matchedQuantity * orderStopPrice, cid]);
            } else {   // 시장가 매수 요청 넣은 유저는 결과적으로 매수했으니까 포트폴리오에 보유종목이 새롭게 추가 혹은 업데이트 되어야 하고 예수금은 반복마다 매칭된만큼 차감되어야 함 단 그시점 잔고가 아직 남아있는동안만
                await sql_connection__.query(`
                UPDATE portfolio 
                SET NumShares = NumShares + ? 
                WHERE AccNum = ? AND StockSymbol = ?`, [matchedQuantity, cid, StockSymbol]);
                await sql_connection__.query(`
                    UPDATE account_ 
                    SET MarginAvailable = MarginAvailable - ? 
                    WHERE CusId = ?`, [matchedQuantity * orderStopPrice, cid]);
            }


        }


        if (!remainingShares) {
            const [currentStock] = await sql_connection__.query(
                `SELECT SharePrice FROM stock where StockSymbol = ?`,
                [StockSymbol]
            );
            await sql_connection__.query(
                `INSERT INTO order_ (OrderId, StockSymbol, StopPrice, NumShares, OrderType , CurSharePrice, isPartiallyFilled, Completed, CusAccNum, PriceType, OriginalNumShares) VALUES (?,?, (SELECT PricePerShare FROM transact ORDER BY Id DESC LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?)`,
                [3 * cid + 1700 + NumShares + 11 * cid - 17, StockSymbol, 0, OrderType, currentStock[0].SharePrice, 1, 1, cid, 'Market', NumShares]
            );
        }
        await sql_connection__.commit();
    } catch (err) {
        console.error(`Error:`, err);
        await sql_connection__.rollback();  // 에러시 수정사항 롤백
    }

    // 남은 수량이 있을 경우 
    if (remainingShares > 0) {
        console.log('남은 수량 o..');
        console.log('Yet');
        return remainingShares;

    } else {
        console.log('남은 수량 x..');
        console.log('Done');
        return 0;
    }
}


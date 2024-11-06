const sql_connection = require('../config/db');
const ejs = require('ejs');
const {
    basicQ
} = require('../shared');
const shared = require('../shared');



// GET METHOD














exports.myWelcome = (req, res) => {
    var unconditionalStockListDeliveryToFrontSide;


    /* SELECT ALL STOCK AT FIRST */

    sql_connection.query(basicQ, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            unconditionalStockListDeliveryToFrontSide = result;
        }
        else {
            console.log('Empty 테이블: 주식 정보 하나도 없음');
            unconditionalStockListDeliveryToFrontSide = 0;
        }



        if (typeof req.session.userID !== 'undefined' && req.session.userID.length >= 1) {

        
            return res.redirect('/home');


        } else {
            sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume DESC limit 3;`, (err, h_results) => {
                if (err) throw err;

                sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume ASC limit 3;`, (err, l_results) => {
                    if (err) throw err;


                    const pageContent = shared.getWelcomePage
                    let page = ejs.render(pageContent(), {
                        data: unconditionalStockListDeliveryToFrontSide || null,
                        mydata: h_results,
                        mydata_: l_results
                    });
                    return res.send(page);

                });
            });
        }




    });



};

exports.myHome = (req, res) => {
    var unconditionalStockListDeliveryToFrontSide;


    /* SELECT ALL STOCK AT FIRST */

    sql_connection.query(basicQ, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            unconditionalStockListDeliveryToFrontSide = result;
        }
        else {
            console.log('Empty 테이블: 주식 정보 하나도 없음');
            unconditionalStockListDeliveryToFrontSide = 0;
        }


        if (req.session.userID && req.session.userID.length >= 1) {


            sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume DESC limit 3;`, (err, h_results) => {
                if (err) throw err;

                sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume ASC limit 3;`, (err, l_results) => {
                    if (err) throw err;


                    const pageContent = shared.getHomePage
                    let page = ejs.render(pageContent(), {
                        data: unconditionalStockListDeliveryToFrontSide || null,
                        mydata: h_results,
                        mydata_: l_results
                    });
                    return res.send(page);

                });
            });


        } else {

            console.log('Detected: strange request from an anonymous human..');
            sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume DESC limit 3;`, (err, h_results) => {
                if (err) throw err;

                sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume ASC limit 3;`, (err, l_results) => {
                    if (err) throw err;


                    const pageContent = shared.getWelcomePage
                    let page = ejs.render(pageContent(), {
                        data: unconditionalStockListDeliveryToFrontSide || null,
                        mydata: h_results,
                        mydata_: l_results
                    });
                    return res.send(page);

                });
            });

        }

    });


};

// lgout
exports.myLogout = async (req, res) => {
    var unconditionalStockListDeliveryToFrontSide;
    const pageContent = shared.getWelcomePage


    // in code level here: do something first, such as session destroy user, and other stuff works, then if all ok, then redirect to welcome Page. for now, logout process done!

    /* early code starts from here.. */
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            let page = ejs.render(pageContent(), {
                data: unconditionalStockListDeliveryToFrontSide,
            });
            return res.send(page);
        }
        // Description:else -> destroy was normally done. then now execute next code line.
    });



    /* basic fundamental code starts from here.. */


    try {
        const [result] = await sql_connection.promise().query(basicQ);

        if (result && result.length > 0) {
            unconditionalStockListDeliveryToFrontSide = result;
        }
        else {
            console.log('Empty 테이블: 주식 정보 하나도 없음');
            unconditionalStockListDeliveryToFrontSide = 0;   // ?? ??
        }
    } catch (err) {
        console.log(err);

    } finally {
        sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume DESC limit 3;`, (err, h_results) => {
            if (err) throw err;

            sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume ASC limit 3;`, (err, l_results) => {
                if (err) throw err;


                let page = ejs.render(pageContent(), {
                    data: unconditionalStockListDeliveryToFrontSide,
                    mydata: h_results,
                    mydata_: l_results
                });
                return res.send(page);

            });
        });
        // render the welcome Page with query data of stock list in order for displaying default home screen with basic table contents
    }

    // all done.

};
// router.post('/logout', usersController.myLogout);  // api/ path 

exports.getMyLogin = (req, res) => {
    if (req.session.userID && req.session.userID.length >= 1) {

        console.log('Detected: strange request from a strange client..');
        console.log('username is :');
        console.log(req.session.userID);
        const pageContent = shared.getHomePage
        let page = ejs.render(pageContent(), {});
        return res.send(page);


    } else {

        const pageContent = shared.getLoginPage
        let page = ejs.render(pageContent(), {
            data: {},
        });
        return res.send(page);

    }

}; // g

// lgin
exports.myLogin = (req, res) => {
    const { userID, userPassword } = req.body;
    var unconditionalStockListDeliveryToFrontSide;
    const queryUserCredentialMatchDuringLoginSelectionQ = `select * from login where Usr = ? and Pwd = ?`;


    /* SELECT ALL STOCK AT FIRST */

    sql_connection.query(basicQ, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            unconditionalStockListDeliveryToFrontSide = result;
        }
        else {
            console.log('Empty 테이블: 주식 정보 하나도 없음');
            unconditionalStockListDeliveryToFrontSide = 0;
        }
    });



    /* CHECK LOGIN CREDENTIAL IF THE USER EXISTS TO PROCESS LOGIN STUFF AND MOVE TO HOME DASH IF OK */

    sql_connection.query(queryUserCredentialMatchDuringLoginSelectionQ, [userID, userPassword], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            //console.log('results 0 index thing');
            //console.log((results[0].Id));
            //console.log((results.CusId));
            // Good. 200 OK status:   로그인 성공

            req.session.userID = userID;    // userId를 세션에 저장
            req.session.CusId = results[0].Id; // CusID (Id)를 세션에 저장



            sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume DESC limit 3;`, (err, h_results) => {
                if (err) throw err;

                sql_connection.query(`SELECT order_.StockSymbol, SUM(TradeQuantity) as WeekTotalTrVolume from transact join order_ on order_.orderId = transact.orderId where order_.ordertype = 'Sell' AND transact.Timestamp_ >= NOW() - INTERVAL 7 DAY group by StockSymbol order by WeekTotalTrVolume ASC limit 3;`, (err, l_results) => {
                    if (err) throw err;


                    const pageContent = shared.getHomePage
                    let page = ejs.render(pageContent(), {
                        data: unconditionalStockListDeliveryToFrontSide || null,
                        mydata: h_results,
                        mydata_: l_results
                    });
                    return res.send(page);

                });
            });
        }
        else {
            const pageContent = shared.getLoginPage
            let page = ejs.render(pageContent(), { loginResult: 'fail' });
            return res.send(page);


        }
    });

};
// router.post('/login', usersController.myLogin);  // api/ path 

exports.getMySignup = (req, res) => {
    const pageContent = shared.getSignupPage
    let page = ejs.render(pageContent(), {
        title: "Title",
        data: {},
    });
    res.send(page);
}; // g

// siup
exports.mySignup = (req, res) => {
    const { userID, userPassword, userLastName, userFirstName } = req.body;
    const queryUserinfoDuringRegistSelectionQ = `select * from login where Usr = ?`;
    const queryUserNormalAddDuringRegistInsertion_1Q_1 = `insert into customer (LastName, FirstName) values (?, ?)`;
    const queryUserNormalAddDuringRegistInsertion_2Q_2 = `insert into account_ (AccCreDate, CusId) values (NOW(),?);`;
    const queryUserNormalAddDuringRegistInsertion_3Q_3 = `insert into login (Usr, Pwd, Id) values (?, ?, ?);`;
    // 위 두개문장 정도는 트리거 자동화로 바꾸기 new user registration 시 나머지 insert into 두개 문장은 자동 실행되게 비즈니스 로직 구현해놓기 + 테스트도 

    sql_connection.query(queryUserinfoDuringRegistSelectionQ, [userID], (error, results, fields) => {
        if (error) throw error;

        if (results.length > 0) {
            console.log("이미 존재하는 아이디로 회원가입시도.");
            const pageContent = shared.getSignupPage
            let page = ejs.render(pageContent(), { signupResult: 'fail' });
            return res.send(page);
        }
        else {
            /* ADD A NEW USER UPDATE TO THE CUSTOMER TABLE */
            sql_connection.beginTransaction((err) => {
                if (err) throw err;



                sql_connection.query(queryUserNormalAddDuringRegistInsertion_1Q_1, [userLastName, userFirstName], (error, results, fields) => {
                    if (error) {
                        return sql_connection.rollback(() => {
                            throw error;
                        });
                    }

                    const newCusId = results.insertId;

                    sql_connection.query(queryUserNormalAddDuringRegistInsertion_2Q_2, [newCusId], (error, results, fields) => {
                        if (error) {
                            return sql_connection.rollback(() => {
                                throw error;
                            });
                        }

                        sql_connection.query(queryUserNormalAddDuringRegistInsertion_3Q_3, [userID, userPassword, newCusId], (error, results, fields) => {
                            if (error) {
                                return sql_connection.rollback(() => {
                                    throw error;
                                });
                            }

                            sql_connection.commit((err) => {
                                if (err) {
                                    return sql_connection.rollback(() => {
                                        throw err;
                                    });
                                }
                                // sc
                                console.log("serverlog: 회원가입 완료");

                                //res.send("회원가입 완료");

                                // redirection
                                res.redirect("http://localhost:3001/login");

                            });

                        });




                    });





                });
            });
        }
    });
};
// router.post('/signup', usersController.mySignup);  // api/ path 

exports.myGetFunds = (req, res) => { /* getFunds -> GET 방식만 처리. POST 방식으로 들어오는 요청에 대해서 처리하지 않음 */

    // 세션에서 CusID 가져옴 
    var id = req.session.CusId;  // req.session.CusId

    if (!id || typeof id === 'undefined') {
        console.log('req.session.CusId : ', id);
        console.log('req.session.CusId : ', req.session.CusId);
        console.log('redirect to /login..');
        return res.redirect('/login');
    }

    sql_connection.query(`SELECT MarginAvailable AS CustomerFund FROM account_ WHERE CusId = ?`, [id], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {

            const pageContent = shared.getFundPage
            let page = ejs.render(pageContent(), { data: results });
            return res.send(page);

        } else {
            console.log('/getFunds (path): Server Detected: results. length 0 on marginbalance request..');
            res.sendStatus(500);
        }


    });

};

// ca
exports.myCashAdd = (req, res) => {
    var id = req.session.CusId;
    const { cash_a } = req.body;
    const queryUpdateMoneyAddQ = `update account_ set MarginAvailable = MarginAvailable + ? where AccNum = ?`;

    if (!id || typeof id === 'undefined') {
        return res.redirect('/login');
    }
    if (typeof cash_a === 'undefined') {
        return res.redirect('/getFunds');
    }

    sql_connection.query(queryUpdateMoneyAddQ, [cash_a, id], (err, results) => {
        if (err) throw err;

        sql_connection.query(`SELECT MarginAvailable AS CustomerFund FROM account_ WHERE CusId = ?`, [id], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {

                const pageContent = shared.getFundPage
                let page = ejs.render(pageContent(), { data: results });
                return res.send(page);

            } else {
                console.log('/getFunds (path): Server Detected: results. length 0 on marginbalance request..');
                res.sendStatus(500);
            }


        });
    });
};
// router.post('/cashAdd', isAuthenticated, usersController.myCashAdd);  // api/ path

// cs
exports.myCashSub = (req, res) => {
    var id = req.session.CusId;
    const { cash_s } = req.body;
    const queryUpdateMoneySubQ = `update account_ set MarginAvailable = MarginAvailable - ? where AccNum = ?`;

    if (!id || typeof id === 'undefined') {
        return res.redirect('/login');
    }
    if (typeof cash_s === 'undefined') {
        return res.redirect('/getFunds');
    }

    sql_connection.query(queryUpdateMoneySubQ, [cash_s, id], (err, results) => {
        if (err) throw err;

        sql_connection.query(`SELECT MarginAvailable AS CustomerFund FROM account_ WHERE CusId = ?`, [id], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {

                const pageContent = shared.getFundPage
                let page = ejs.render(pageContent(), { data: results });
                return res.send(page);

            } else {
                console.log('/getFunds (path): Server Detected: results. length 0 on marginbalance request..');
                res.sendStatus(500);
            }


        });
    });
};
// router.post('/cashSub', isAuthenticated, usersController.myCashSub);  // api/ path


// 포트폴리오 페이지 렌더링
exports.myGetPortfolio = (req, res) => {

    // 세션에서 CusID 가져옴 
    var id = req.session.CusId;  // req.session.CusId

    if (!id || typeof id === 'undefined') {
        console.log('redirect to /login..');
        return res.redirect('/login');
    }
    // `userfilteredorder_ uo ON uo.CusAccNum = userpf.AccNum`
    // 보류: `WITH userpf AS (SELECT AccNum, StockSymbol, NumShares, StopPrice from portfolio WHERE AccNum = ?), userfilteredorder_ AS (SELECT o.StockSymbol, SUM(o.NumShares) FROM order_ o WHERE o.CusAccNum = ? GROUP BY o.StockSymbol)`
    sql_connection.query(`SELECT p.StockSymbol, s.StockName, p.NumShares, p.PurchasePrice, s.SharePrice, ((s.SharePrice - p.PurchasePrice) * p.NumShares) AS GainLoss, (p.NumShares - p.SellingShares) AS NumTradeAvailable, ROUND((((s.SharePrice - p.PurchasePrice) / p.PurchasePrice) * 100), 2) AS PriceChangeRate_percentMetricVal FROM portfolio p JOIN stock s ON s.StockSymbol = p.StockSymbol WHERE AccNum = ? ORDER BY p.StockSymbol ASC`, [req.session.CusId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {

            const pageContent = shared.getPortfolioPage
            let page = ejs.render(pageContent(), { data: results });
            return res.send(page);

        } else {
            //console.log('/getPortfolio (path): Server Detected: results. length 0 on portfolio request..');

            const pageContent = shared.getPortfolioPage
            let page = ejs.render(pageContent(), { data: null });
            return res.send(page);
        }


    });

};

// 취소 페이지 렌더링
exports.myGetOrderCancelable = async (req, res) => {

    //const orderBook = await myGetOrderBook(symbol);  // 이줄 주석처리하기 async 도 없애기?


    const pageContent = shared.getOrderCancelPage
    let page = ejs.render(pageContent(), {});
    return res.send(page);
};
/******************************************************** */


// CanCeLaccount(회원탈퇴)
exports.myCclaccount = async (req, res) => {

    const cusAccNum = req.session.CusId;

    const sql_connection__ = sql_connection.promise();  // important!
    await sql_connection__.beginTransaction();

    try {

        // transact 테이블에서 삭제
        const [predata] = await sql_connection__.query(`SELECT OrderId FROM order_ WHERE CusAccNum = ?`, [cusAccNum]);
        if (predata && predata.length > 0) {


            for (const orderbyuser of predata) {
                const [extractedPreResult] = await sql_connection__.query(`SELECT OrderId from transact WHERE OrderId = ?`, [orderbyuser.OrderId]);
                if (extractedPreResult.length > 0) {
                    // match
                    await sql_connection__.query(
                        `DELETE t FROM transact t
                        WHERE OrderId = ?`,
                        [extractedPreResult[0].OrderId]
                    );
                } else {
                    // non-exist
                }


            }





        }   // order_ table 은 total    transact  는 partial  인 상태



        //  portfolio 테이블에서 삭제
        await sql_connection__.query(`DELETE FROM portfolio WHERE AccNum = ?`, [cusAccNum]);




        //  order_book에서
        const [ordersthatuserhas] = await sql_connection__.query(`SELECT OrderId FROM order_ WHERE CusAccNum = ?`, [cusAccNum]);
        for (const orderthatuserhas of ordersthatuserhas) {
            const [extractedPreResult] = await sql_connection__.query(`SELECT Timestamp_ from order_ WHERE OrderId = ?`, [orderthatuserhas.OrderId]);
            await sql_connection__.query(`DELETE FROM order_book WHERE Timestamp_ = ?`, [extractedPreResult[0].Timestamp_]);
        }


        // order_ 테이블에서 삭제
        await sql_connection__.query(
            `
            DELETE o FROM order_ o
     JOIN (SELECT OrderId FROM order_ WHERE CusAccNum = ?) AS temp ON o.OrderId = temp.OrderId`
            , [cusAccNum]);

        //  login 테이블에서 삭제
        await sql_connection__.query(
            `DELETE FROM login WHERE Id = ?`,
            [cusAccNum]
        );

        //  account_ 테이블에서 삭제
        await sql_connection__.query(
            `DELETE FROM account_ WHERE CusId = ?`,
            [cusAccNum]
        );

        //  customer 테이블에서 삭제
        await sql_connection__.query(
            `DELETE FROM customer WHERE CusId = ?`,
            [cusAccNum]
        );

        // 트랜잭션 커밋
        await sql_connection__.commit();
        console.log('회원 탈퇴 완료.');

        // destroy the user current session
        req.session.destroy(err => {
            if (err) {

                let page = ejs.render(pageContent(), {
                    data: unconditionalStockListDeliveryToFrontSide,
                });
                return res.send(page);
            }
            // Description:else -> destroy was normally done. then now execute next code line.
        });
        return res.redirect('/signup');


    } catch (error) {
        // 에러 발생 시 롤백
        await sql_connection__.rollback();
        console.error(error);
        res.status(500).json({ message: '회원 탈퇴 처리 중 오류가 발생.' });
    }

};
// router.post('/cclaccount', usersController.myCclaccount);  // api/ path 


exports.myTimelyOrder = async (req, res) => {

    let sql = `SELECT stock.StockName, order_.StockSymbol, order_.OrderType, order_.NumShares, order_.CusAccNum, order_.Timestamp_, order_.PriceType, order_.StopPrice, order_.CurSharePrice, order_.isPartiallyFilled, order_.Completed, order_.OriginalNumShares from order_ JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE CusAccNum = ?`;
    const params = [];
    params.push(req.session.CusId);
    if (req.query.period) {
        const period = req.query.period;
        let dateCondition = '';
        switch (period) {
            case 'today':
                dateCondition = 'DATE(order_.Timestamp_) = CURDATE()';
                break;
            case 'thisMonth':
                dateCondition = 'MONTH(order_.Timestamp_) = MONTH(CURDATE()) AND YEAR(order_.Timestamp_) = YEAR(CURDATE())';
                break;
            case 'lastMonth':
                dateCondition = 'MONTH(order_.Timestamp_) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(order_.Timestamp_) = YEAR(CURDATE())';
                break;
            case 'last3Months':
                dateCondition = 'order_.Timestamp_ >= NOW() - INTERVAL 3 MONTH';
                break;
            case 'lastYear':
                dateCondition = 'order_.Timestamp_ >= NOW() - INTERVAL 1 YEAR';
                break;
            default:
                break;
        }
        sql += ` AND ${dateCondition}`;
    }
    if (req.query.startDate_ && req.query.endDate_) {
        sql += ' AND order_.Timestamp_ BETWEEN ? AND ?';
        params.push(req.query.startDate_ + ' 00:00:00', req.query.endDate_ + ' 23:59:59'); // DATETIME 포맷에 맞춤
    }
    try {
        const [results] = await sql_connection.promise().query(sql, params);
        const orders = results;
        if (results && results.length > 0) {
            return res.json({ orders: orders });
        } else {
            return res.json({ orders: [] });
        }
    } catch (err) {
        console.log(err);
    }
};

exports.myTrades = async (req, res) => {
    //
    let sql = `WITH transact_ AS (SELECT stock.StockName, order_.StockSymbol, transact.Timestamp_, transact.PricePerShare, transact.TradeQuantity, order_.OrderType FROM transact JOIN order_ ON transact.OrderId = order_.OrderId INNER JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE order_.CusAccNum = ? ORDER BY transact.Timestamp_ DESC) SELECT transact_.StockName, transact_.StockSymbol as Symbol, transact_.Timestamp_ as TradedTimeAt, transact_.PricePerShare as Price, transact_.TradeQuantity, transact_.OrderType as TradePosition FROM transact_ WHERE 1=1`;
    const params = [];
    params.push(req.session.CusId);
    if (req.query.period) {
        const period = req.query.period;
        let dateCondition = '';
        switch (period) {
            case 'today':
                dateCondition = 'DATE(transact_.Timestamp_) = CURDATE()';
                break;
            case 'thisMonth':
                dateCondition = 'MONTH(transact_.Timestamp_) = MONTH(CURDATE()) AND YEAR(transact_.Timestamp_) = YEAR(CURDATE())';
                break;
            case 'lastMonth':
                dateCondition = 'MONTH(transact_.Timestamp_) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(transact_.Timestamp_) = YEAR(CURDATE())';
                break;
            case 'last3Months':
                dateCondition = 'transact_.Timestamp_ >= NOW() - INTERVAL 3 MONTH';
                break;
            case 'lastYear':
                dateCondition = 'transact_.Timestamp_ >= NOW() - INTERVAL 1 YEAR';
                break;
            default:
                break;
        }
        sql += ` AND ${dateCondition}`;
    }
    if (req.query.startDate && req.query.endDate) {
        sql += ' AND transact_.Timestamp_ BETWEEN ? AND ?';
        params.push(req.query.startDate + ' 00:00:00', req.query.endDate + ' 23:59:59'); // DATETIME 포맷에 맞춤
    }
    try {
        const [results] = await sql_connection.promise().query(sql, params);
        if (results && results.length > 0) {
            return res.json({ data: results });
        } else {
            return res.json({ data: [] });
        }
    } catch (err) {
        console.log(err);
    }
};

exports.myNamelyOrder = async (req, res) => {


    if (req.query.searching) {
        try {
            const [results] = await sql_connection.promise().query(`SELECT stock.StockName, order_.StockSymbol, order_.OrderType, order_.NumShares, order_.CusAccNum, order_.Timestamp_, order_.PriceType, order_.StopPrice, order_.CurSharePrice, order_.isPartiallyFilled, order_.Completed, order_.OriginalNumShares from order_ JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE CusAccNum = ? AND StockName LIKE CONCAT('%', ?, '%')`, [req.session.CusId, req.query.searching]);
            const orders = results;
            if (results && results.length > 0) {
                return res.json({ orders: orders });
            } else {
                return res.json({ orders: [] });
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        return;
    }

};

exports.myNorms = async (req, res) => {
    if (req.query.searching_) {
        try {
            const [results] = await sql_connection.promise().query(`WITH transact_ AS (SELECT stock.StockName, order_.StockSymbol, transact.Timestamp_, transact.PricePerShare, transact.TradeQuantity, order_.OrderType FROM transact JOIN order_ ON transact.OrderId = order_.OrderId INNER JOIN stock ON order_.StockSymbol = stock.StockSymbol WHERE order_.CusAccNum = ? ORDER BY transact.Timestamp_ DESC) SELECT transact_.StockName, transact_.StockSymbol as Symbol, transact_.Timestamp_ as TradedTimeAt, transact_.PricePerShare as Price, transact_.TradeQuantity, transact_.OrderType as TradePosition FROM transact_ WHERE transact_.StockName LIKE CONCAT('%', ?, '%')`, [req.session.CusId, req.query.searching_]);
            if (results && results.length > 0) {
                return res.json({ data: results });
            } else {
                return res.json({ data: [] });
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        return;
    }
};

exports.myOwnings = async (req, res) => {
    if (req.query.searching) {
        try {
            const [results] = await sql_connection.promise().query(`SELECT p.StockSymbol, s.StockName, p.NumShares, p.PurchasePrice, s.SharePrice, ((s.SharePrice - p.PurchasePrice) * p.NumShares) AS GainLoss, (p.NumShares - p.SellingShares) AS NumTradeAvailable, ROUND((((s.SharePrice - p.PurchasePrice) / p.PurchasePrice) * 100), 2) AS PriceChangeRate_percentMetricVal FROM portfolio p JOIN stock s ON s.StockSymbol = p.StockSymbol WHERE AccNum = ? AND s.StockName LIKE CONCAT('%', ?, '%') ORDER BY p.StockSymbol ASC`, [req.session.CusId, req.query.searching]);

            if (results && results.length > 0) {
                return res.json({ data: results });
            } else {
                return res.json({ data: null });
            }

        } catch (err) {
            console.log(err);
        }
    } else {
        return;
    }

};

exports.myListups = async (req, res) => {
    if (req.query.searching) {
        try {
            const filterBasicQ = `WITH Previous_Close_ AS (
                SELECT 
                    stockpricehistory.stocksymbol,
                    MAX(timestamp_) AS latest_timestamp
                FROM 
                    stockpricehistory
                JOIN stock on stock.StockSymbol = stockpricehistory.StockSymbol
                WHERE stock.StockName LIKE CONCAT('%', ?, '%')
                GROUP BY 
                    stockpricehistory.stocksymbol
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
              JOIN old_stock ON Stock.stocksymbol = old_stock.stocksymbol ORDER BY Stock.stockname ASC`;
              console.log('api called');
            const [results] = await sql_connection.promise().query(filterBasicQ, [req.query.searching]);
            console.log('api called, results: ', results);

            
            if (results && results.length > 0) {
                
                return res.json({ data: results });
            } else {
                return res.json({ data: null });
            }

        } catch (err) {
            console.log(err);
        }
    } else {
        return;
    }
};
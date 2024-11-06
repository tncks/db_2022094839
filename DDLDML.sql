
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

use TARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGETTARGET;


SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


-- Table `customer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer` (
  `CusId` INT NOT NULL AUTO_INCREMENT,
  `LastName` VARCHAR(20) NOT NULL,
  `FirstName` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`CusId`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `account_`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `account_` (
  `AccNum` INT NOT NULL AUTO_INCREMENT,
  `AccCreDate` DATETIME NULL DEFAULT NULL,
  `CusId` INT NOT NULL,
  `MarginAvailable` INT UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`AccNum`),
  INDEX `CusId` (`CusId` ASC) VISIBLE,
  CONSTRAINT `account__ibfk_1`
    FOREIGN KEY (`CusId`)
    REFERENCES `customer` (`CusId`)
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `login`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `login` (
  `Usr` VARCHAR(20) NOT NULL,
  `Pwd` VARCHAR(20) NOT NULL,
  `Id` INT NOT NULL,
  PRIMARY KEY (`Usr`),
  INDEX `cfk_idx` (`Id` ASC) VISIBLE,
  CONSTRAINT `cfk`
    FOREIGN KEY (`Id`)
    REFERENCES `customer` (`CusId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `stock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock` (
  `StockSymbol` VARCHAR(6) NOT NULL,
  `StockName` VARCHAR(20) NOT NULL,
  `StockType` VARCHAR(20) NULL DEFAULT NULL,
  `SharePrice` INT NOT NULL,
  PRIMARY KEY (`StockSymbol`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `order_`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_` (
  `OrderId` INT NOT NULL AUTO_INCREMENT,
  `StockSymbol` VARCHAR(6) NULL DEFAULT NULL,
  `OrderType` VARCHAR(4) NOT NULL,
  `NumShares` INT NOT NULL,
  `CusAccNum` INT NULL DEFAULT '0',
  `Timestamp_` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PriceType` VARCHAR(15) NOT NULL,
  `StopPrice` INT NULL DEFAULT '0',
  `CurSharePrice` INT NULL DEFAULT NULL,
  `isPartiallyFilled` TINYINT(1) NULL DEFAULT '0',
  `Completed` TINYINT(1) NULL DEFAULT '0',
  `OriginalNumShares` INT NOT NULL,
  PRIMARY KEY (`OrderId`),
  INDEX `StockSymbol` (`StockSymbol` ASC) VISIBLE,
  INDEX `CusAccNum` (`CusAccNum` ASC) VISIBLE,
  CONSTRAINT `order__ibfk_1`
    FOREIGN KEY (`StockSymbol`)
    REFERENCES `stock` (`StockSymbol`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `order__ibfk_2`
    FOREIGN KEY (`CusAccNum`)
    REFERENCES `account_` (`AccNum`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `order_book`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_book` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `StockSymbol` VARCHAR(6) NOT NULL,
  `BidPrice` INT NULL DEFAULT NULL,
  `BidQuantity` INT NULL DEFAULT NULL,
  `AskPrice` INT NULL DEFAULT NULL,
  `AskQuantity` INT NULL DEFAULT NULL,
  `Timestamp_` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `sfk_idx` (`StockSymbol` ASC) VISIBLE,
  CONSTRAINT `sfk`
    FOREIGN KEY (`StockSymbol`)
    REFERENCES `stock` (`StockSymbol`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio` (
  `AccNum` INT NOT NULL,
  `StockSymbol` CHAR(6) NOT NULL,
  `NumShares` INT NOT NULL,
  `SellingShares` INT NOT NULL DEFAULT '0',
  `PurchasePrice` INT NOT NULL,
  PRIMARY KEY (`AccNum`, `StockSymbol`),
  INDEX `StockSymbol` (`StockSymbol` ASC) VISIBLE,
  CONSTRAINT `portfolio_ibfk_1`
    FOREIGN KEY (`AccNum`)
    REFERENCES `account_` (`AccNum`)
    ON UPDATE CASCADE,
  CONSTRAINT `portfolio_ibfk_2`
    FOREIGN KEY (`StockSymbol`)
    REFERENCES `stock` (`StockSymbol`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `stockpricehistory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stockpricehistory` (
  `StockSymbol` VARCHAR(6) NOT NULL,
  `SharePrice` INT NOT NULL,
  `Timestamp_` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`StockSymbol`, `Timestamp_`),
  CONSTRAINT `stockpricehistory_ibfk_1`
    FOREIGN KEY (`StockSymbol`)
    REFERENCES `stock` (`StockSymbol`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `transact`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transact` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `OrderId` INT NULL DEFAULT NULL,
  `TimeStamp_` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PricePerShare` INT NULL DEFAULT NULL,
  `TradeQuantity` INT NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX `OrderId` (`OrderId` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

























LOCK TABLES `account_` WRITE;
/*!40000 ALTER TABLE `account_` DISABLE KEYS */;
INSERT INTO `account_` VALUES (1,'2024-10-14 14:43:16',1,896),(2,'2024-10-14 14:43:16',2,1000027),(3,'2024-10-14 14:43:16',3,2000310),(4,'2024-10-14 14:43:16',4,1000),(5,'2024-10-14 14:43:16',5,1000),(6,'2024-10-17 16:25:40',6,1000),(7,'2024-10-17 16:28:06',7,1000),(8,'2024-10-17 16:32:25',8,1000),(10,'2024-11-06 17:29:51',10,5);
/*!40000 ALTER TABLE `account_` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Yang','Shang'),(2,'Du','Victor'),(3,'Smith','John'),(4,'Philip','Lewis'),(5,'Garcia','Maria'),(6,'Som','Moul'),(7,'Jimmy','Brown'),(8,'Jun','Mercs'),(10,'kim','park');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES ('duvictor','s',2),('garciamaria','mypass123',5),('person1','1234',10),('philewis','mypassword',4),('polySasng','whatdo2',8),('smithjohn','helloWorld',3),('sonargria','hardpd2',6),('tvboyman','easypwd',7),('yangshang','password123',1);
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `order_`
--

LOCK TABLES `order_` WRITE;
/*!40000 ALTER TABLE `order_` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `order_book`
--

LOCK TABLES `order_book` WRITE;
/*!40000 ALTER TABLE `order_book` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `portfolio`
--

LOCK TABLES `portfolio` WRITE;
/*!40000 ALTER TABLE `portfolio` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES ('AAPL','Apple Inc.','technology',7),('AMZN','Amazon','IT',500),('BABA','Alibaba','IT',100),('F','Ford','automotive',9),('GM','General Motors','automotive',34),('GOOGL','Alphabet','IT',220),('IBM','IBM','technology',100),('KALI','Kaalisp','technology',15),('KFO','Koslas','automotive',91),('KGMO','Neneral Motors','automotive',34),('KIBMO','Kiset','technology',91),('KTAO','Toskaton','automotive',70),('MSFT','Microsoft','IT',250),('NFLX','Netflix','IT',350),('NVDA','NVIDIA','IT',9),('TCEHY','Tencent','IT',60),('TSLA','Tesla Inc.','automotive',1),('TWTR','Twitter.','IT',40);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stockpricehistory`
--

LOCK TABLES `stockpricehistory` WRITE;
/*!40000 ALTER TABLE `stockpricehistory` DISABLE KEYS */;
INSERT INTO `stockpricehistory` VALUES ('AAPL',149,'2024-10-19 18:07:01'),('AAPL',145,'2024-11-03 23:27:00'),('AAPL',7,'2024-11-06 00:35:01'),('AMZN',130,'2024-10-19 18:07:01'),('AMZN',500,'2024-11-03 23:27:00'),('AMZN',500,'2024-11-06 00:35:01'),('BABA',100,'2024-10-19 18:07:01'),('BABA',100,'2024-11-03 23:27:00'),('BABA',100,'2024-11-06 00:35:01'),('F',150,'2024-10-19 18:07:01'),('F',9,'2024-11-03 23:27:00'),('F',9,'2024-11-06 00:35:01'),('GM',145,'2024-10-19 18:07:01'),('GM',34,'2024-11-03 23:27:00'),('GM',34,'2024-11-06 00:35:01'),('GOOGL',220,'2024-10-19 18:07:01'),('GOOGL',220,'2024-11-03 23:27:00'),('GOOGL',220,'2024-11-06 00:35:01'),('IBM',148,'2024-10-19 18:07:01'),('IBM',100,'2024-11-03 23:27:00'),('IBM',100,'2024-11-06 00:35:01'),('KALI',15,'2024-10-19 18:07:01'),('KALI',15,'2024-11-03 23:27:00'),('KALI',15,'2024-11-06 00:35:01'),('KFO',91,'2024-10-19 18:07:01'),('KFO',91,'2024-11-03 23:27:00'),('KFO',91,'2024-11-06 00:35:01'),('KGMO',34,'2024-10-19 18:07:01'),('KGMO',34,'2024-11-03 23:27:00'),('KGMO',34,'2024-11-06 00:35:01'),('KIBMO',91,'2024-10-19 18:07:01'),('KIBMO',91,'2024-11-03 23:27:00'),('KIBMO',91,'2024-11-06 00:35:01'),('KTAO',70,'2024-10-19 18:07:01'),('KTAO',70,'2024-11-03 23:27:00'),('KTAO',70,'2024-11-06 00:35:01'),('MSFT',250,'2024-10-19 18:07:01'),('MSFT',250,'2024-11-03 23:27:00'),('MSFT',250,'2024-11-06 00:35:01'),('NFLX',350,'2024-10-19 18:07:01'),('NFLX',350,'2024-11-03 23:27:00'),('NFLX',350,'2024-11-06 00:35:01'),('NVDA',180,'2024-10-19 18:07:01'),('NVDA',5,'2024-11-03 23:27:00'),('NVDA',9,'2024-11-06 00:35:01'),('TCEHY',60,'2024-10-19 18:07:01'),('TCEHY',60,'2024-11-03 23:27:00'),('TCEHY',60,'2024-11-06 00:35:01'),('TSLA',152,'2024-10-19 18:07:01'),('TSLA',40500,'2024-11-03 23:27:00'),('TSLA',1,'2024-11-06 00:35:01'),('TWTR',40,'2024-10-19 18:07:01'),('TWTR',40,'2024-11-03 23:27:00'),('TWTR',40,'2024-11-06 00:35:01');
/*!40000 ALTER TABLE `stockpricehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `transact`
--

LOCK TABLES `transact` WRITE;
/*!40000 ALTER TABLE `transact` DISABLE KEYS */;
/*!40000 ALTER TABLE `transact` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-06 18:11:01

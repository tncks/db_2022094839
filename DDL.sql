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
AUTO_INCREMENT = 11
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
AUTO_INCREMENT = 11
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
AUTO_INCREMENT = 14
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
AUTO_INCREMENT = 14
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

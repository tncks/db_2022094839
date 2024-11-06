-- MySQL dump 10.13  Distrib 9.0.1, for Win64 (x86_64)
--
-- Host: localhost    Database: db_2022094839
-- ------------------------------------------------------
-- Server version	9.0.1

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

--
-- Dumping data for table `account_`
--

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

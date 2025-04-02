CREATE DATABASE  IF NOT EXISTS `gio_hoa` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gio_hoa`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gio_hoa
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `quantity` int NOT NULL,
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_75db0de134fe0f9fe9e4591b7bf` (`productId`),
  CONSTRAINT `FK_75db0de134fe0f9fe9e4591b7bf` FOREIGN KEY (`productId`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (1,2,4,4),(3,1,13,4),(4,2,3,9);
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'dam cuoi1'),(2,'chia buon'),(4,'dam cuoi'),(5,'heheh');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total` decimal(10,0) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `address` varchar(255) NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` int DEFAULT NULL,
  `paymentStatus` varchar(255) NOT NULL DEFAULT 'unpaid',
  PRIMARY KEY (`id`),
  KEY `FK_caabe91507b3379c7ba73637b84` (`userId`),
  CONSTRAINT `FK_caabe91507b3379c7ba73637b84` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,0,'shipped','59 Pham','cashOnDelivery','2025-03-19 15:33:52.949211',2,'unpaid'),(2,0,'processing','59 Pham','cashOnDelivery','2025-03-19 16:18:56.295246',2,'unpaid'),(3,0,'processing','59 Pham','creditCard','2025-03-19 16:28:01.092033',1,'unpaid'),(4,0,'processing','59 Phạm','creditCard','2025-03-19 16:29:05.201014',1,'unpaid'),(5,1,'processing','59 Pham','creditCard','2025-03-19 17:00:18.306232',2,'unpaid'),(6,1,'pending','59 Pham','cashOnDelivery','2025-03-19 17:01:16.953243',2,'paid'),(7,0,'pending','59 Pham','creditCard','2025-03-24 21:21:43.436156',1,'unpaid'),(8,0,'pending','59 Pham','creditCard','2025-03-24 21:22:16.341697',1,'unpaid'),(9,0,'pending','59 Pham','cashOnDelivery','2025-03-24 21:23:49.029820',1,'unpaid'),(10,0,'pending','59 Phạm','creditCard','2025-03-24 21:24:37.430603',1,'unpaid'),(11,0,'pending','59 Phạm','creditCard','2025-03-24 21:34:40.367348',1,'unpaid'),(12,1,'pending','59 Phạm','cashOnDelivery','2025-03-24 21:35:44.164731',1,'unpaid'),(13,1,'pending','59 Pham','creditCard','2025-03-24 21:40:19.792089',1,'unpaid'),(14,1,'pending','59 Pham','creditCard','2025-03-24 21:42:03.636548',1,'unpaid'),(15,0,'pending','59 Pham','creditCard','2025-03-24 21:51:30.242584',1,'unpaid'),(16,0,'pending','59 Pham','creditCard','2025-03-24 21:53:36.276838',1,'unpaid'),(17,0,'processing','59 Pham','creditCard','2025-03-24 22:11:39.094184',1,'unpaid'),(18,0,'pending','59 Pham','creditCard','2025-03-24 22:18:42.476207',1,'paid'),(19,0,'pending','59 Pham','cashOnDelivery','2025-03-24 22:19:28.335813',1,'paid'),(20,0,'shipped','59 Pham','bankTransfer','2025-03-24 22:19:55.537705',1,'unpaid'),(21,0,'pending','59 Pham','cashOnDelivery','2025-03-24 22:34:00.762743',1,'paid'),(22,0,'shipped','59 Pham','creditCard','2025-03-24 22:34:13.924409',1,'paid'),(23,1,'processing','59 Phạm','creditCard','2025-03-24 22:39:43.142352',1,'paid'),(24,1,'processing','59 Pham','creditCard','2025-03-24 23:44:24.152216',2,'paid'),(25,1,'cancelled','59 Pham','cashOnDelivery','2025-03-25 08:28:11.299841',2,'unpaid'),(26,22001,'pending','59 Pham','creditCard','2025-03-26 17:59:20.709963',2,'unpaid'),(27,33000,'pending','59 Pham','cashOnDelivery','2025-03-26 18:13:36.085619',2,'unpaid'),(28,1,'pending','59 Pham','creditCard','2025-03-27 08:45:32.371579',1,'paid');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `productId` int DEFAULT NULL,
  `orderId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_646bf9ece6f45dbe41c203e06e0` (`orderId`),
  KEY `FK_904370c093ceea4369659a3c810` (`productId`),
  CONSTRAINT `FK_646bf9ece6f45dbe41c203e06e0` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`),
  CONSTRAINT `FK_904370c093ceea4369659a3c810` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,1,0.00,NULL,1),(2,8,0.00,4,2),(3,1,0.00,4,3),(4,1,0.00,4,4),(5,12,0.06,4,5),(6,12,0.06,4,6),(7,5,0.06,4,7),(8,5,0.06,4,8),(9,2,0.06,4,9),(10,2,0.06,4,10),(11,3,0.06,4,11),(12,10,0.06,4,12),(13,11,0.06,4,13),(14,11,0.06,4,14),(15,5,0.06,4,15),(16,6,0.06,4,16),(17,6,0.06,4,17),(18,7,0.06,4,18),(19,8,0.06,4,19),(20,8,0.06,4,20),(21,8,0.06,4,21),(22,8,0.06,4,22),(23,11,0.06,4,23),(24,14,0.06,4,24),(25,15,0.06,4,25),(26,16,0.06,4,26),(27,2,11000.00,9,26),(28,4,0.06,4,27),(29,3,11000.00,9,27),(30,13,0.06,4,28);
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  `description` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `categoryId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ff0c0301a95e517153df97f6812` (`categoryId`),
  CONSTRAINT `FK_ff0c0301a95e517153df97f6812` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (4,'hoa cho ma',0.06,'/upload/file-1742371079065-403010874.jpg','dd','2025-03-19 14:57:59.126853',1),(9,'gio hoa dam cuoi',11000.00,'/upload/file-1742863476806-103103735.jpg','dep nhat huyen','2025-03-25 07:44:36.860860',1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'test@example.com','$2b$10$n.CZyliIhY2FQk5CEgB1JOSxcfgonOBFogZhMM0vVniJBmKZU4k5i','Test','user','2025-03-18 18:46:11.218433',1),(2,'luandz@gmail.com','$2b$10$aNYspNSx87Isz6EWqPafpe1nUVqqUlmZRugk8bQhaADIwEJJoA2re','Test','admin','2025-03-18 19:08:40.923473',1),(3,'luandz1@gmail.com','$2b$10$4OVVTYWXM5J072UxgbVc9.ejV5ugnZtdGQTbpllLJyr1U5mCBwiSu','Luan','user','2025-03-18 22:25:19.625400',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 11:03:55

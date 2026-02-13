-- MySQL dump 10.13  Distrib 8.4.7, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: almacen
-- ------------------------------------------------------
-- Server version	8.4.7

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
-- Table structure for table `acta_recepcion_detalles`
--

DROP TABLE IF EXISTS `acta_recepcion_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acta_recepcion_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acta_recepcion_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_numero` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad_esperada` decimal(10,2) NOT NULL,
  `cantidad_recibida` decimal(10,2) NOT NULL,
  `diferencia` decimal(10,2) DEFAULT NULL COMMENT 'Calculado como cantidad_recibida - cantidad_esperada',
  `conforme` tinyint NOT NULL DEFAULT '1',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acta_recepcion_detalles`
--

LOCK TABLES `acta_recepcion_detalles` WRITE;
/*!40000 ALTER TABLE `acta_recepcion_detalles` DISABLE KEYS */;
/*!40000 ALTER TABLE `acta_recepcion_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actas_recepcion`
--

DROP TABLE IF EXISTS `actas_recepcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actas_recepcion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_acta` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_recepcion` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nota_ingreso_id` int DEFAULT NULL,
  `responsable_id` int DEFAULT NULL,
  `aprobado` tinyint(1) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `tipo_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_id` int DEFAULT NULL,
  `proveedor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_operacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_conteo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condicion_temperatura` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_recepcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_entrega` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jefe_almacen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actas_recepcion`
--

LOCK TABLES `actas_recepcion` WRITE;
/*!40000 ALTER TABLE `actas_recepcion` DISABLE KEYS */;
INSERT INTO `actas_recepcion` VALUES (1,'ACT-2026-0001','2026-01-10','aprobado','Recepción conforme de medicamentos importados','2026-01-26 01:39:05','2026-01-26 01:39:05',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'ACT-2026-0002','2026-01-12','aprobado','Recepción conforme de insumos locales','2026-01-26 01:39:05','2026-01-26 01:39:05',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'ACT-2026-0003','2026-01-15','aprobado','Recepción conforme de equipos médicos','2026-01-26 01:39:05','2026-01-26 01:39:05',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'ACT-2026-0004','2026-01-18','aprobado','Recepción conforme','2026-01-26 01:39:05','2026-01-26 01:39:05',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'ACT-2026-0005','2026-01-20','aprobado','Recepción conforme de reactivos','2026-01-26 01:39:05','2026-01-26 01:39:05',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,NULL,NULL,'activa',NULL,'2026-02-13 08:08:55','2026-02-13 08:08:55',NULL,NULL,NULL,'2026-02-13','Guía de Remisión Remitente','134154',6,'Centro Médico Salud Total S.A.C.','Compra Local','Conteo por Muestreo','78',NULL,NULL,NULL),(7,NULL,NULL,'activa',NULL,'2026-02-13 09:34:59','2026-02-13 09:34:59',NULL,NULL,NULL,'2026-02-13','Factura','0000000',10,'casa','Importación','Conteo al 100%',NULL,NULL,NULL,NULL),(8,NULL,NULL,'activa',NULL,'2026-02-13 10:00:26','2026-02-13 10:00:26',NULL,NULL,NULL,'2026-02-13','DUA','0000000',10,'casa','Importación','Conteo al 100%',NULL,'juan','juan','juan');
/*!40000 ALTER TABLE `actas_recepcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actas_recepcion_detalles`
--

DROP TABLE IF EXISTS `actas_recepcion_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actas_recepcion_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `producto_codigo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fabricante` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lote_numero` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `um` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperatura_min` decimal(5,2) DEFAULT NULL,
  `temperatura_max` decimal(5,2) DEFAULT NULL,
  `cantidad_solicitada` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cantidad_recibida` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cantidad_bultos` decimal(12,2) DEFAULT '0.00',
  `cantidad_cajas` decimal(12,2) DEFAULT '0.00',
  `cantidad_por_caja` decimal(12,2) DEFAULT '0.00',
  `cantidad_fraccion` decimal(12,2) DEFAULT '0.00',
  `aspecto` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'EMB',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_actas_det_acta` (`acta_id`),
  KEY `idx_actas_det_producto` (`producto_id`),
  KEY `idx_actas_det_lote` (`lote_numero`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actas_recepcion_detalles`
--

LOCK TABLES `actas_recepcion_detalles` WRITE;
/*!40000 ALTER TABLE `actas_recepcion_detalles` DISABLE KEYS */;
INSERT INTO `actas_recepcion_detalles` VALUES (1,6,23,'1235146','13436','14523','22',NULL,'AMP',12.00,12.00,12.00,1798280.00,123.00,13420.00,134.00,0.00,'EMB',NULL,'2026-02-13 08:08:55'),(2,7,27,'panadol','panadol','panadol','panadol','2026-02-14','BLT',12.00,24.00,1440.00,1440.00,12.00,12.00,120.00,0.00,'EMB',NULL,'2026-02-13 09:34:59'),(3,8,27,'panadol','panadol','panadol','panadol','2026-02-14','BLT',12.00,24.00,1440.00,1440.00,12.00,12.00,120.00,0.00,'EMB',NULL,'2026-02-13 10:00:26');
/*!40000 ALTER TABLE `actas_recepcion_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ajustes`
--

DROP TABLE IF EXISTS `ajustes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ajustes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_ajuste` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `tipo_ajuste` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'aumento, disminucion',
  `cantidad` decimal(10,2) NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `responsable_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_ajuste` (`numero_ajuste`),
  KEY `lote_id` (`lote_id`),
  KEY `responsable_id` (`responsable_id`),
  KEY `idx_ajustes_producto` (`producto_id`),
  KEY `idx_ajustes_fecha` (`fecha`),
  CONSTRAINT `ajustes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `ajustes_ibfk_2` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`),
  CONSTRAINT `ajustes_ibfk_3` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ajustes`
--

LOCK TABLES `ajustes` WRITE;
/*!40000 ALTER TABLE `ajustes` DISABLE KEYS */;
INSERT INTO `ajustes` VALUES (1,'AJU-2026-0001','2026-01-14',1,1,'disminucion',5.00,'Producto dañado por mal almacenamiento',2,'2026-01-26 01:39:05'),(2,'AJU-2026-0002','2026-01-17',9,10,'disminucion',10.00,'Jeringas con empaque deteriorado',2,'2026-01-26 01:39:05'),(3,'AJU-2026-0003','2026-01-22',12,13,'aumento',20.00,'Corrección de conteo físico',3,'2026-01-26 01:39:05');
/*!40000 ALTER TABLE `ajustes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ajustes_stock`
--

DROP TABLE IF EXISTS `ajustes_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ajustes_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `tipo` enum('AJUSTE_POSITIVO','AJUSTE_NEGATIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `motivo` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ajustes_stock`
--

LOCK TABLES `ajustes_stock` WRITE;
/*!40000 ALTER TABLE `ajustes_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `ajustes_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertas_vencimiento`
--

DROP TABLE IF EXISTS `alertas_vencimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_vencimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lote_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'activa' COMMENT 'activa, vista, resuelta',
  `lote_numero` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias_faltantes` int DEFAULT NULL,
  `leida` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_vencimiento`
--

LOCK TABLES `alertas_vencimiento` WRITE;
/*!40000 ALTER TABLE `alertas_vencimiento` DISABLE KEYS */;
INSERT INTO `alertas_vencimiento` VALUES (1,1,1,'2027-06-15','VIGENTE','PAR-2025-001',487,0,'2026-02-08 03:28:49.446232','2026-02-13 04:39:41.000000'),(2,2,1,'2027-08-20','VIGENTE','PAR-2025-002',553,0,'2026-02-08 03:28:49.461812','2026-02-13 04:39:41.000000'),(3,3,2,'2027-07-10','VIGENTE','IBU-2025-101',512,0,'2026-02-08 03:28:49.472094','2026-02-13 04:39:41.000000'),(4,4,3,'2026-11-20','VIGENTE','AMO-2025-A01',280,0,'2026-02-08 03:28:49.480533','2026-02-13 04:39:41.000000'),(5,5,4,'2027-09-01','VIGENTE','OME-2025-X01',565,0,'2026-02-08 03:28:49.487036','2026-02-13 04:39:41.000000'),(6,6,5,'2027-08-15','VIGENTE','LOS-2025-M01',548,0,'2026-02-08 03:28:49.492535','2026-02-13 04:39:41.000000'),(7,7,6,'2027-10-01','VIGENTE','MET-2025-201',595,0,'2026-02-08 03:28:49.498119','2026-02-13 04:39:41.000000'),(8,8,7,'2027-07-25','VIGENTE','ATO-2025-I01',527,0,'2026-02-08 03:28:49.504599','2026-02-13 04:39:41.000000'),(9,9,8,'2027-09-10','VIGENTE','ENA-2025-F01',574,0,'2026-02-08 03:28:49.510518','2026-02-13 04:39:41.000000'),(10,10,9,'2028-11-01','VIGENTE','JER-2025-C001',992,0,'2026-02-08 03:28:49.517007','2026-02-13 04:39:41.000000'),(11,11,10,'2027-10-15','VIGENTE','GUA-2025-P01',609,0,'2026-02-08 03:28:49.523213','2026-02-13 04:39:41.000000'),(12,12,11,'2027-09-20','VIGENTE','GAS-2025-B01',584,0,'2026-02-08 03:28:49.528788','2026-02-13 04:39:41.000000'),(13,13,12,'2027-12-01','VIGENTE','ALC-2025-P01',656,0,'2026-02-08 03:28:49.534911','2026-02-13 04:39:41.000000'),(14,14,13,'2028-10-20','VIGENTE','MAS-2025-C01',980,0,'2026-02-08 03:28:49.540727','2026-02-13 04:39:41.000000'),(15,15,14,'2027-11-10','VIGENTE','CAT-2025-CO1',635,0,'2026-02-08 03:28:49.546081','2026-02-13 04:39:41.000000'),(16,16,15,'2027-10-05','VIGENTE','SON-2025-P01',599,0,'2026-02-08 03:28:49.552274','2026-02-13 04:39:41.000000'),(17,17,16,'2030-08-01','VIGENTE','TER-2025-C01',1630,0,'2026-02-08 03:28:49.556843','2026-02-13 04:39:41.000000'),(18,18,17,'2030-09-15','VIGENTE','TEN-2025-J01',1675,0,'2026-02-08 03:28:49.561564','2026-02-13 04:39:41.000000'),(19,19,18,'2030-10-10','VIGENTE','OXI-2025-C01',1700,0,'2026-02-08 03:28:49.568017','2026-02-13 04:39:41.000000'),(20,20,19,'2030-11-20','VIGENTE','NEB-2025-P01',1741,0,'2026-02-08 03:28:49.573290','2026-02-13 04:39:41.000000'),(21,21,20,'2026-06-15','VIGENTE','COV-2025-A01',122,0,'2026-02-08 03:28:49.579096','2026-02-13 04:39:41.000000'),(22,22,21,'2027-11-25','VIGENTE','GLU-2025-U01',650,0,'2026-02-08 03:28:49.585280','2026-02-13 04:39:41.000000'),(23,23,22,'2027-10-30','VIGENTE','HEM-2025-S01',624,0,'2026-02-08 03:28:49.590470','2026-02-13 04:39:41.000000'),(24,24,22,'0101-03-12','VENCIDO','754',-703065,0,'2026-02-08 05:14:12.535603','2026-02-13 04:39:41.000000'),(25,25,1,'2026-02-12','VENCIDO','15566',-1,0,'2026-02-08 05:26:33.233283','2026-02-13 04:39:41.000000'),(26,26,3,'2026-02-11','VENCIDO','1235',-2,0,'2026-02-09 05:25:12.429771','2026-02-13 04:39:41.000000'),(27,27,3,'2026-02-18','PROXIMO_A_VENCER','6579',5,0,'2026-02-09 15:21:07.900283','2026-02-13 04:39:41.000000'),(28,28,7,'2026-02-12','VENCIDO','123',-1,0,'2026-02-09 15:52:24.842975','2026-02-13 04:39:41.000000'),(29,29,7,'2026-02-10','VENCIDO','hjg',-3,0,'2026-02-09 16:00:53.721910','2026-02-13 04:39:41.000000'),(30,30,12,'2026-02-13','PROXIMO_A_VENCER','66',0,0,'2026-02-11 05:32:37.384648','2026-02-13 04:39:41.000000'),(31,31,1,'2026-12-31','VIGENTE','TEST001',321,0,'2026-02-13 06:56:03.901965','2026-02-13 06:56:03.901965'),(32,31,1,'2026-12-31','VIGENTE','TEST001',321,0,'2026-02-13 06:56:03.906590','2026-02-13 06:56:03.906590'),(33,32,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 06:56:03.920681','2026-02-13 06:56:03.920681'),(34,32,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 06:56:03.923585','2026-02-13 06:56:03.923585'),(35,33,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 06:56:03.935694','2026-02-13 06:56:03.935694'),(36,33,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 06:56:03.936086','2026-02-13 06:56:03.936086'),(37,34,1,'2026-02-12','VENCIDO','15566',-1,0,'2026-02-13 06:56:03.944753','2026-02-13 06:56:03.944753'),(38,34,1,'2026-02-12','VENCIDO','15566',-1,0,'2026-02-13 06:56:03.945457','2026-02-13 06:56:03.945457'),(39,35,27,'2026-02-14','PROXIMO_A_VENCER','panadol',1,0,'2026-02-13 09:36:45.457235','2026-02-13 09:36:45.457235'),(40,35,27,'2026-02-14','PROXIMO_A_VENCER','panadol',1,0,'2026-02-13 09:36:45.458236','2026-02-13 09:36:45.458236'),(41,36,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 10:17:01.829497','2026-02-13 10:17:01.829497'),(42,36,26,'2026-02-14','PROXIMO_A_VENCER','0000000test',1,0,'2026-02-13 10:17:01.839936','2026-02-13 10:17:01.839936');
/*!40000 ALTER TABLE `alertas_vencimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'create, update, delete, login, export',
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'productos, ingresos, salidas, kardex',
  `registro_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auditoria_usuario` (`usuario_id`),
  KEY `idx_auditoria_fecha` (`created_at`),
  KEY `idx_auditoria_modulo` (`modulo`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (1,2,'create','ingresos',1,NULL,NULL,'192.168.1.100','Mozilla/5.0','2026-01-26 01:39:05'),(2,2,'create','ingresos',2,NULL,NULL,'192.168.1.100','Mozilla/5.0','2026-01-26 01:39:05'),(3,3,'create','ingresos',3,NULL,NULL,'192.168.1.101','Mozilla/5.0','2026-01-26 01:39:05'),(4,2,'create','salidas',1,NULL,NULL,'192.168.1.100','Mozilla/5.0','2026-01-26 01:39:05'),(5,2,'create','salidas',2,NULL,NULL,'192.168.1.100','Mozilla/5.0','2026-01-26 01:39:05'),(6,3,'create','salidas',3,NULL,NULL,'192.168.1.101','Mozilla/5.0','2026-01-26 01:39:05'),(7,1,'login','usuarios',1,NULL,NULL,'192.168.1.50','Mozilla/5.0','2026-01-26 01:39:05'),(8,2,'login','usuarios',2,NULL,NULL,'192.168.1.100','Mozilla/5.0','2026-01-26 01:39:05'),(9,3,'login','usuarios',3,NULL,NULL,'192.168.1.101','Mozilla/5.0','2026-01-26 01:39:05');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditorias`
--

DROP TABLE IF EXISTS `auditorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registro_id` int DEFAULT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditorias`
--

LOCK TABLES `auditorias` WRITE;
/*!40000 ALTER TABLE `auditorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_ingreso`
--

DROP TABLE IF EXISTS `categorias_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_ingreso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Importación, Compra local, Traslado, Devolución',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_ingreso`
--

LOCK TABLES `categorias_ingreso` WRITE;
/*!40000 ALTER TABLE `categorias_ingreso` DISABLE KEYS */;
INSERT INTO `categorias_ingreso` VALUES (1,'Importación','Productos importados del extranjero',1),(2,'Compra Local','Productos adquiridos localmente',1),(3,'Traslado','Productos trasladados de otros almacenes',1),(4,'Devolución','Productos devueltos por clientes',1);
/*!40000 ALTER TABLE `categorias_ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `distrito` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_riesgo` enum('Bajo','Alto','No verificado') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo','Potencial','Blokeado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cuit` varchar(13) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'CLI-001','Hospital Nacional de Lima S.A.','014561234','compras@hosplima.gob.pe','Av. Grau 100, Lima',NULL,NULL,NULL,NULL,'Activo',1,'2026-01-26 01:39:04','2026-01-26 01:39:04',NULL),(2,'CLI-002','Clínica San Gabriel S.A.C.','014562345','logistica@sangabriel.com','Jr. Libertad 234, Lima',NULL,NULL,NULL,NULL,'Activo',1,'2026-01-26 01:39:04','2026-01-26 01:39:04',NULL),(3,'CLI-003','Centro de Salud del Norte E.I.R.L.','014563456','almacen@csnorte.gob.pe','Av. Túpac Amaru 567, Lima',NULL,NULL,NULL,NULL,'Activo',0,'2026-01-26 01:39:04','2026-02-09 04:05:41',NULL),(4,'CLI-004','Hospital Regional de Arequipa','054234567','compras@hosparequipa.gob.pe','Av. Goyeneche 890, Arequipa',NULL,NULL,NULL,NULL,'Activo',1,'2026-01-26 01:39:04','2026-01-26 01:39:04',NULL),(5,'CLI-005','Clínica Santa María S.A.','014564567','adquisiciones@santamaria.com','Av. El Golf 123, Lima',NULL,NULL,NULL,NULL,'Activo',1,'2026-01-26 01:39:04','2026-01-26 01:39:04',NULL),(6,'CLI-006','Centro Médico Salud Total S.A.C.','014565678','logistica@saludtotal.com','Jr. Las Palmeras 456, Lima',NULL,NULL,NULL,NULL,'Activo',0,'2026-01-26 01:39:04','2026-02-09 04:06:47',NULL),(7,'CLI-007','Posta Médica San Juan E.I.R.L.','014566789','compras@postasj.gob.pe','Calle Lima 789, Callao',NULL,NULL,NULL,NULL,'Activo',1,'2026-01-26 01:39:04','2026-01-26 01:39:04',NULL),(8,'10604546732','chiru','987654321','rafael@gmail.com','avc123','lima','lima','lima','Alto','Inactivo',1,'2026-02-09 04:29:13','2026-02-09 04:29:13','10604546732'),(9,'10604546731','rafaelchuco','987654321','choa1@gmail.com','casa','casa','casa','casa','Bajo','Blokeado',1,'2026-02-13 06:01:55','2026-02-13 06:01:55','10604546731'),(10,'10604546734','casa','123456789','das@gmail.com','casa','casa','casa','casa','Bajo','Activo',1,'2026-02-13 06:03:17','2026-02-13 06:03:17','10604546734');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'number, string, boolean, json',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `configuracion_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'dias_alerta_vencimiento_critica','7','number','Días para alerta crítica de vencimiento','2026-01-26 01:37:48',NULL),(2,'dias_alerta_vencimiento_alta','15','number','Días para alerta alta de vencimiento','2026-01-26 01:37:48',NULL),(3,'dias_alerta_vencimiento_media','30','number','Días para alerta media de vencimiento','2026-01-26 01:37:48',NULL),(4,'ejecutar_alertas_automaticas','true','boolean','Activar generación automática de alertas','2026-01-26 01:37:48',NULL),(5,'formato_numero_ingreso','ING-{YEAR}-{NUM:4}','string','Formato para número de ingreso','2026-01-26 01:37:48',NULL),(6,'formato_numero_salida','SAL-{YEAR}-{NUM:4}','string','Formato para número de salida','2026-01-26 01:37:48',NULL),(7,'formato_numero_acta','ACT-{YEAR}-{NUM:4}','string','Formato para número de acta','2026-01-26 01:37:48',NULL),(8,'formato_numero_ajuste','AJU-{YEAR}-{NUM:4}','string','Formato para número de ajuste','2026-01-26 01:37:48',NULL);
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_acta`
--

DROP TABLE IF EXISTS `detalle_acta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_acta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `cantidad_esperada` decimal(10,2) DEFAULT NULL COMMENT 'De la nota de ingreso',
  `cantidad_recibida` decimal(10,2) NOT NULL,
  `estado_producto` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'conforme' COMMENT 'conforme, observado, rechazado',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lote_id` (`lote_id`),
  KEY `idx_detalle_acta_acta` (`acta_id`),
  KEY `idx_detalle_acta_producto` (`producto_id`),
  CONSTRAINT `detalle_acta_ibfk_1` FOREIGN KEY (`acta_id`) REFERENCES `actas_recepcion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_acta_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `detalle_acta_ibfk_3` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_acta`
--

LOCK TABLES `detalle_acta` WRITE;
/*!40000 ALTER TABLE `detalle_acta` DISABLE KEYS */;
INSERT INTO `detalle_acta` VALUES (1,1,1,1,150.00,150.00,'conforme',NULL,'2026-01-26 01:39:05'),(2,1,1,2,100.00,100.00,'conforme',NULL,'2026-01-26 01:39:05'),(3,1,5,6,80.00,80.00,'conforme',NULL,'2026-01-26 01:39:05'),(4,1,7,8,60.00,60.00,'conforme',NULL,'2026-01-26 01:39:05'),(5,2,2,3,100.00,100.00,'conforme',NULL,'2026-01-26 01:39:05'),(6,2,4,5,90.00,90.00,'conforme',NULL,'2026-01-26 01:39:05'),(7,2,6,7,120.00,120.00,'conforme',NULL,'2026-01-26 01:39:05'),(8,2,8,9,85.00,85.00,'conforme',NULL,'2026-01-26 01:39:05'),(9,2,10,11,200.00,200.00,'conforme',NULL,'2026-01-26 01:39:05'),(10,2,12,13,300.00,300.00,'conforme',NULL,'2026-01-26 01:39:05'),(11,3,9,10,250.00,250.00,'conforme',NULL,'2026-01-26 01:39:05'),(12,3,13,14,400.00,400.00,'conforme',NULL,'2026-01-26 01:39:05'),(13,3,16,17,35.00,35.00,'conforme',NULL,'2026-01-26 01:39:05'),(14,3,17,18,25.00,25.00,'conforme',NULL,'2026-01-26 01:39:05'),(15,3,18,19,50.00,50.00,'conforme',NULL,'2026-01-26 01:39:05'),(16,4,3,4,95.00,95.00,'conforme',NULL,'2026-01-26 01:39:05'),(17,4,11,12,150.00,150.00,'conforme',NULL,'2026-01-26 01:39:05'),(18,4,14,15,100.00,100.00,'conforme',NULL,'2026-01-26 01:39:05'),(19,4,15,16,60.00,60.00,'conforme',NULL,'2026-01-26 01:39:05'),(20,5,19,20,18.00,18.00,'conforme',NULL,'2026-01-26 01:39:05'),(21,5,20,21,120.00,120.00,'conforme',NULL,'2026-01-26 01:39:05'),(22,5,21,22,140.00,140.00,'conforme',NULL,'2026-01-26 01:39:05'),(23,5,22,23,75.00,75.00,'conforme',NULL,'2026-01-26 01:39:05');
/*!40000 ALTER TABLE `detalle_acta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ingreso`
--

DROP TABLE IF EXISTS `detalle_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ingreso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingreso_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lote_id` (`lote_id`),
  KEY `idx_detalle_ingreso_ingreso` (`ingreso_id`),
  KEY `idx_detalle_ingreso_producto` (`producto_id`),
  CONSTRAINT `detalle_ingreso_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_ingreso_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `detalle_ingreso_ibfk_3` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ingreso`
--

LOCK TABLES `detalle_ingreso` WRITE;
/*!40000 ALTER TABLE `detalle_ingreso` DISABLE KEYS */;
INSERT INTO `detalle_ingreso` VALUES (1,1,1,1,150.00,12.50,1875.00,'2026-01-26 01:39:05'),(2,1,1,2,100.00,12.50,1250.00,'2026-01-26 01:39:05'),(3,1,5,6,80.00,18.75,1500.00,'2026-01-26 01:39:05'),(4,1,7,8,60.00,25.30,1518.00,'2026-01-26 01:39:05'),(5,2,2,3,100.00,8.50,850.00,'2026-01-26 01:39:05'),(6,2,4,5,90.00,15.20,1368.00,'2026-01-26 01:39:05'),(7,2,6,7,120.00,10.80,1296.00,'2026-01-26 01:39:05'),(8,2,8,9,85.00,14.50,1232.50,'2026-01-26 01:39:05'),(9,2,10,11,200.00,22.00,4400.00,'2026-01-26 01:39:05'),(10,2,12,13,300.00,8.50,2550.00,'2026-01-26 01:39:05'),(11,3,9,10,250.00,15.00,3750.00,'2026-01-26 01:39:05'),(12,3,13,14,400.00,5.50,2200.00,'2026-01-26 01:39:05'),(13,3,16,17,35.00,45.00,1575.00,'2026-01-26 01:39:05'),(14,3,17,18,25.00,120.00,3000.00,'2026-01-26 01:39:05'),(15,3,18,19,50.00,85.00,4250.00,'2026-01-26 01:39:05'),(16,4,3,4,95.00,22.50,2137.50,'2026-01-26 01:39:05'),(17,4,11,12,150.00,18.00,2700.00,'2026-01-26 01:39:05'),(18,4,14,15,100.00,12.50,1250.00,'2026-01-26 01:39:05'),(19,4,15,16,60.00,28.00,1680.00,'2026-01-26 01:39:05'),(20,5,19,20,18.00,180.00,3240.00,'2026-01-26 01:39:05'),(21,5,20,21,120.00,35.00,4200.00,'2026-01-26 01:39:05'),(22,5,21,22,140.00,28.50,3990.00,'2026-01-26 01:39:05'),(23,5,22,23,75.00,42.00,3150.00,'2026-01-26 01:39:05');
/*!40000 ALTER TABLE `detalle_ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_salida`
--

DROP TABLE IF EXISTS `detalle_salida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_salida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `salida_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lote_id` (`lote_id`),
  KEY `idx_detalle_salida_salida` (`salida_id`),
  KEY `idx_detalle_salida_producto` (`producto_id`),
  CONSTRAINT `detalle_salida_ibfk_1` FOREIGN KEY (`salida_id`) REFERENCES `salidas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_salida_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `detalle_salida_ibfk_3` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_salida`
--

LOCK TABLES `detalle_salida` WRITE;
/*!40000 ALTER TABLE `detalle_salida` DISABLE KEYS */;
INSERT INTO `detalle_salida` VALUES (1,1,1,1,50.00,15.00,750.00,'2026-01-26 01:39:05'),(2,1,2,3,30.00,10.50,315.00,'2026-01-26 01:39:05'),(3,1,9,10,80.00,18.00,1440.00,'2026-01-26 01:39:05'),(4,1,10,11,60.00,26.00,1560.00,'2026-01-26 01:39:05'),(5,2,3,4,25.00,27.00,675.00,'2026-01-26 01:39:05'),(6,2,4,5,30.00,18.50,555.00,'2026-01-26 01:39:05'),(7,2,11,12,40.00,22.00,880.00,'2026-01-26 01:39:05'),(8,2,13,14,100.00,7.00,700.00,'2026-01-26 01:39:05'),(9,3,5,6,20.00,22.50,450.00,'2026-01-26 01:39:05'),(10,3,6,7,35.00,13.50,472.50,'2026-01-26 01:39:05'),(11,3,12,13,80.00,10.50,840.00,'2026-01-26 01:39:05'),(12,3,16,17,10.00,55.00,550.00,'2026-01-26 01:39:05'),(13,4,7,8,15.00,30.50,457.50,'2026-01-26 01:39:05'),(14,4,8,9,25.00,17.50,437.50,'2026-01-26 01:39:05'),(15,4,14,15,30.00,15.00,450.00,'2026-01-26 01:39:05'),(16,4,17,18,5.00,145.00,725.00,'2026-01-26 01:39:05'),(17,5,18,19,15.00,102.00,1530.00,'2026-01-26 01:39:05'),(18,5,20,21,40.00,42.00,1680.00,'2026-01-26 01:39:05'),(19,5,21,22,50.00,34.00,1700.00,'2026-01-26 01:39:05'),(20,5,22,23,20.00,50.00,1000.00,'2026-01-26 01:39:05');
/*!40000 ALTER TABLE `detalle_salida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `importaciones`
--

DROP TABLE IF EXISTS `importaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `importaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ingreso, acta',
  `archivo_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_ruta` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registros_totales` int DEFAULT NULL,
  `registros_exitosos` int DEFAULT NULL,
  `registros_errores` int DEFAULT NULL,
  `errores` json DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'procesado' COMMENT 'procesado, error',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_importaciones_usuario` (`usuario_id`),
  KEY `idx_importaciones_tipo` (`tipo_documento`),
  CONSTRAINT `importaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `importaciones`
--

LOCK TABLES `importaciones` WRITE;
/*!40000 ALTER TABLE `importaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `importaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingresos`
--

DROP TABLE IF EXISTS `ingresos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_ingreso` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `proveedor_id` int DEFAULT NULL,
  `responsable_id` int NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'registrado' COMMENT 'registrado, aprobado, anulado',
  `archivo_importacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_ingreso` (`numero_ingreso`),
  KEY `responsable_id` (`responsable_id`),
  KEY `idx_ingresos_fecha` (`fecha`),
  KEY `idx_ingresos_numero` (`numero_ingreso`),
  KEY `idx_ingresos_proveedor` (`proveedor_id`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `ingresos_ibfk_2` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos`
--

LOCK TABLES `ingresos` WRITE;
/*!40000 ALTER TABLE `ingresos` DISABLE KEYS */;
INSERT INTO `ingresos` VALUES (1,'ING-2026-0001','2026-01-10',3,2,'Importación de medicamentos de India y México','aprobado',NULL,'2026-01-26 01:39:05','2026-01-26 01:39:05'),(2,'ING-2026-0002','2026-01-12',2,2,'Compra local de insumos médicos','aprobado',NULL,'2026-01-26 01:39:05','2026-01-26 01:39:05'),(3,'ING-2026-0003','2026-01-15',6,2,'Equipos médicos importados de China y Japón','aprobado',NULL,'2026-01-26 01:39:05','2026-01-26 01:39:05'),(4,'ING-2026-0004','2026-01-18',5,3,'Compra de medicamentos locales','aprobado',NULL,'2026-01-26 01:39:05','2026-01-26 01:39:05'),(5,'ING-2026-0005','2026-01-20',1,2,'Reactivos importados para laboratorio','aprobado',NULL,'2026-01-26 01:39:05','2026-01-26 01:39:05');
/*!40000 ALTER TABLE `ingresos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kardex`
--

DROP TABLE IF EXISTS `kardex`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kardex` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `tipo_movimiento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ingreso, salida, ajuste',
  `documento_tipo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'nota_ingreso, nota_salida, acta, ajuste',
  `saldo` decimal(10,2) NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lote_numero` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `documento_numero` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kardex`
--

LOCK TABLES `kardex` WRITE;
/*!40000 ALTER TABLE `kardex` DISABLE KEYS */;
INSERT INTO `kardex` VALUES (1,1,'ingreso','nota_ingreso',150.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(2,1,'ingreso','nota_ingreso',250.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(3,5,'ingreso','nota_ingreso',80.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(4,7,'ingreso','nota_ingreso',60.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(5,2,'ingreso','nota_ingreso',100.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(6,4,'ingreso','nota_ingreso',90.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(7,6,'ingreso','nota_ingreso',120.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(8,8,'ingreso','nota_ingreso',85.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(9,10,'ingreso','nota_ingreso',200.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(10,12,'ingreso','nota_ingreso',300.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(11,9,'ingreso','nota_ingreso',250.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(12,13,'ingreso','nota_ingreso',400.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(13,16,'ingreso','nota_ingreso',35.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(14,17,'ingreso','nota_ingreso',25.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(15,18,'ingreso','nota_ingreso',50.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(16,3,'ingreso','nota_ingreso',95.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(17,11,'ingreso','nota_ingreso',150.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(18,14,'ingreso','nota_ingreso',100.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(19,15,'ingreso','nota_ingreso',60.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(20,19,'ingreso','nota_ingreso',18.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(21,20,'ingreso','nota_ingreso',120.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(22,21,'ingreso','nota_ingreso',140.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(23,22,'ingreso','nota_ingreso',75.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(32,1,'salida','nota_salida',-50.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(33,2,'salida','nota_salida',-30.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(34,9,'salida','nota_salida',-80.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(35,10,'salida','nota_salida',-60.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(36,3,'salida','nota_salida',-25.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(37,4,'salida','nota_salida',-30.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(38,11,'salida','nota_salida',-40.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(39,13,'salida','nota_salida',-100.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(40,5,'salida','nota_salida',-20.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(41,6,'salida','nota_salida',-35.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(42,12,'salida','nota_salida',-80.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(43,16,'salida','nota_salida',-10.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(44,7,'salida','nota_salida',-15.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(45,8,'salida','nota_salida',-25.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(46,14,'salida','nota_salida',-30.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(47,17,'salida','nota_salida',-5.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(48,18,'salida','nota_salida',-15.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(49,20,'salida','nota_salida',-40.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(50,21,'salida','nota_salida',-50.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(51,22,'salida','nota_salida',-20.00,NULL,'2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(63,1,'ajuste','ajuste',-5.00,'Producto dañado por mal almacenamiento','2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(64,9,'ajuste','ajuste',-10.00,'Jeringas con empaque deteriorado','2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(65,12,'ajuste','ajuste',20.00,'Corrección de conteo físico','2026-01-26 01:39:46',NULL,0.00,NULL,NULL),(66,22,'INGRESO','NOTA_INGRESO',69.00,NULL,'2026-02-08 05:11:47','754',14.00,'00000001',1),(67,1,'INGRESO','NOTA_INGRESO',206.00,NULL,'2026-02-08 05:18:11','15566',11.00,'00000002',3),(68,3,'INGRESO','NOTA_INGRESO',1558.00,NULL,'2026-02-09 05:24:25','1235',1488.00,'00000003',4),(69,3,'INGRESO','NOTA_INGRESO',1739.00,NULL,'2026-02-09 15:19:45','6579',181.00,'00000004',5),(70,7,'INGRESO','NOTA_INGRESO',48.00,NULL,'2026-02-09 15:35:13','123',3.00,'00000005',6),(71,7,'INGRESO','NOTA_INGRESO',49.00,NULL,'2026-02-09 15:53:13','hjg',1.00,'00000006',7),(72,12,'INGRESO','NOTA_INGRESO',282.00,NULL,'2026-02-11 05:12:55','66',42.00,'00000007',8),(73,4,'SALIDA','NOTA_SALIDA',48.00,NULL,'2026-02-12 04:46:03',NULL,12.00,'00000001',1),(74,8,'SALIDA','NOTA_SALIDA',38.00,NULL,'2026-02-12 04:49:10',NULL,22.00,'00000002',2),(75,24,'SALIDA','NOTA_SALIDA',2423.00,NULL,'2026-02-12 04:51:29',NULL,12.00,'00000003',3),(76,24,'SALIDA','NOTA_SALIDA',2419.00,NULL,'2026-02-12 04:54:28',NULL,4.00,'00000004',4),(77,1,'INGRESO','NOTA_INGRESO',216.00,NULL,'2026-02-13 06:53:02','TEST001',10.00,'00000008',9),(78,26,'INGRESO','NOTA_INGRESO',244.00,NULL,'2026-02-13 06:53:19','0000000test',144.00,'00000009',10),(79,26,'INGRESO','NOTA_INGRESO',388.00,NULL,'2026-02-13 06:55:00','0000000test',144.00,'00000010',11),(80,1,'INGRESO','NOTA_INGRESO',360.00,NULL,'2026-02-13 06:55:00','15566',144.00,'00000010',11),(81,26,'SALIDA','NOTA_SALIDA',244.00,NULL,'2026-02-13 07:08:22','0000000test',144.00,'00000005',6),(82,26,'SALIDA','NOTA_SALIDA',100.00,NULL,'2026-02-13 07:08:22','0000000test',144.00,'00000005',6),(83,27,'INGRESO','NOTA_INGRESO',1540.00,NULL,'2026-02-13 09:33:15','panadol',1440.00,'00000011',12),(84,26,'INGRESO','NOTA_INGRESO',244.00,NULL,'2026-02-13 10:13:02','0000000test',144.00,'00000012',13);
/*!40000 ALTER TABLE `kardex` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cantidad_ingresada` decimal(10,2) NOT NULL,
  `cantidad_disponible` decimal(10,2) NOT NULL,
  `nota_ingreso_id` int DEFAULT NULL,
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,1,'PAR-2025-001','2027-06-15','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(2,1,'PAR-2025-002','2027-08-20','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(3,2,'IBU-2025-101','2027-07-10','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(4,3,'AMO-2025-A01','2026-11-20','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(5,4,'OME-2025-X01','2027-09-01','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(6,5,'LOS-2025-M01','2027-08-15','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(7,6,'MET-2025-201','2027-10-01','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(8,7,'ATO-2025-I01','2027-07-25','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(9,8,'ENA-2025-F01','2027-09-10','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(10,9,'JER-2025-C001','2028-11-01','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(11,10,'GUA-2025-P01','2027-10-15','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(12,11,'GAS-2025-B01','2027-09-20','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(13,12,'ALC-2025-P01','2027-12-01','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(14,13,'MAS-2025-C01','2028-10-20','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(15,14,'CAT-2025-CO1','2027-11-10','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(16,15,'SON-2025-P01','2027-10-05','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(17,16,'TER-2025-C01','2030-08-01','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(18,17,'TEN-2025-J01','2030-09-15','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(19,18,'OXI-2025-C01','2030-10-10','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(20,19,'NEB-2025-P01','2030-11-20','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(21,20,'COV-2025-A01','2026-06-15','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(22,21,'GLU-2025-U01','2027-11-25','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(23,22,'HEM-2025-S01','2027-10-30','2026-01-26 01:39:05',0.00,0.00,NULL,'2026-02-08 03:22:58.249116'),(24,22,'754','0101-03-12','2026-02-08 05:11:47',14.00,14.00,1,'2026-02-08 05:11:47.739744'),(25,1,'15566','2026-02-12','2026-02-08 05:18:11',11.00,11.00,3,'2026-02-08 05:18:11.773848'),(26,3,'1235','2026-02-11','2026-02-09 05:24:25',1488.00,1488.00,4,'2026-02-09 05:24:25.789825'),(27,3,'6579','2026-02-18','2026-02-09 15:19:45',181.00,181.00,5,'2026-02-09 15:19:45.747656'),(28,7,'123','2026-02-12','2026-02-09 15:35:13',3.00,3.00,6,'2026-02-09 15:35:13.498852'),(29,7,'hjg','2026-02-10','2026-02-09 15:53:13',1.00,1.00,7,'2026-02-09 15:53:13.173990'),(30,12,'66','2026-02-13','2026-02-11 05:12:55',42.00,42.00,8,'2026-02-11 05:12:55.038883'),(31,1,'TEST001','2026-12-31','2026-02-13 06:53:02',10.00,10.00,9,'2026-02-13 06:53:02.434777'),(32,26,'0000000test','2026-02-14','2026-02-13 06:53:19',144.00,0.00,10,'2026-02-13 07:08:21.000000'),(33,26,'0000000test','2026-02-14','2026-02-13 06:55:00',144.00,0.00,11,'2026-02-13 07:08:22.000000'),(34,1,'15566','2026-02-12','2026-02-13 06:55:00',144.00,144.00,11,'2026-02-13 06:55:00.779025'),(35,27,'panadol','2026-02-14','2026-02-13 09:33:15',1440.00,1440.00,12,'2026-02-13 09:33:15.657393'),(36,26,'0000000test','2026-02-14','2026-02-13 10:13:02',144.00,144.00,13,'2026-02-13 10:13:02.474818');
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nota_ingreso_detalles`
--

DROP TABLE IF EXISTS `nota_ingreso_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nota_ingreso_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nota_ingreso_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_numero` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `um` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fabricante` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperatura_min_c` decimal(5,2) DEFAULT NULL,
  `temperatura_max_c` decimal(5,2) DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `cantidad_bultos` decimal(10,2) DEFAULT '0.00',
  `cantidad_cajas` decimal(10,2) DEFAULT '0.00',
  `cantidad_por_caja` decimal(10,2) DEFAULT '0.00',
  `cantidad_fraccion` decimal(10,2) DEFAULT '0.00',
  `cantidad_total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nota_ingreso_detalles`
--

LOCK TABLES `nota_ingreso_detalles` WRITE;
/*!40000 ALTER TABLE `nota_ingreso_detalles` DISABLE KEYS */;
INSERT INTO `nota_ingreso_detalles` VALUES (1,1,22,'754','0101-03-12',NULL,NULL,NULL,NULL,14.00,0.00,0.00,0.00,0.00,0.00,14.00,'2026-02-08 05:11:47.732450'),(2,3,1,'15566','2026-02-12',NULL,NULL,NULL,NULL,11.00,0.00,0.00,0.00,0.00,0.00,11.00,'2026-02-08 05:18:11.770753'),(3,4,3,'1235','2026-02-11',NULL,NULL,NULL,NULL,1488.00,0.00,0.00,0.00,0.00,0.00,1488.00,'2026-02-09 05:24:25.786728'),(4,5,3,'6579','2026-02-18',NULL,NULL,NULL,NULL,181.00,0.00,0.00,0.00,0.00,0.00,181.00,'2026-02-09 15:19:45.743842'),(5,6,7,'123','2026-02-12',NULL,NULL,NULL,NULL,3.00,0.00,0.00,0.00,0.00,0.00,3.00,'2026-02-09 15:35:13.496650'),(6,7,7,'hjg','2026-02-10',NULL,NULL,NULL,NULL,1.00,0.00,0.00,0.00,0.00,0.00,1.00,'2026-02-09 15:53:13.172801'),(7,8,12,'66','2026-02-13',NULL,NULL,NULL,NULL,42.00,0.00,0.00,0.00,0.00,0.00,42.00,'2026-02-11 05:12:55.036842'),(8,9,1,'TEST001','2026-12-31',NULL,NULL,NULL,NULL,10.00,0.00,0.00,0.00,0.00,0.00,10.00,'2026-02-13 06:53:02.430963'),(9,10,26,'0000000test','2026-02-14',NULL,NULL,NULL,NULL,144.00,0.00,12.00,12.00,12.00,0.00,144.00,'2026-02-13 06:53:19.858339'),(10,11,26,'0000000test','2026-02-14',NULL,NULL,NULL,NULL,144.00,0.00,12.00,12.00,12.00,0.00,144.00,'2026-02-13 06:55:00.769840'),(11,11,1,'15566','2026-02-12',NULL,NULL,NULL,NULL,144.00,0.00,12.00,12.00,12.00,0.00,144.00,'2026-02-13 06:55:00.778098'),(12,12,27,'panadol','2026-02-14','BLT','panadol',12.00,24.00,1440.00,0.00,12.00,12.00,120.00,0.00,1440.00,'2026-02-13 09:33:15.650997'),(13,13,26,'0000000test','2026-02-14','AMP','0000000',10.00,20.00,144.00,0.00,12.00,12.00,12.00,0.00,144.00,'2026-02-13 10:13:02.473620');
/*!40000 ALTER TABLE `nota_ingreso_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nota_salida_detalles`
--

DROP TABLE IF EXISTS `nota_salida_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nota_salida_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nota_salida_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nota_salida_detalles`
--

LOCK TABLES `nota_salida_detalles` WRITE;
/*!40000 ALTER TABLE `nota_salida_detalles` DISABLE KEYS */;
INSERT INTO `nota_salida_detalles` VALUES (1,1,4,NULL,12.00,NULL,'2026-02-12 04:46:03.822782'),(2,2,8,NULL,22.00,NULL,'2026-02-12 04:49:10.408888'),(3,3,24,NULL,12.00,NULL,'2026-02-12 04:51:29.562945'),(4,4,24,NULL,4.00,NULL,'2026-02-12 04:54:28.911612'),(5,6,26,32,144.00,NULL,'2026-02-13 07:08:21.838468'),(6,6,26,33,144.00,NULL,'2026-02-13 07:08:22.023537');
/*!40000 ALTER TABLE `nota_salida_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_ingreso`
--

DROP TABLE IF EXISTS `notas_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_ingreso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_ingreso` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `proveedor` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` enum('Factura','Invoice','Boleta de Venta','Guía de Remisión Remitente','Guía de Remisión Transportista','Orden de Compra') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_id` int DEFAULT NULL,
  `estado` enum('REGISTRADA','PARCIALMENTE_RECIBIDA','RECIBIDA_CONFORME','RECIBIDA_OBSERVADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REGISTRADA',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8aeeb30872cc88ce1bbeb06c60` (`numero_ingreso`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_ingreso`
--

LOCK TABLES `notas_ingreso` WRITE;
/*!40000 ALTER TABLE `notas_ingreso` DISABLE KEYS */;
INSERT INTO `notas_ingreso` VALUES (1,'00000001','2026-02-08','Centro de Salud del Norte E.I.R.L.',NULL,NULL,1,'REGISTRADA','Documento: 123413','2026-02-08 05:11:47.724072','2026-02-08 05:11:47.724072'),(3,'00000002','2026-02-08','Centro de Salud del Norte E.I.R.L.',NULL,NULL,1,'REGISTRADA',NULL,'2026-02-08 05:18:11.765262','2026-02-08 05:18:11.765262'),(4,'00000003','2026-02-09','Clínica San Gabriel S.A.C.','Invoice',NULL,1,'REGISTRADA',NULL,'2026-02-09 05:24:25.782322','2026-02-09 05:24:25.782322'),(5,'00000004','2026-02-09','Centro Médico Salud Total S.A.C.','Invoice','kl',1,'REGISTRADA',NULL,'2026-02-09 15:19:45.736920','2026-02-09 15:19:45.736920'),(6,'00000005','2026-02-09','Centro Médico Salud Total S.A.C.','Invoice','1234',1,'REGISTRADA',NULL,'2026-02-09 15:35:13.490655','2026-02-09 15:35:13.490655'),(7,'00000006','2026-02-09','Clínica San Gabriel S.A.C.','Invoice',NULL,1,'REGISTRADA',NULL,'2026-02-09 15:53:13.170820','2026-02-09 15:53:13.170820'),(8,'00000007','2026-02-11','chiru','Invoice',NULL,1,'REGISTRADA',NULL,'2026-02-11 05:12:55.030487','2026-02-11 05:12:55.030487'),(9,'00000008','2026-02-13','Test Proveedor',NULL,NULL,NULL,'REGISTRADA',NULL,'2026-02-13 06:53:02.413373','2026-02-13 06:53:02.413373'),(10,'00000009','2026-02-13','casa','Factura','0000000',1,'REGISTRADA',NULL,'2026-02-13 06:53:19.855541','2026-02-13 06:53:19.855541'),(11,'00000010','2026-02-13','Centro de Salud del Norte E.I.R.L.','Factura','0000000',1,'REGISTRADA',NULL,'2026-02-13 06:55:00.761212','2026-02-13 06:55:00.761212'),(12,'00000011','2026-02-13','casa','Factura','0000000',1,'REGISTRADA',NULL,'2026-02-13 09:33:15.643975','2026-02-13 09:33:15.643975'),(13,'00000012','2026-02-13','casa','Invoice','123456',1,'REGISTRADA',NULL,'2026-02-13 10:13:02.470201','2026-02-13 10:13:02.470201');
/*!40000 ALTER TABLE `notas_ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_salida`
--

DROP TABLE IF EXISTS `notas_salida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_salida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_salida` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `fecha` date NOT NULL,
  `responsable_id` int DEFAULT NULL,
  `estado` enum('REGISTRADA','DESPACHO_PENDIENTE','DESPACHADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REGISTRADA',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `tipo_documento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `motivo_salida` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f7b652075674c43fd62b554fbf` (`numero_salida`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_salida`
--

LOCK TABLES `notas_salida` WRITE;
/*!40000 ALTER TABLE `notas_salida` DISABLE KEYS */;
INSERT INTO `notas_salida` VALUES (1,'00000001',6,'2026-02-12',1,'REGISTRADA',NULL,'2026-02-12 04:46:03.809604','2026-02-12 04:46:03.809604','1234','315341','2026-02-12',NULL),(2,'00000002',5,'2026-02-12',1,'REGISTRADA',NULL,'2026-02-12 04:49:10.405577','2026-02-12 04:49:10.405577','pan','12342536','2026-02-12',NULL),(3,'00000003',6,'2026-02-12',1,'REGISTRADA',NULL,'2026-02-12 04:51:29.558452','2026-02-12 04:51:29.558452','pan','1345245','2026-02-12',NULL),(4,'00000004',5,'2026-02-12',1,'REGISTRADA',NULL,'2026-02-12 04:54:28.908167','2026-02-12 04:54:28.908167','pan',NULL,'2026-02-12',NULL),(6,'00000005',10,'2026-02-13',1,'REGISTRADA',NULL,'2026-02-13 07:08:21.828646','2026-02-13 07:08:21.828646',NULL,NULL,'2026-02-13',NULL);
/*!40000 ALTER TABLE `notas_salida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `procedencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `unidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UND',
  `unidad_otro` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `um` enum('','AMP','FRS','BLT','TUB','SOB','CJ','KG','G') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperatura_min_c` decimal(6,2) DEFAULT NULL,
  `temperatura_max_c` decimal(6,2) DEFAULT NULL,
  `cantidad_bultos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_cajas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_por_caja` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_fraccion` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `stock_actual` decimal(10,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `proveedor` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento` enum('Factura','Invoice','Boleta de Venta','Guía de Remisión Remitente','Guía de Remisión Transportista','Orden de Compra') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registro_sanitario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lote` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fabricante` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_ingreso` enum('IMPORTACION','COMPRA_LOCAL','TRASLADO','DEVOLUCION') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'MED-001','Paracetamol 500mg x 100 tabletas','India',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,360.00,1,'2026-01-26 01:39:04','2026-02-13 06:55:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'MED-002','Ibuprofeno 400mg x 50 cápsulas','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,70.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'MED-003','Amoxicilina 500mg x 24 cápsulas','Brasil',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,1739.00,1,'2026-01-26 01:39:04','2026-02-09 15:19:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'MED-004','Omeprazol 20mg x 28 cápsulas','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,48.00,1,'2026-01-26 01:39:04','2026-02-12 04:46:03',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'MED-005','Losartán 50mg x 30 tabletas','México',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,60.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'MED-006','Metformina 850mg x 60 tabletas','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,85.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'MED-007','Atorvastatina 20mg x 30 tabletas','India',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,49.00,1,'2026-01-26 01:39:04','2026-02-09 15:53:13',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'MED-008','Enalapril 10mg x 30 tabletas','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,38.00,1,'2026-01-26 01:39:04','2026-02-12 04:49:10',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'INS-001','Jeringas desechables 5ml x 100 unidades','China',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,160.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'INS-002','Guantes de látex talla M x 100 unidades','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,140.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'INS-003','Gasas estériles 10x10cm x 100 unidades','Brasil',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,110.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'INS-004','Alcohol gel 1 litro','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,282.00,1,'2026-01-26 01:39:04','2026-02-11 05:12:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'INS-005','Mascarillas N95 x 20 unidades','China',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,300.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'INS-006','Catéter intravenoso N°18 x 50 unidades','Colombia',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,70.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'INS-007','Sonda nasogástrica N°16 x 10 unidades','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,60.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'EQP-001','Termómetro digital infrarrojo','China',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,25.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'EQP-002','Tensiómetro digital de brazo','Japón',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,20.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'EQP-003','Oxímetro de pulso portátil','China',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,35.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'EQP-004','Nebulizador ultrasónico','Perú',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,18.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'LAB-001','Kit de prueba rápida COVID-19 x 25 test','Alemania',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,80.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,'LAB-002','Tiras reactivas de glucosa x 50 unidades','USA',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,90.00,1,'2026-01-26 01:39:04','2026-01-26 01:39:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'LAB-003','Reactivo de hemoglobina x 100ml','Suiza',NULL,'UND',NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,0.00,NULL,69.00,1,'2026-01-26 01:39:04','2026-02-08 05:11:47',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'1235146','13436','braem','2026-02-05','OTRO','dakdsa','AMP',NULL,NULL,123.00,13420.00,134.00,0.00,1798280.00,'nada',12354623.00,1,'2026-02-09 04:56:37','2026-02-09 04:56:37','Centro Médico Salud Total S.A.C.','Factura','134154','1234513','1435614','14523','IMPORTACION'),(24,'dasg','dasg','2354','2026-02-12','UND',NULL,'BLT',243.00,234.00,23.00,32.00,3.00,0.00,96.00,'43',2419.00,1,'2026-02-09 05:02:45','2026-02-12 04:54:28','Centro de Salud del Norte E.I.R.L.','Invoice','1245','fasdga','dasg','1351','IMPORTACION'),(25,'pan','pan','pan','2026-02-13','UND',NULL,'FRS',12.00,12.00,0.03,120.00,12.00,0.00,1440.00,NULL,212.00,1,'2026-02-13 05:55:46','2026-02-13 05:55:46','Centro Médico Salud Total S.A.C.','Invoice','606060060','1234567','pam','pan','IMPORTACION'),(26,'0000000','0000000test0000000','lima','2026-02-14','UND',NULL,'AMP',10.00,20.00,12.00,12.00,12.00,0.00,144.00,NULL,244.00,1,'2026-02-13 06:38:29','2026-02-13 10:13:02','casa','Factura','0000000','0000000','0000000test','0000000','IMPORTACION'),(27,'panadol','panadol','lima','2026-02-14','UND',NULL,'BLT',12.00,24.00,12.00,12.00,120.00,0.00,1440.00,NULL,1540.00,1,'2026-02-13 06:42:04','2026-02-13 09:33:15','casa','Factura','panadol','panadol','panadol','panadol','IMPORTACION');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ruc` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'20123456789','Distribuidora Médica del Norte S.A.C.','Roberto Campos','014567890','contacto@dmnorte.com','Av. Industrial 234, Lima',1,'2026-01-26 01:39:04'),(2,'20234567890','Farmacéutica Central E.I.R.L.','Sandra Torres','014567891','ventas@farmcentral.com','Jr. Los Andes 567, Lima',1,'2026-01-26 01:39:04'),(3,'20345678901','Importaciones Médicas del Perú S.A.','Jorge Mendoza','014567892','importaciones@impperu.com','Av. Venezuela 890, Callao',1,'2026-01-26 01:39:04'),(4,'20456789012','Suministros Hospitalarios Unidos S.A.C.','Patricia Ruiz','014567893','info@shunidos.com','Av. Argentina 123, Lima',1,'2026-01-26 01:39:04'),(5,'20567890123','Laboratorios Andinos S.A.','Miguel Vargas','014567894','contacto@labandinos.com','Jr. Junín 456, Arequipa',1,'2026-01-26 01:39:04'),(6,'20678901234','Equipos Médicos Internacionales S.A.C.','Carmen López','014567895','ventas@emiintl.com','Av. Javier Prado 789, Lima',1,'2026-01-26 01:39:04'),(7,'20789012345','Insumos Clínicos del Sur E.I.R.L.','Ricardo Salazar','014567896','info@incsur.com','Calle Real 234, Cusco',1,'2026-01-26 01:39:04');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Administrador, Almacenero, Consulta',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `permisos` json DEFAULT NULL COMMENT 'Control de acceso por módulo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema','{\"kardex\": {\"read\": true, \"export\": true}, \"salidas\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"ingresos\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"usuarios\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"productos\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}}','2026-01-26 01:37:48',1),(2,'Almacenero','Gestión de productos e inventario','{\"kardex\": {\"read\": true, \"export\": true}, \"salidas\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": false}, \"ingresos\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"productos\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}}','2026-01-26 01:37:48',1),(3,'Consulta','Solo lectura de información','{\"kardex\": {\"read\": true, \"export\": true}, \"salidas\": {\"read\": true}, \"ingresos\": {\"read\": true}, \"productos\": {\"read\": true}}','2026-01-26 01:37:48',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salidas`
--

DROP TABLE IF EXISTS `salidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_salida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `responsable_id` int NOT NULL,
  `tipo_salida` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'venta' COMMENT 'venta, traslado, merma, otro',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'procesado' COMMENT 'procesado, anulado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_salida` (`numero_salida`),
  KEY `responsable_id` (`responsable_id`),
  KEY `idx_salidas_fecha` (`fecha`),
  KEY `idx_salidas_cliente` (`cliente_id`),
  KEY `idx_salidas_numero` (`numero_salida`),
  CONSTRAINT `salidas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `salidas_ibfk_2` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salidas`
--

LOCK TABLES `salidas` WRITE;
/*!40000 ALTER TABLE `salidas` DISABLE KEYS */;
INSERT INTO `salidas` VALUES (1,'SAL-2026-0001','2026-01-13',1,2,'venta','Pedido Hospital Nacional de Lima','procesado','2026-01-26 01:39:05','2026-01-26 01:39:05'),(2,'SAL-2026-0002','2026-01-16',2,2,'venta','Pedido Clínica San Gabriel','procesado','2026-01-26 01:39:05','2026-01-26 01:39:05'),(3,'SAL-2026-0003','2026-01-19',3,3,'venta','Pedido Centro de Salud del Norte','procesado','2026-01-26 01:39:05','2026-01-26 01:39:05'),(4,'SAL-2026-0004','2026-01-21',4,2,'venta','Pedido Hospital Arequipa','procesado','2026-01-26 01:39:05','2026-01-26 01:39:05'),(5,'SAL-2026-0005','2026-01-23',5,2,'venta','Pedido Clínica Santa María','procesado','2026-01-26 01:39:05','2026-01-26 01:39:05');
/*!40000 ALTER TABLE `salidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@almacen.com',1,1,'2026-01-26 01:37:48','2026-01-26 01:37:48','','','',NULL),(2,'mgarcia@cerex.com',2,1,'2026-01-26 01:39:04','2026-01-26 01:39:04','','','',NULL),(3,'crodriguez@cerex.com',2,1,'2026-01-26 01:39:04','2026-01-26 01:39:04','','','',NULL),(4,'amartinez@cerex.com',3,1,'2026-01-26 01:39:04','2026-01-26 01:39:04','','','',NULL),(5,'lfernandez@cerex.com',3,1,'2026-01-26 01:39:04','2026-01-26 01:39:04','','','',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-13  5:38:31

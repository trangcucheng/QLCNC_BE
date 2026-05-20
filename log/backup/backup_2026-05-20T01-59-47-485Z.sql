-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: 172.28.229.252    Database: qlcnc
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

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
-- Table structure for table `BieuMau`
--

DROP TABLE IF EXISTS `BieuMau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BieuMau` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duongDan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phienBan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BieuMau`
--

LOCK TABLES `BieuMau` WRITE;
/*!40000 ALTER TABLE `BieuMau` DISABLE KEYS */;
INSERT INTO `BieuMau` VALUES ('21990d6d-d437-4c0c-a3a7-db8a03563d29','Biên bản lấy lời khai','Mẫu biên bản lấy lời khai đối tượng','/bieu-mau/BB02.docx','v1.0','2026-04-09 12:29:36.722','2026-04-09 12:29:36.722'),('270c8295-9529-4492-a41b-4ce5ae4f1d13','Giấy triệu tập','Mẫu giấy triệu tập người có liên quan','/bieu-mau/GT01.docx','v1.0','2026-04-09 12:29:36.824','2026-04-09 12:29:36.824'),('427905bc-b4fe-4ef8-9477-688ae1562367','Bản kê biên tài sản','Mẫu bản kê biên thu giữ tài sản','/bieu-mau/KB01.docx','v1.0','2026-04-09 12:29:36.813','2026-04-09 12:29:36.813'),('5e7a9047-cd0f-4688-881d-33c1a77f9ad3','Lệnh bắt giữ người phạm tội','Mẫu lệnh bắt giữ','/bieu-mau/LENH01.docx','v1.0','2026-04-09 12:29:36.734','2026-04-09 12:29:36.734'),('7b204647-9554-4ebe-b20c-c481e91729f9','Quyết định khởi tố bị can','Mẫu quyết định khởi tố bị can','/bieu-mau/QD003.docx','v1.0','2026-04-09 12:29:36.799','2026-04-09 12:29:36.799'),('825f6d84-be5d-465e-9a09-a4a9cff5a474','Lệnh khám xét','Mẫu lệnh khám xét','/bieu-mau/LENH02.docx','v1.0','2026-04-29 01:09:37.749','2026-04-29 01:09:37.749'),('93e32c74-21f3-475e-a5c2-69be4da587f9','Quyết định khởi tố vụ án','Mẫu quyết định khởi tố vụ án hình sự','/bieu-mau/QD002.docx','v1.0','2026-04-09 12:29:36.787','2026-04-09 12:29:36.787'),('96c28522-5252-4191-bc31-afc5940e873e','Biên bản khám nghiệm hiện trường','Mẫu biên bản khám nghiệm hiện trường vụ án','/bieu-mau/BB01.docx','v1.0','2026-04-09 12:29:36.700','2026-04-09 12:29:36.700'),('9f2e6a22-b595-420b-9ba2-2831e283238d','Lệnh khám xét','Mẫu lệnh khám xét','/bieu-mau/LENH02.docx','v1.0','2026-04-09 12:29:36.762','2026-04-09 12:29:36.762'),('a09c5ef9-c906-4820-bfe9-88ec6954a62b','Bản tự khai','Mẫu bản khai tự khai của đối tượng','/bieu-mau/TK01.docx','v1.0','2026-04-29 01:09:37.840','2026-04-29 01:09:37.840'),('aae959b0-5340-41c0-9c30-1410ea45514a','Biên bản lấy lời khai','Mẫu biên bản lấy lời khai đối tượng','/bieu-mau/BB02.docx','v1.0','2026-04-29 01:09:37.718','2026-04-29 01:09:37.718'),('ab00ff1c-093b-4ec1-93c0-d481ea4d24ff','Giấy triệu tập','Mẫu giấy triệu tập người có liên quan','/bieu-mau/GT01.docx','v1.0','2026-04-29 01:09:37.824','2026-04-29 01:09:37.824'),('bacc6e91-94c9-4dd7-99fb-493ff174f722','Quyết định khởi tố bị can','Mẫu quyết định khởi tố bị can','/bieu-mau/QD003.docx','v1.0','2026-04-29 01:09:37.797','2026-04-29 01:09:37.797'),('c12a4085-c763-4ff1-b76b-f00b231d81bb','Quyết định tạm giữ','Mẫu quyết định tạm giữ đối tượng','/bieu-mau/QD001.docx','v1.0','2026-04-09 12:29:36.775','2026-04-09 12:29:36.775'),('c24f349f-e133-4fb9-832f-576ed7c61a75','Quyết định khởi tố vụ án','Mẫu quyết định khởi tố vụ án hình sự','/bieu-mau/QD002.docx','v1.0','2026-04-29 01:09:37.776','2026-04-29 01:09:37.776'),('c548138a-f63f-4231-a5a1-250bbd913954','Bản tự khai','Mẫu bản khai tự khai của đối tượng','/bieu-mau/TK01.docx','v1.0','2026-04-09 12:29:36.839','2026-04-09 12:29:36.839'),('dd837c9c-2a3c-4dd4-b059-e061a783ed90','Biên bản khám nghiệm hiện trường','Mẫu biên bản khám nghiệm hiện trường vụ án','/bieu-mau/BB01.docx','v1.0','2026-04-29 01:09:37.682','2026-04-29 01:09:37.682'),('dee0f70a-0c1d-45a0-8e79-d1f9bdff8615','Quyết định tạm giữ','Mẫu quyết định tạm giữ đối tượng','/bieu-mau/QD001.docx','v1.0','2026-04-29 01:09:37.760','2026-04-29 01:09:37.760'),('e7e73804-06ff-491f-9ad3-e3141257ee52','Bản kê biên tài sản','Mẫu bản kê biên thu giữ tài sản','/bieu-mau/KB01.docx','v1.0','2026-04-29 01:09:37.810','2026-04-29 01:09:37.810'),('f534018e-557c-4a35-a6d3-22bf1e49f2ad','Lệnh bắt giữ người phạm tội','Mẫu lệnh bắt giữ','/bieu-mau/LENH01.docx','v1.0','2026-04-29 01:09:37.735','2026-04-29 01:09:37.735');
/*!40000 ALTER TABLE `BieuMau` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CauHinhHeThong`
--

DROP TABLE IF EXISTS `CauHinhHeThong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CauHinhHeThong` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `khoa` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `giaTri` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CauHinhHeThong_khoa_key` (`khoa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CauHinhHeThong`
--

LOCK TABLES `CauHinhHeThong` WRITE;
/*!40000 ALTER TABLE `CauHinhHeThong` DISABLE KEYS */;
INSERT INTO `CauHinhHeThong` VALUES ('0d4588db-41dc-428e-9e4a-e73ba6ec596f','EMAIL','caqldanang@gmail.com','Email liên hệ','2026-04-09 12:29:36.919','2026-04-09 12:29:36.919'),('10c4692d-bcf7-44d1-bc3a-a840cee0f7ff','ALLOWED_FILE_TYPES','pdf,doc,docx,xls,xlsx,jpg,jpeg,png,mp4','Các loại file được phép upload','2026-04-09 12:29:37.038','2026-04-09 12:29:37.038'),('1da86d19-9875-49e7-9843-91088ecf0a17','SMTP_PORT','587','SMTP port','2026-04-09 12:29:37.079','2026-04-09 12:29:37.079'),('357ead23-c1e1-46c0-8f46-59ee01488be8','MAX_FILE_UPLOAD_SIZE','10485760','Kích thước file upload tối đa (bytes) - 10MB','2026-04-09 12:29:37.023','2026-04-09 12:29:37.023'),('4e4c311d-2642-4a05-b336-2f5a5a2c83cd','TEN_DON_VI','Công an Thành phố Đà Nẵng','Tên đơn vị sử dụng hệ thống','2026-04-09 12:29:36.855','2026-04-09 12:29:36.855'),('5309dad2-cbbd-4f85-ba4d-94bb98766037','SESSION_TIMEOUT','30','Thời gian timeout phiên làm việc (phút)','2026-04-09 12:29:37.012','2026-04-09 12:29:37.012'),('5e21d152-499e-4c9e-86cd-fed70f1b0610','SMTP_HOST','smtp.gmail.com','SMTP server','2026-04-09 12:29:37.065','2026-04-09 12:29:37.065'),('6446a74b-0114-4406-b65b-3606cc6b03cd','SO_BAN_GHI_MOI_TRANG','20','Số bản ghi mặc định mỗi trang','2026-04-09 12:29:36.983','2026-04-09 12:29:36.983'),('acf85734-ec48-46e8-b027-a8a81629f929','DIEN_THOAI','0236.3822.179','Số điện thoại liên hệ','2026-04-09 12:29:36.902','2026-04-09 12:29:36.902'),('b4e08b5b-653f-420b-8be0-2888a726f614','SO_NGAY_LUU_LOG','90','Số ngày lưu trữ log hệ thống','2026-04-09 12:29:36.967','2026-04-09 12:29:36.967'),('b61baace-8f9b-4aa4-b747-81ed6a9bb2c3','BAO_CAO_HEADER','CÔNG AN THÀNH PHỐ ĐÀ NẴNG','Header cho báo cáo','2026-04-09 12:29:37.090','2026-04-09 12:29:37.090'),('bf9daa18-904a-408f-a08e-2537fa3f30b6','LOGO_URL','/images/logo-ca-danang.png','Đường dẫn logo','2026-04-09 12:29:36.950','2026-04-09 12:29:36.950'),('d1a0df58-313f-4a2c-84d8-7103d76d8eec','WEBSITE','https://cadn.gov.vn','Website đơn vị','2026-04-09 12:29:36.938','2026-04-09 12:29:36.938'),('f7e25467-667f-4312-9295-8a76033caaa8','DIA_CHI','96 Lê Duẩn, Q. Hải Châu, TP. Đà Nẵng','Địa chỉ trụ sở','2026-04-09 12:29:36.881','2026-04-09 12:29:36.881'),('fa27b948-8a53-48e9-b818-1bba8238fa10','ENABLE_EMAIL_NOTIFICATION','true','Bật/tắt thông báo qua email','2026-04-09 12:29:37.050','2026-04-09 12:29:37.050');
/*!40000 ALTER TABLE `CauHinhHeThong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DanhSachDen`
--

DROP TABLE IF EXISTS `DanhSachDen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DanhSachDen` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hetHan` datetime(3) NOT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `DanhSachDen_token_key` (`token`),
  KEY `DanhSachDen_hetHan_idx` (`hetHan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DanhSachDen`
--

LOCK TABLES `DanhSachDen` WRITE;
/*!40000 ALTER TABLE `DanhSachDen` DISABLE KEYS */;
INSERT INTO `DanhSachDen` VALUES ('2375d133-5f8a-4e54-b626-d4b5c6e8a610','4a4cd341-b11d-4f34-ac28-ff0bec540fbc','2026-05-20 13:02:43.000','2026-05-20 01:04:22.043');
/*!40000 ALTER TABLE `DanhSachDen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DonVi`
--

DROP TABLE IF EXISTS `DonVi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonVi` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` tinyint(1) NOT NULL DEFAULT '1',
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  `donViChaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DonVi_ma_key` (`ma`),
  KEY `DonVi_donViChaId_fkey` (`donViChaId`),
  CONSTRAINT `DonVi_donViChaId_fkey` FOREIGN KEY (`donViChaId`) REFERENCES `DonVi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DonVi`
--

LOCK TABLES `DonVi` WRITE;
/*!40000 ALTER TABLE `DonVi` DISABLE KEYS */;
INSERT INTO `DonVi` VALUES ('035561a0-b805-4d1d-ab24-c223dc53098e','PC03','Phòng Cảnh sát Ma túy','Điều tra án ma túy',1,'2026-04-09 12:29:36.559','2026-04-09 12:29:36.559',NULL),('0ef37662-2a68-4bc7-bb46-cf90d3f7fc83','D03','Đội Điều tra trộm cắp','Chuyên điều tra án trộm cắp',1,'2026-04-09 12:29:36.653','2026-04-09 12:29:36.653','a6d5c428-3b1d-43ec-bee2-6abb622b5467'),('1a62b2d2-ae43-4955-a215-5242f7043963','PC05','Phòng Cảnh sát PCCC','Phòng cháy chữa cháy',1,'2026-04-09 12:29:36.585','2026-04-09 12:29:36.585',NULL),('64a2ca04-8477-408e-8874-950f825b417d','D01','Đội Điều tra trọng án','Điều tra các vụ án nghiêm trọng',1,'2026-04-09 12:29:36.620','2026-04-09 12:29:36.620','a6d5c428-3b1d-43ec-bee2-6abb622b5467'),('64a57f94-e404-4191-90d4-cf0f0c5ac580','PC04','Phòng Cảnh sát Giao thông','Quản lý trật tự giao thông',1,'2026-04-09 12:29:36.573','2026-04-09 12:29:36.573',NULL),('771699e2-1bb0-4a9a-b58c-8c7f83618448','D05','Đội Tuần tra kiểm soát','Tuần tra, kiểm soát địa bàn',1,'2026-04-09 12:29:36.682','2026-04-09 12:29:36.682','a6d5c428-3b1d-43ec-bee2-6abb622b5467'),('7be4b0a3-fd80-42ca-b32c-b9f2a4356c9b','D04','Đội Điều tra lừa đảo','Chuyên điều tra án lừa đảo',1,'2026-04-09 12:29:36.668','2026-04-09 12:29:36.668','a6d5c428-3b1d-43ec-bee2-6abb622b5467'),('8fad5144-86b7-4fd2-bfad-645fd6bcecc5','PC02','Phòng Cảnh sát Kinh tế','Điều tra án kinh tế',1,'2026-04-09 12:29:36.544','2026-04-09 12:29:36.544',NULL),('97dd131b-2118-4337-931e-5836c0a95916','D02','Đội Điều tra cướp, cướp giật','Chuyên điều tra án cướp',1,'2026-04-09 12:29:36.636','2026-04-09 12:29:36.636','a6d5c428-3b1d-43ec-bee2-6abb622b5467'),('a6d5c428-3b1d-43ec-bee2-6abb622b5467','PC01','Phòng Cảnh sát Hình sự','Điều tra các vụ án hình sự',1,'2026-04-09 12:29:36.520','2026-04-09 12:29:36.520',NULL);
/*!40000 ALTER TABLE `DonVi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DonViHanhChinh`
--

DROP TABLE IF EXISTS `DonViHanhChinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonViHanhChinh` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cap` int NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` tinyint(1) NOT NULL DEFAULT '1',
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  `loai` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tinhThanhPhoId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DonViHanhChinh_ma_key` (`ma`),
  KEY `DonViHanhChinh_tinhThanhPhoId_fkey` (`tinhThanhPhoId`),
  CONSTRAINT `DonViHanhChinh_tinhThanhPhoId_fkey` FOREIGN KEY (`tinhThanhPhoId`) REFERENCES `DonViHanhChinh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DonViHanhChinh`
--

LOCK TABLES `DonViHanhChinh` WRITE;
/*!40000 ALTER TABLE `DonViHanhChinh` DISABLE KEYS */;
INSERT INTO `DonViHanhChinh` VALUES ('0434dce1-2561-47a5-8526-cd48431a101f','CT-P003','Phường Tân An',2,NULL,1,'2026-04-29 01:09:38.901','2026-04-29 01:09:38.901','Phường','tp-cantho'),('0ee8b4c6-a90c-4bec-8f1b-085d226f9777','HN-X003','Xã Thanh Trì',2,NULL,1,'2026-04-29 01:09:38.766','2026-04-29 01:09:38.766','Xã','tp-hanoi'),('110b72d5-904a-4fda-91de-38fb13f33edf','CT-P002','Phường An Hòa',2,NULL,1,'2026-04-29 01:09:38.873','2026-04-29 01:09:38.873','Phường','tp-cantho'),('11771596-362e-4ec7-940d-17521f029cf4','HCM-P008','Phường An Phú',2,NULL,1,'2026-04-29 01:09:38.641','2026-04-29 01:09:38.641','Phường','tp-hcm'),('160efce4-d6b8-4426-a240-cdb24afee9be','HN-P005','Phường Hoàng Cầu',2,NULL,1,'2026-04-29 01:09:38.736','2026-04-29 01:09:38.736','Phường','tp-hanoi'),('188faef4-8ef5-4c65-aae0-a6307e8d9030','DN-P006','Phường Thạch Thang',2,NULL,1,'2026-04-29 01:09:38.388','2026-04-29 01:09:38.388','Phường','tp-danang'),('18ca032d-b1f4-4550-a5df-3c6bc15b87ca','HCM-X001','Xã Bình Hưng Hòa',2,NULL,1,'2026-04-29 01:09:38.570','2026-04-29 01:09:38.570','Xã','tp-hcm'),('221931dc-de75-4f5c-9a39-ea3f7096cf36','HN-X001','Xã Đông Anh',2,NULL,1,'2026-04-29 01:09:38.681','2026-04-29 01:09:38.681','Xã','tp-hanoi'),('2448dd14-c7df-45ce-8cce-3b0c04847e17','HP-P001','Phường Lê Chân',2,NULL,1,'2026-04-29 01:09:38.782','2026-04-29 01:09:38.782','Phường','tp-haiphong'),('33de29e3-9f3c-487d-981e-8aa1fc05d52a','HP-P002','Phường Đằng Giang',2,NULL,1,'2026-04-29 01:09:38.796','2026-04-29 01:09:38.796','Phường','tp-haiphong'),('3556a9bb-92b6-442a-84d1-e613a05d08c4','CT-P001','Phường Xuân Khánh',2,NULL,1,'2026-04-29 01:09:38.859','2026-04-29 01:09:38.859','Phường','tp-cantho'),('3eea95fd-e35d-4d45-817f-fdae5eb357bb','DN-P001','Phường Hòa Thuận Tây',2,NULL,1,'2026-04-29 01:09:38.276','2026-04-29 01:09:38.276','Phường','tp-danang'),('40f1cdf2-da64-4495-9d08-5bbf0944c3ae','QN-X005','Xã Duy Xuyên',2,NULL,1,'2026-04-29 01:09:38.523','2026-04-29 01:09:38.523','Xã','tp-quangnam'),('4540cb8c-49e3-4267-bb67-154fc06014dc','HP-P003','Phường Cát Bi',2,NULL,1,'2026-04-29 01:09:38.830','2026-04-29 01:09:38.830','Phường','tp-haiphong'),('45b4e8d5-a0a5-4bef-b985-2b32295b47ed','QN-X003','Xã Tam Kỳ',2,NULL,1,'2026-04-29 01:09:38.483','2026-04-29 01:09:38.483','Xã','tp-quangnam'),('4e9815f6-5686-482a-9b71-8952cf6a1557','DN-P003','Phường Thanh Khê',2,NULL,1,'2026-04-29 01:09:38.333','2026-04-29 01:09:38.333','Phường','tp-danang'),('4f8be2ad-ea9d-4552-beab-c8e840d49cdf','DN-X003','Xã Hòa Liên',2,NULL,1,'2026-04-29 01:09:38.424','2026-04-29 01:09:38.424','Xã','tp-danang'),('5172e85c-0d30-492d-bba7-55d3c3d9fc97','HCM-P003','Phường Bến Thành',2,NULL,1,'2026-04-29 01:09:38.558','2026-04-29 01:09:38.558','Phường','tp-hcm'),('5240a56a-6001-4238-a486-b84cb215c7f3','HN-P002','Phường Thành Công',2,NULL,1,'2026-04-29 01:09:38.667','2026-04-29 01:09:38.667','Phường','tp-hanoi'),('52a8fc4f-fafb-476a-bee1-6855dae5d81a','DN-P002','Phường Hòa Minh',2,NULL,1,'2026-04-29 01:09:38.300','2026-04-29 01:09:38.300','Phường','tp-danang'),('5a91ef74-7373-4cb1-a7f1-6ffd7605eea6','QN-X002','Xã Hội An',2,NULL,1,'2026-04-29 01:09:38.462','2026-04-29 01:09:38.462','Xã','tp-quangnam'),('5ccb92ae-7376-4060-b5d9-496a692dc461','HCM-X002','Xã Phú Xuân',2,NULL,1,'2026-04-29 01:09:38.617','2026-04-29 01:09:38.617','Xã','tp-hcm'),('6a6272e7-595a-4fe9-ba59-16f520a78c0a','HCM-P005','Phường Đa Kao',2,NULL,1,'2026-04-29 01:09:38.592','2026-04-29 01:09:38.592','Phường','tp-hcm'),('758aa36a-9f05-4764-a128-7cef35b2a3f4','HCM-P006','Phường Tân Sơn Nhì',2,NULL,1,'2026-04-29 01:09:38.605','2026-04-29 01:09:38.605','Phường','tp-hcm'),('8aaad2a7-caad-4156-84c9-225ee5b82ba9','DN-X002','Xã Hòa Bắc',2,NULL,1,'2026-04-29 01:09:38.414','2026-04-29 01:09:38.414','Xã','tp-danang'),('915f3b8c-3ad7-4d19-82ad-9caf096ee4c3','DN-P005','Phường Hải Châu II',2,NULL,1,'2026-04-29 01:09:38.371','2026-04-29 01:09:38.371','Phường','tp-danang'),('964e39f4-9f7a-4ec8-aae0-4e5a491bc434','DN-X001','Xã Hòa Phước',2,NULL,1,'2026-04-29 01:09:38.317','2026-04-29 01:09:38.317','Xã','tp-danang'),('a23be4ce-3bb2-4bc2-bfb6-73c18dfecec6','QN-X001','Xã Điện Phương',2,NULL,1,'2026-04-29 01:09:38.451','2026-04-29 01:09:38.451','Xã','tp-quangnam'),('a30ba5e5-acf7-4f21-93ef-17b88a403190','QN-P003','Phường Cửa Đại',2,NULL,1,'2026-04-29 01:09:38.507','2026-04-29 01:09:38.507','Phường','tp-quangnam'),('a5dea976-dff8-422c-aa3a-278d737b763f','CT-X001','Xã Thới Lai',2,NULL,1,'2026-04-29 01:09:38.887','2026-04-29 01:09:38.887','Xã','tp-cantho'),('af2ad02c-70d7-4ee6-8599-b1005041709f','QN-P002','Phường Cẩm Phô',2,NULL,1,'2026-04-29 01:09:38.472','2026-04-29 01:09:38.472','Phường','tp-quangnam'),('b694e751-5d90-4c0c-a03e-c7778d3738da','HN-P003','Phường Cầu Giấy',2,NULL,1,'2026-04-29 01:09:38.692','2026-04-29 01:09:38.692','Phường','tp-hanoi'),('b95f8cf9-58cf-4157-a54f-ea935a5119b7','HCM-P007','Phường Thảo Điền',2,NULL,1,'2026-04-29 01:09:38.627','2026-04-29 01:09:38.627','Phường','tp-hcm'),('ba516166-f9f5-4c29-a79a-6dad81c4e196','HP-X002','Xã Tiên Lãng',2,NULL,1,'2026-04-29 01:09:38.848','2026-04-29 01:09:38.848','Xã','tp-haiphong'),('babfd8ca-351a-4895-8794-d6cbfbc5d74d','HN-P004','Phường Dịch Vọng',2,NULL,1,'2026-04-29 01:09:38.714','2026-04-29 01:09:38.714','Phường','tp-hanoi'),('bed7f778-abda-4456-a830-78b1abfa194c','HCM-P002','Phường Nguyễn Thái Bình',2,NULL,1,'2026-04-29 01:09:38.549','2026-04-29 01:09:38.549','Phường','tp-hcm'),('c546a6bb-c8c8-49dc-91ac-f3f4ac9788eb','QN-P001','Phường Điện Ngọc',2,NULL,1,'2026-04-29 01:09:38.437','2026-04-29 01:09:38.437','Phường','tp-quangnam'),('c5b2e663-be50-4bfe-9bdc-a310539b8a72','HN-P001','Phường Láng Hạ',2,NULL,1,'2026-04-29 01:09:38.654','2026-04-29 01:09:38.654','Phường','tp-hanoi'),('d31594a6-50ef-4e2f-9d20-6b48a41b1406','DN-P007','Phường Phước Ninh',2,NULL,1,'2026-04-29 01:09:38.401','2026-04-29 01:09:38.401','Phường','tp-danang'),('d5b309bb-9a6b-4654-a9b8-6f84c1d07751','QN-X004','Xã Điện Bàn',2,NULL,1,'2026-04-29 01:09:38.493','2026-04-29 01:09:38.493','Xã','tp-quangnam'),('d5dc5648-dd99-4100-a667-6ae6ee17dc2a','HCM-P004','Phường Tân Định',2,NULL,1,'2026-04-29 01:09:38.584','2026-04-29 01:09:38.584','Phường','tp-hcm'),('e164e6aa-848f-4ce7-a46f-f9b008d156e1','HP-X001','Xã An Dương',2,NULL,1,'2026-04-29 01:09:38.808','2026-04-29 01:09:38.808','Xã','tp-haiphong'),('f2f7b47d-1289-46fc-bcaa-ea37e2090938','HCM-P001','Phường Bến Nghé',2,NULL,1,'2026-04-29 01:09:38.536','2026-04-29 01:09:38.536','Phường','tp-hcm'),('f3e4e93c-13ea-41a6-84d1-c222ce9c2482','HN-P006','Phường Ô Chợ Dừa',2,NULL,1,'2026-04-29 01:09:38.752','2026-04-29 01:09:38.752','Phường','tp-hanoi'),('f6ce7d3c-4fd5-4578-8289-d72717c1939c','CT-X002','Xã Phong Điền',2,NULL,1,'2026-04-29 01:09:38.915','2026-04-29 01:09:38.915','Xã','tp-cantho'),('f98bdbb0-8664-4ff2-9680-73f0915c68ed','HN-X002','Xã Sóc Sơn',2,NULL,1,'2026-04-29 01:09:38.723','2026-04-29 01:09:38.723','Xã','tp-hanoi'),('fd7b499c-cdbe-4eb8-be49-e476b5289f70','DN-P004','Phường Hải Châu I',2,NULL,1,'2026-04-29 01:09:38.349','2026-04-29 01:09:38.349','Phường','tp-danang'),('tp-cantho','CT','Cần Thơ',1,NULL,1,'2026-04-29 01:09:38.250','2026-04-29 01:09:38.250','Thành phố',NULL),('tp-danang','DN','Đà Nẵng',1,NULL,1,'2026-04-29 01:09:38.167','2026-04-29 01:09:38.167','Thành phố',NULL),('tp-haiphong','HP','Hải Phòng',1,NULL,1,'2026-04-29 01:09:38.234','2026-04-29 01:09:38.234','Thành phố',NULL),('tp-hanoi','HN','Hà Nội',1,NULL,1,'2026-04-29 01:09:38.222','2026-04-29 01:09:38.222','Thành phố',NULL),('tp-hcm','HCM','Hồ Chí Minh',1,NULL,1,'2026-04-29 01:09:38.210','2026-04-29 01:09:38.210','Thành phố',NULL),('tp-quangnam','QN','Quảng Nam',1,NULL,1,'2026-04-29 01:09:38.196','2026-04-29 01:09:38.196','Tỉnh',NULL);
/*!40000 ALTER TABLE `DonViHanhChinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HoSoDoiTuong`
--

DROP TABLE IF EXISTS `HoSoDoiTuong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HoSoDoiTuong` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenGoiKhac` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gioiTinh` enum('NAM','NU') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaySinh` datetime(3) NOT NULL,
  `noiSinh` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quocTich` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Việt Nam',
  `danToc` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kinh',
  `tonGiao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soCMND_CCCD` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayCapCMND` datetime(3) DEFAULT NULL,
  `noiCapCMND` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soHoChieu` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayCapHoChieu` datetime(3) DEFAULT NULL,
  `noiCapHoChieu` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trinhDoHocVan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngheNghiep` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiLamViec` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capBac` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chucVu` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donVi` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `queQuanId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChiQueQuan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiThuongTruId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChiThuongTru` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiOHienTaiId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChiHienTai` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tienAn` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tienSu` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('DANG_THEO_DOI','TAM_GIAM','DA_XU_LY','CHUYEN_NOI_KHAC') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DANG_THEO_DOI',
  `ghiChu` text COLLATE utf8mb4_unicode_ci,
  `anhDaiDien` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiTaoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  `fileAnh` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `HoSoDoiTuong_soCMND_CCCD_key` (`soCMND_CCCD`),
  KEY `HoSoDoiTuong_queQuanId_fkey` (`queQuanId`),
  KEY `HoSoDoiTuong_noiThuongTruId_fkey` (`noiThuongTruId`),
  KEY `HoSoDoiTuong_noiOHienTaiId_fkey` (`noiOHienTaiId`),
  KEY `HoSoDoiTuong_nguoiTaoId_fkey` (`nguoiTaoId`),
  CONSTRAINT `HoSoDoiTuong_nguoiTaoId_fkey` FOREIGN KEY (`nguoiTaoId`) REFERENCES `NguoiDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `HoSoDoiTuong_noiOHienTaiId_fkey` FOREIGN KEY (`noiOHienTaiId`) REFERENCES `DonViHanhChinh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `HoSoDoiTuong_noiThuongTruId_fkey` FOREIGN KEY (`noiThuongTruId`) REFERENCES `DonViHanhChinh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `HoSoDoiTuong_queQuanId_fkey` FOREIGN KEY (`queQuanId`) REFERENCES `DonViHanhChinh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HoSoDoiTuong`
--

LOCK TABLES `HoSoDoiTuong` WRITE;
/*!40000 ALTER TABLE `HoSoDoiTuong` DISABLE KEYS */;
INSERT INTO `HoSoDoiTuong` VALUES ('1c64b449-baf2-4832-8817-0506c955d2b9','Nguyễn Văn D','Ngáo','NAM','2001-12-22 00:00:00.000',NULL,'Việt Nam','','','000405001822',NULL,NULL,NULL,NULL,NULL,'','','',NULL,NULL,NULL,NULL,NULL,'915f3b8c-3ad7-4d19-82ad-9caf096ee4c3','236 Chè','915f3b8c-3ad7-4d19-82ad-9caf096ee4c3','3','',NULL,'TAM_GIAM','',NULL,'956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-05-20 00:23:16.649','2026-05-20 00:24:24.167','[\"/uploads/doi-tuong/1779236596936-hq1wh8.png\"]'),('7d20e605-0523-4237-8950-3802621b65be','Nguyễn Văn D','','NAM','1998-12-11 00:00:00.000',NULL,'Việt Nam','','','030405001822',NULL,NULL,NULL,NULL,NULL,'','','',NULL,NULL,NULL,NULL,NULL,'915f3b8c-3ad7-4d19-82ad-9caf096ee4c3','236 Chè','915f3b8c-3ad7-4d19-82ad-9caf096ee4c3','3','',NULL,'DANG_THEO_DOI','',NULL,'956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-29 02:17:29.025','2026-04-29 02:17:29.106','[\"/uploads/doi-tuong/1777429049091-go85o.png\"]'),('95baed8a-1f74-46bc-924a-2f1243b53828','Nguyễn Văn B','','NAM','1997-12-12 00:00:00.000',NULL,'Việt Nam','','','030405001820',NULL,NULL,NULL,NULL,NULL,'','','',NULL,NULL,NULL,NULL,NULL,NULL,'e',NULL,NULL,'',NULL,'DANG_THEO_DOI','',NULL,'956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-29 02:01:03.114','2026-04-29 02:01:03.238','[\"/uploads/doi-tuong/1777428063220-gl73vf.png\"]'),('b2538a89-0c6b-4a7d-93d3-0d3599890efe','Nguyễn Văn An','An Béo','NAM','1990-05-15 00:00:00.000','Đà Nẵng','Việt Nam','Kinh','Không','201234567890','2020-01-10 00:00:00.000','Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',NULL,NULL,NULL,'Trung học phổ thông','Thợ hàn','Công ty TNHH Cơ khí Đà Nẵng',NULL,NULL,NULL,NULL,'Hòa Khánh Nam, Liên Chiểu, Đà Nẵng',NULL,'123 Nguyễn Lương Bằng, P. Hòa Thuận Tây, Q. Hải Châu',NULL,'123 Nguyễn Lương Bằng, P. Hòa Thuận Tây, Q. Hải Châu','1 tiền án về tội trộm cắp tài sản năm 2015','2 tiền sự về đánh bạc năm 2012, 2014','DANG_THEO_DOI','Đối tượng có biểu hiện nghi vấn, cần theo dõi chặt chẽ','/uploads/avatar/nguyen-van-an.jpg','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.163','2026-04-09 12:29:38.163','\"[\\\"/uploads/doi-tuong/an-1.jpg\\\",\\\"/uploads/doi-tuong/an-2.jpg\\\"]\"'),('b2a2f0b8-cfb5-4db8-b0c1-176923abfd61','Trần Thị Bình',NULL,'NU','1995-08-20 00:00:00.000','TP. Hồ Chí Minh','Việt Nam','Kinh',NULL,'209876543210','2021-03-15 00:00:00.000','Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',NULL,NULL,NULL,'Cao đẳng','Nhân viên bán hàng',NULL,NULL,NULL,NULL,NULL,'Quận 1, TP. Hồ Chí Minh',NULL,'456 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',NULL,'789 Hùng Vương, P. Hòa Thuận Tây, Đà Nẵng',NULL,NULL,'DANG_THEO_DOI','Di chuyển từ TP.HCM lên Đà Nẵng sinh sống','/uploads/avatar/tran-thi-binh.jpg','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.199','2026-04-09 12:29:38.199','[]'),('b4ef30e9-9498-4886-99d8-c95e509861d4','Lê Minh Cường','Cường Cut','NAM','1988-12-05 00:00:00.000','Quảng Nam','Việt Nam','Kinh','Phật giáo','205555666677','2019-07-20 00:00:00.000','Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',NULL,NULL,NULL,'Trung học cơ sở','Tự do',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'321 Ông Ích Khiêm, P. Hòa Thuận Tây, Đà Nẵng',NULL,'321 Ông Ích Khiêm, P. Hòa Thuận Tây, Đà Nẵng','2 tiền án về tội cướp giật (2010), tội đánh bạc (2016)','Nhiều tiền sự về gây rối trật tự công cộng','DANG_THEO_DOI','Đối tượng nguy hiểm, có biểu hiện tái phạm','/uploads/avatar/le-minh-cuong.jpg','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.221','2026-04-09 12:29:38.221','\"[\\\"/uploads/doi-tuong/cuong-1.jpg\\\",\\\"/uploads/doi-tuong/cuong-2.jpg\\\",\\\"/uploads/doi-tuong/cuong-3.jpg\\\"]\"');
/*!40000 ALTER TABLE `HoSoDoiTuong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HoSoVuViec`
--

DROP TABLE IF EXISTS `HoSoVuViec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HoSoVuViec` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soHoSo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenVuViec` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTaVuViec` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayXayRa` datetime(3) NOT NULL,
  `diaChiXayRa` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `donViHanhChinhId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mucDoViPham` enum('NONG','RAT_NONG','DAC_BIET_NONG') COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` enum('DANG_XU_LY','TAM_DUNG','HOAN_THANH','CHUYEN_GIAI','HUY_BO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DANG_XU_LY',
  `donViXuLy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canBoXuLy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayBatDauXuLy` datetime(3) DEFAULT NULL,
  `ngayKetThuc` datetime(3) DEFAULT NULL,
  `ketQuaXuLy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghiChu` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiTaoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `HoSoVuViec_soHoSo_key` (`soHoSo`),
  KEY `HoSoVuViec_donViHanhChinhId_fkey` (`donViHanhChinhId`),
  KEY `HoSoVuViec_nguoiTaoId_fkey` (`nguoiTaoId`),
  CONSTRAINT `HoSoVuViec_donViHanhChinhId_fkey` FOREIGN KEY (`donViHanhChinhId`) REFERENCES `DonViHanhChinh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `HoSoVuViec_nguoiTaoId_fkey` FOREIGN KEY (`nguoiTaoId`) REFERENCES `NguoiDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HoSoVuViec`
--

LOCK TABLES `HoSoVuViec` WRITE;
/*!40000 ALTER TABLE `HoSoVuViec` DISABLE KEYS */;
INSERT INTO `HoSoVuViec` VALUES ('0d41aa2b-7a7a-4347-925e-05a5e59924f0','HS2026-002','Vụ đánh nhau gây thương tích tại quán nhậu','2 nhóm đối tượng xô xát, đánh nhau gây thương tích tại quán nhậu trên đường Ông Ích Khiêm','2026-04-02 15:30:00.000','456 Ông Ích Khiêm, P. Hòa Thuận Tây, Q. Hải Châu, Đà Nẵng',NULL,'RAT_NONG','DANG_XU_LY','Đội Điều tra trọng án','Đại úy Trần Văn B','2026-04-02 16:00:00.000',NULL,NULL,'Có 3 người bị thương, đã lấy lời khai nhân chứng','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.278','2026-04-09 12:29:38.278'),('2316e478-eda5-478e-91cd-77a866eee754','HS2026-006','Vụ lừa đảo chiếm đoạt tài sản qua mạng','2','2024-12-12 00:00:00.000','2','fd7b499c-cdbe-4eb8-be49-e476b5289f70','NONG','DANG_XU_LY',NULL,NULL,NULL,NULL,NULL,'','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-29 02:36:15.488','2026-04-29 02:36:15.488'),('65a40e55-13a2-4afa-ae45-649c0460fe59','HS2026-001','Vụ trộm cắp xe máy tại chợ Hòa Khánh','Đối tượng trộm 3 xe máy tại bãi giữ xe chợ Hòa Khánh vào lúc 15h ngày 01/04/2026','2026-04-01 08:00:00.000','Chợ Hòa Khánh, P. Hòa Khánh Nam, Q. Liên Chiểu, Đà Nẵng',NULL,'NONG','DANG_XU_LY','Phòng Cảnh sát Hình sự','Thượng úy Nguyễn Văn A','2026-04-01 09:00:00.000',NULL,NULL,'Đã trích xuất camera an ninh','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.259','2026-04-09 12:29:38.259'),('e6616241-039b-4c14-9118-48fddfd35c55','HS2026-003','Vụ lừa đảo chiếm đoạt tài sản qua mạng','Đối tượng giả danh nhân viên ngân hàng lừa đảo chiếm đoạt 500 triệu đồng của nạn nhân','2026-03-28 00:00:00.000','Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',NULL,'DAC_BIET_NONG','DANG_XU_LY','Phòng Cảnh sát Kinh tế','Thượng úy Lê Văn C','2026-03-29 01:00:00.000',NULL,NULL,'Đang phối hợp với ngân hàng truy vết giao dịch','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','2026-04-09 12:29:38.299','2026-04-24 11:22:15.713');
/*!40000 ALTER TABLE `HoSoVuViec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LichSuDangNhap`
--

DROP TABLE IF EXISTS `LichSuDangNhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuDangNhap` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiDungId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diaChiIP` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thietBi` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trinh_duyet` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viTri` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `LichSuDangNhap_nguoiDungId_fkey` (`nguoiDungId`),
  CONSTRAINT `LichSuDangNhap_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichSuDangNhap`
--

LOCK TABLES `LichSuDangNhap` WRITE;
/*!40000 ALTER TABLE `LichSuDangNhap` DISABLE KEYS */;
INSERT INTO `LichSuDangNhap` VALUES ('0361dc06-6fb4-4937-95aa-7b69dd717508','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,'2026-05-17 15:59:31.022'),('07670ce8-a925-499c-b369-e95f53b4fded','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 13:28:35.286'),('0ac830a0-c7a9-4257-9096-936868caeb79','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-22 02:51:10.122'),('0cbe0a62-3776-48a2-965e-683b86d3e863','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-22 03:16:31.290'),('12070661-73aa-4a97-9cab-3a5b8a7da057','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-10 06:22:01.898'),('2282efd0-cc3d-49d3-884b-bb961250e402','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-29 02:15:22.804'),('24701e38-482d-4e34-af6f-e7c07d6aeefe','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','192.168.1.100','Windows 10','Chrome 120','Đà Nẵng','2026-04-02 01:15:00.000'),('24ab62ed-82b6-4cd9-8b5a-d205154dfd92','f56c5165-c118-4da8-a37a-40b2ca386389','192.168.1.75','Android','Chrome Mobile','Đà Nẵng','2026-04-01 09:00:00.000'),('255c72df-c929-4d91-ab91-79a09e11b62e','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-11 17:34:55.036'),('2b0c04a2-2829-493c-9d36-ed4fc7c37cb4','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-22 03:06:42.817'),('2f980f8c-e544-4efa-ad8f-ecbb4d4a3b16','f56c5165-c118-4da8-a37a-40b2ca386389','192.168.1.75','Windows 11','Edge 120','Đà Nẵng','2026-04-02 01:00:00.000'),('344986f1-8be3-4a7e-a340-067c3478fb20','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-24 11:21:33.109'),('3b2ec41d-639d-4549-bea2-1ded27c340ad','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-10 10:04:32.082'),('427cebe0-09a9-42b0-863f-59d6fb0322c5','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-14 11:02:08.948'),('4a54c50f-1d38-41fe-8ccc-bce4ba0d3bd9','8d0885e1-e4af-463f-a682-4d432aa655cc','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 13:34:46.849'),('4d1fbace-5b56-47a9-9628-0774fd54c963','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 13:33:53.302'),('4e0f8a1a-dc2b-45e6-a499-9c1b710f9f98','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-13 09:14:13.622'),('5b5b13e4-d043-4ae7-8882-6d970e8efd6a','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-29 02:16:29.750'),('5eb9b658-fd01-45e5-b125-2f07ea8c4809','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-05-05 01:43:59.189'),('63ae6e67-5d5b-41d9-a179-e1982893b677','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 12:30:50.911'),('6618ad9c-e4bf-461b-b1cc-de5fcb7e4b5e','8d0885e1-e4af-463f-a682-4d432aa655cc','192.168.1.50','MacOS','Safari 17','Đà Nẵng','2026-04-02 02:30:00.000'),('6b3780e8-1f29-4e5e-8931-0951f93dab54','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-05-13 02:52:46.374'),('70549c85-b52b-451f-9b02-29a013ee640d','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-24 03:40:32.713'),('71090d28-30b1-481b-9e22-f46374b1412d','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-24 02:48:57.878'),('726907d7-bef1-4da3-ac4d-e86d42872311','f56c5165-c118-4da8-a37a-40b2ca386389','192.168.1.75','Windows 11','Edge 120','Đà Nẵng','2026-03-30 01:00:00.000'),('768fde2a-25ca-4dbd-a808-61864b787c67','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-05-05 11:02:44.320'),('7d383a36-1980-4750-adbd-1c3a5a1a96fa','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','192.168.1.100','Windows 10','Chrome 120','Đà Nẵng','2026-04-01 00:45:00.000'),('8249424a-a670-44ab-84c8-647118c655c5','8d0885e1-e4af-463f-a682-4d432aa655cc','192.168.1.50','iPhone','Safari Mobile','Đà Nẵng','2026-04-01 07:00:00.000'),('8b06ac1b-fae6-4f7f-b06e-1776eb7e87df','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-29 02:57:33.536'),('8c6d04ab-94c2-4b23-b5c7-c4cd12dd998a','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-24 02:52:50.928'),('8d379503-bb07-462f-9ed0-57b4cf27c835','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-11 14:14:23.669'),('8f6b4c79-b094-4de1-9d98-64bdc319f3cb','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,'2026-05-20 01:04:29.288'),('a5162814-0b3c-46a9-a9ef-0d776695156b','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-29 00:50:21.374'),('adcf5983-9056-42cc-8fbb-42ec79317601','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 12:53:53.857'),('b3b86adb-2c22-41eb-abd9-2e5427870746','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-05-05 00:16:59.604'),('b3f35835-237e-4984-a047-c5e9998344bb','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-09 13:23:48.834'),('b92a0db5-b465-4a8c-af84-c0a6458b3379','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','192.168.1.100','Windows 10','Chrome 120','Đà Nẵng','2026-04-03 01:00:00.000'),('ba75cca9-58a5-4e31-8c74-cabea79481f9','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-29 01:31:52.182'),('bd368951-a45c-4239-b3ab-7f3a2bce863f','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-15 00:42:34.909'),('be728e28-e4b9-4454-886a-d865613e5fe1','f56c5165-c118-4da8-a37a-40b2ca386389','192.168.1.75','Windows 11','Edge 120','Đà Nẵng','2026-04-03 01:30:00.000'),('c324f241-3265-4658-99b5-6a340b5a3df5','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-22 02:57:28.179'),('c47fe4e4-cc9e-4a11-b90b-6353e99c6bbb','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-22 03:18:23.676'),('c4f12993-0989-4e83-b1b0-35a913754e37','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-13 08:48:44.198'),('deb9b6d4-f5ef-4368-8bce-690aeb67c3d3','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,'2026-05-18 03:20:07.421'),('e00726ea-9440-4a03-b918-91cca2373c8e','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-04-24 02:23:56.675'),('e339eeb5-c724-4800-900a-f6db8f69b49f','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-13 07:30:10.375'),('ef04746f-026a-4edb-adec-c85d8158b6f6','8d0885e1-e4af-463f-a682-4d432aa655cc','192.168.1.50','MacOS','Safari 17','Đà Nẵng','2026-04-03 02:00:00.000'),('f23985db-d282-4699-96d8-f61df618fe5b','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'2026-05-05 01:21:33.871'),('f472a2fc-386f-4f72-bd1f-dfb998b78d56','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',NULL,'2026-04-13 02:57:53.875'),('fd5f8515-974e-41d4-83e2-583c5a49b63d','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,'2026-05-19 13:02:43.756'),('fe1f35ec-e410-48c9-b96e-bd0b2a7d1842','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','::1','desktop','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,'2026-05-16 10:10:37.185');
/*!40000 ALTER TABLE `LichSuDangNhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LichSuXuLyVuViec`
--

DROP TABLE IF EXISTS `LichSuXuLyVuViec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuXuLyVuViec` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vuViecId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThaiCu` enum('DANG_XU_LY','TAM_DUNG','HOAN_THANH','CHUYEN_GIAI','HUY_BO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThaiMoi` enum('DANG_XU_LY','TAM_DUNG','HOAN_THANH','CHUYEN_GIAI','HUY_BO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lyDo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiThucHien` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayThucHien` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `LichSuXuLyVuViec_vuViecId_fkey` (`vuViecId`),
  CONSTRAINT `LichSuXuLyVuViec_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichSuXuLyVuViec`
--

LOCK TABLES `LichSuXuLyVuViec` WRITE;
/*!40000 ALTER TABLE `LichSuXuLyVuViec` DISABLE KEYS */;
INSERT INTO `LichSuXuLyVuViec` VALUES ('0457a1e9-254f-45cd-9cdc-d3a86ca9aa4a','65a40e55-13a2-4afa-ae45-649c0460fe59',NULL,'DANG_XU_LY','Khởi tạo hồ sơ vụ việc','Thượng úy Nguyễn Văn A','2026-04-01 09:00:00.000'),('2afd5fa5-5209-41ce-9b4c-0130af7d0919','0d41aa2b-7a7a-4347-925e-05a5e59924f0',NULL,'DANG_XU_LY','Tiếp nhận hồ sơ vụ việc mới','Đại úy Trần Văn B','2026-04-02 16:00:00.000'),('efa525fc-0e25-4cb2-802e-ac26c364ca94','e6616241-039b-4c14-9118-48fddfd35c55',NULL,'DANG_XU_LY','Tiếp nhận đơn tố cáo từ nạn nhân','Thượng úy Lê Văn C','2026-03-29 01:00:00.000');
/*!40000 ALTER TABLE `LichSuXuLyVuViec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NguoiDung`
--

DROP TABLE IF EXISTS `NguoiDung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NguoiDung` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matKhau` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soDienThoai` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loaiNguoiDung` enum('CAN_BO_NGHIEP_VU','LANH_DAO','QUAN_TRI_VIEN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThaiHoatDong` tinyint(1) NOT NULL DEFAULT '1',
  `lanDangNhapCuoi` datetime(3) DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NguoiDung_email_key` (`email`),
  UNIQUE KEY `NguoiDung_soDienThoai_key` (`soDienThoai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NguoiDung`
--

LOCK TABLES `NguoiDung` WRITE;
/*!40000 ALTER TABLE `NguoiDung` DISABLE KEYS */;
INSERT INTO `NguoiDung` VALUES ('8d0885e1-e4af-463f-a682-4d432aa655cc','Nguyễn Văn Lãnh Đạo','lanhdao@qlcnc.vn','$2b$10$8P5.w1EG2A2Eoj1bA9dmFu12AKeGBsRrrpfvCG9CvqEymEwLRdwkC','0901234568','LANH_DAO',1,'2026-04-09 13:34:46.865','2026-04-09 12:29:35.645','2026-04-09 13:34:46.869'),('956a69c4-495a-4ce8-8e9a-666ac74bdcf1','Admin Hệ thống','admin@qlcnc.vn','$2b$10$8P5.w1EG2A2Eoj1bA9dmFu12AKeGBsRrrpfvCG9CvqEymEwLRdwkC','0901234567','QUAN_TRI_VIEN',1,'2026-05-20 01:04:29.330','2026-04-09 12:29:35.594','2026-05-20 01:04:29.332'),('f56c5165-c118-4da8-a37a-40b2ca386389','Trần Thị Cán Bộ','canbo@qlcnc.vn','$2b$10$8P5.w1EG2A2Eoj1bA9dmFu12AKeGBsRrrpfvCG9CvqEymEwLRdwkC','0901234569','CAN_BO_NGHIEP_VU',1,NULL,'2026-04-09 12:29:35.671','2026-04-09 12:29:35.671');
/*!40000 ALTER TABLE `NguoiDung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NguoiDungThongBao`
--

DROP TABLE IF EXISTS `NguoiDungThongBao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NguoiDungThongBao` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiDungId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thongBaoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `daDoc` tinyint(1) NOT NULL DEFAULT '0',
  `ngayDoc` datetime(3) DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `NguoiDungThongBao_nguoiDungId_thongBaoId_key` (`nguoiDungId`,`thongBaoId`),
  KEY `NguoiDungThongBao_nguoiDungId_daDoc_idx` (`nguoiDungId`,`daDoc`),
  KEY `NguoiDungThongBao_thongBaoId_fkey` (`thongBaoId`),
  CONSTRAINT `NguoiDungThongBao_thongBaoId_fkey` FOREIGN KEY (`thongBaoId`) REFERENCES `ThongBao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NguoiDungThongBao`
--

LOCK TABLES `NguoiDungThongBao` WRITE;
/*!40000 ALTER TABLE `NguoiDungThongBao` DISABLE KEYS */;
INSERT INTO `NguoiDungThongBao` VALUES ('a723ff75-a5e6-4d41-bacf-0c243f82e479','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','0982cc9a-8325-4c39-8651-7d7c80a9f839',1,'2026-04-10 06:24:21.074','2026-04-10 06:24:21.077');
/*!40000 ALTER TABLE `NguoiDungThongBao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `QuanHeDoiTuong`
--

DROP TABLE IF EXISTS `QuanHeDoiTuong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `QuanHeDoiTuong` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doiTuongChinh` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doiTuongLienQuan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quanHeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `QuanHeDoiTuong_doiTuongChinh_fkey` (`doiTuongChinh`),
  KEY `QuanHeDoiTuong_quanHeId_fkey` (`quanHeId`),
  CONSTRAINT `QuanHeDoiTuong_doiTuongChinh_fkey` FOREIGN KEY (`doiTuongChinh`) REFERENCES `HoSoDoiTuong` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuanHeDoiTuong_quanHeId_fkey` FOREIGN KEY (`quanHeId`) REFERENCES `QuanHeXaHoi` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `QuanHeDoiTuong`
--

LOCK TABLES `QuanHeDoiTuong` WRITE;
/*!40000 ALTER TABLE `QuanHeDoiTuong` DISABLE KEYS */;
INSERT INTO `QuanHeDoiTuong` VALUES ('00ed16d0-3a6a-4e68-8a11-e720c74093f0','b4ef30e9-9498-4886-99d8-c95e509861d4','b2538a89-0c6b-4a7d-93d3-0d3599890efe','2692af70-c7f7-4808-adfc-a49c2b32be1b','Bạn thân, cùng tham gia các hoạt động','2026-04-09 12:29:38.345'),('d0efd6f1-c101-4a59-85f1-82c17237e2cf','b2538a89-0c6b-4a7d-93d3-0d3599890efe','b4ef30e9-9498-4886-99d8-c95e509861d4','2692af70-c7f7-4808-adfc-a49c2b32be1b','Bạn thân từ nhỏ, thường xuyên gặp mặt','2026-04-09 12:29:38.325');
/*!40000 ALTER TABLE `QuanHeDoiTuong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `QuanHeXaHoi`
--

DROP TABLE IF EXISTS `QuanHeXaHoi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `QuanHeXaHoi` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenQuanHe` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `QuanHeXaHoi_tenQuanHe_key` (`tenQuanHe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `QuanHeXaHoi`
--

LOCK TABLES `QuanHeXaHoi` WRITE;
/*!40000 ALTER TABLE `QuanHeXaHoi` DISABLE KEYS */;
INSERT INTO `QuanHeXaHoi` VALUES ('01b3793f-514b-4fee-8260-2a3ab59a107d','Em gái','Em gái ruột','2026-04-09 12:29:35.920','2026-04-09 12:29:35.920'),('03522cb1-5b88-4671-bf16-b8b14f9ea097','Con trai','Con trai (ruột hoặc nuôi)','2026-04-09 12:29:35.832','2026-04-09 12:29:35.832'),('12bf1bca-f7a3-40c8-8072-808f5772b90b','Mẹ','Mẹ đẻ, mẹ nuôi','2026-04-09 12:29:35.774','2026-04-09 12:29:35.774'),('2692af70-c7f7-4808-adfc-a49c2b32be1b','Bạn','Bạn bè thân thiết','2026-04-09 12:29:36.081','2026-04-09 12:29:36.081'),('45def985-ebe0-4e00-8707-8f68dbe99bda','Dì','Em gái của mẹ','2026-04-09 12:29:36.047','2026-04-09 12:29:36.047'),('6318817c-8a01-4f42-8ff8-1d516a7666ee','Chú','Em trai của cha','2026-04-09 12:29:35.991','2026-04-09 12:29:35.991'),('63ff846a-47f7-47d3-826c-958c3c089aa7','Ông nội','Cha của cha','2026-04-09 12:29:35.933','2026-04-09 12:29:35.933'),('71ab10d1-6598-4168-822e-eb661f59834c','Cậu','Anh em trai của mẹ','2026-04-09 12:29:36.031','2026-04-09 12:29:36.031'),('752cf620-c39b-4fe7-a8e0-d06ac307829c','Bác','Anh chị của cha/mẹ','2026-04-09 12:29:36.003','2026-04-09 12:29:36.003'),('76b43b58-8e5a-4494-a361-f27f1d994214','Con gái','Con gái (ruột hoặc nuôi)','2026-04-09 12:29:35.860','2026-04-09 12:29:35.860'),('82052be4-c888-4834-9138-a31803f83dc6','Chị gái','Chị gái ruột','2026-04-09 12:29:35.885','2026-04-09 12:29:35.885'),('8c3da2dc-51fb-46d9-bd80-5b45b693f3c7','Cô','Chị em gái của cha','2026-04-09 12:29:36.062','2026-04-09 12:29:36.062'),('988daba2-6c0c-4bfe-b513-e924a7933fb4','Vợ','Vợ (đã đăng ký kết hôn)','2026-04-09 12:29:35.803','2026-04-09 12:29:35.803'),('9b4ec49b-457a-484d-b60d-20e4ea8857dd','Em trai','Em trai ruột','2026-04-09 12:29:35.900','2026-04-09 12:29:35.900'),('9d02a2f2-bcb1-4a84-8053-f2a097ac3e20','Bà nội','Mẹ của cha','2026-04-09 12:29:35.946','2026-04-09 12:29:35.946'),('9fa267eb-f97c-411c-b521-f8c334e62d6c','Chồng','Chồng (đã đăng ký kết hôn)','2026-04-09 12:29:35.819','2026-04-09 12:29:35.819'),('ba159073-713a-48ae-a360-84cedeaeb683','Anh trai','Anh trai ruột','2026-04-09 12:29:35.872','2026-04-09 12:29:35.872'),('cce9b44b-d7ce-4863-8a2b-d48dd57cc18e','Cha','Cha đẻ, cha nuôi','2026-04-09 12:29:35.724','2026-04-09 12:29:35.724'),('d711d186-de91-4b1c-8acd-b7a4113b5e26','Ông ngoại','Cha của mẹ','2026-04-09 12:29:35.959','2026-04-09 12:29:35.959'),('fd40d53b-8aba-4e12-ba07-b5ead722ec61','Bà ngoại','Mẹ của mẹ','2026-04-09 12:29:35.979','2026-04-09 12:29:35.979');
/*!40000 ALTER TABLE `QuanHeXaHoi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Quyen`
--

DROP TABLE IF EXISTS `Quyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Quyen` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenQuyen` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Quyen_tenQuyen_key` (`tenQuyen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Quyen`
--

LOCK TABLES `Quyen` WRITE;
/*!40000 ALTER TABLE `Quyen` DISABLE KEYS */;
INSERT INTO `Quyen` VALUES ('0f9a7cd4-d78f-4cf5-803b-368b17eefb6c','quan-he-xa-hoi:update','Cập nhật quan hệ xã hội','2026-04-09 12:29:32.280','2026-04-29 01:09:35.620'),('11cb4dd6-338e-4da3-bca6-d9f3b4ad71cb','don-vi:create','Thêm đơn vị hành chính mới','2026-04-09 12:29:32.099','2026-04-29 01:09:35.490'),('125fe957-bd46-4a8f-ba45-3e98b1462d36','bieu-mau:update','Cập nhật biểu mẫu','2026-04-09 12:29:32.684','2026-04-29 01:09:35.855'),('18e2339a-b4b5-4d39-a760-20ff6a80568b','backup:create','Tạo backup mới','2026-04-09 12:29:31.847','2026-04-29 01:09:35.214'),('1aed0608-b349-4eba-92e5-98d9bc83db08','quan-he-xa-hoi:read','Xem danh sách quan hệ xã hội','2026-04-09 12:29:32.231','2026-04-29 01:09:35.591'),('21b8e0dc-852c-45a3-a9b9-6bb84353a85d','UPDATE_UNIT','Cập nhật đơn vị','2026-04-09 12:29:32.632','2026-04-29 01:09:35.801'),('21beecb9-6b8d-4cbb-a7c4-2ab743da448b','DELETE_USER','Xóa người dùng','2026-04-09 12:29:31.560','2026-04-29 01:09:34.932'),('226c6818-efd6-42c6-a523-09d52a40e633','toi-danh:read','Xem danh sách tội danh','2026-04-09 12:29:32.165','2026-04-29 01:09:35.533'),('237bf53e-cedf-4123-947b-d2659149f885','VIEW_USER','Xem danh sách người dùng','2026-04-09 12:29:31.506','2026-04-29 01:09:34.880'),('25312ec0-4dd5-4d66-9b58-25904e5e5c6c','thong-bao:read','Xem danh sách thông báo','2026-04-09 12:29:32.787','2026-04-29 01:09:35.939'),('264efb79-c2ff-457e-ad80-da796db7999a','don-vi:read','Xem danh sách đơn vị hành chính','2026-04-09 12:29:32.082','2026-04-29 01:09:35.479'),('2877d9e3-8551-4b42-b917-7690331e0939','danh-muc:read','Xem danh mục hệ thống','2026-04-09 12:29:32.501','2026-04-29 01:09:35.704'),('2a6c386b-5325-4f4e-8749-170e580d5048','bao-cao:export','Xuất báo cáo (Excel, PDF, Word)','2026-04-09 12:29:31.480','2026-04-29 01:09:34.855'),('2a7c23bc-ad29-49a0-8151-f2b8c39efbee','bieu-mau:read','Xem danh sách biểu mẫu','2026-04-09 12:29:32.658','2026-04-29 01:09:35.828'),('2bae05c8-d643-4d63-9dac-4e7bbee88446','backup:restore','Khôi phục từ backup','2026-04-09 12:29:31.873','2026-04-29 01:09:35.231'),('2bb1dccc-6002-49eb-a8cb-491896b9c5a9','bao-cao:read','Xem báo cáo và thống kê','2026-04-09 12:29:31.454','2026-04-29 01:09:34.832'),('2d2c53fe-1e64-4e6f-9737-25b86c4cbc5d','CREATE_QUAN_HE_XA_HOI','Tạo quan hệ xã hội mới','2026-04-09 12:29:32.415','2026-04-29 01:09:35.663'),('2e2c4fb3-702f-4113-99b2-70f9587a7642','CREATE_THONG_BAO','Tạo thông báo mới','2026-04-09 12:29:32.864','2026-04-29 01:09:36.020'),('2eacd8c0-6873-4b17-9319-c54208d3796a','DELETE_BIEU_MAU','Xóa biểu mẫu','2026-04-09 12:29:32.770','2026-04-29 01:09:35.924'),('342c70dd-0d3c-4655-9fc2-f0b01bc5a315','ho-so-vu-viec:create','Tạo vụ việc mới','2026-04-09 12:29:31.396','2026-04-29 01:09:34.776'),('36f2ccf0-b8cc-4e28-a63e-e877a6f053b3','UPDATE_THONG_BAO','Cập nhật thông báo','2026-04-09 12:29:32.879','2026-04-29 01:09:36.033'),('38dadef7-274c-4cde-bdfd-9fa136df9aa3','VIEW_THONG_BAO','Xem danh sách thông báo','2026-04-09 12:29:32.851','2026-04-29 01:09:36.004'),('39ebc8b4-b60d-44c9-9af6-b48265eb3be3','CREATE_BIEU_MAU','Tạo biểu mẫu mới','2026-04-09 12:29:32.737','2026-04-29 01:09:35.900'),('3a6270fd-6aa2-49b4-8061-3b87dd1ff9db','CREATE_CAU_HINH','Tạo cấu hình mới','2026-04-09 12:29:31.969','2026-04-29 01:09:35.375'),('3a828806-c669-462b-8bac-d05981b6270a','users:read','Xem danh sách người dùng','2026-04-09 12:29:31.676','2026-04-29 01:09:35.064'),('3f1c1a9f-7b4d-4604-9134-25870325cca4','ho-so-doi-tuong:delete','Xóa đối tượng','2026-04-09 12:29:31.359','2026-04-29 01:09:34.749'),('414641fd-f39b-4fb5-87e5-fbb3e8cf99c9','users:update','Chỉnh sửa người dùng','2026-04-09 12:29:31.706','2026-04-29 01:09:35.096'),('4445843b-297b-4911-b1ac-d0fdaad30cc4','ho-so-doi-tuong:create','Tạo đối tượng mới','2026-04-09 12:29:31.314','2026-04-29 01:09:34.714'),('4b57814e-736b-4f90-891b-80c88c25ad89','don-vi:delete','Xóa đơn vị hành chính','2026-04-09 12:29:32.139','2026-04-29 01:09:35.518'),('5a3d40c6-e9c2-4de0-a05f-424b80050c8d','users:delete','Xóa người dùng','2026-04-09 12:29:31.724','2026-04-29 01:09:35.110'),('62a861c8-5ba0-480a-9bde-a11f7834da7a','UPDATE_BIEU_MAU','Cập nhật biểu mẫu','2026-04-09 12:29:32.753','2026-04-29 01:09:35.913'),('678293df-d264-474a-8482-1bba2116700f','bieu-mau:create','Tạo biểu mẫu mới','2026-04-09 12:29:32.672','2026-04-29 01:09:35.841'),('6c217b4b-53a2-4947-bcb4-caf9854b8596','ASSIGN_ROLE','Phân quyền cho người dùng','2026-04-09 12:29:31.587','2026-04-29 01:09:34.966'),('713cbb53-22af-49fe-974b-fee4f51cd0c5','UPDATE_ROLE','Cập nhật vai trò','2026-04-09 12:29:31.644','2026-04-29 01:09:35.021'),('72f2d46a-ae94-406e-85bd-bb04ea07db6b','VIEW_UNIT','Xem danh sách đơn vị','2026-04-09 12:29:32.604','2026-04-29 01:09:35.771'),('78cac1c3-540d-4dad-8b62-85c0991547dd','BLOCK_USER','Khóa/Mở khóa người dùng','2026-04-09 12:29:31.573','2026-04-29 01:09:34.951'),('7c7d37b8-5a85-4aeb-87f9-bfdbbf3ec250','don-vi:update','Cập nhật đơn vị hành chính','2026-04-09 12:29:32.117','2026-04-29 01:09:35.504'),('8338a945-3a1a-48fa-85e5-fd851ee2e2c7','toi-danh:create','Tạo tội danh mới','2026-04-09 12:29:32.180','2026-04-29 01:09:35.548'),('8458741b-dc5e-4e07-b071-ae1f1ab805dc','ho-so-doi-tuong:read','Xem danh sách đối tượng','2026-04-09 12:29:31.217','2026-04-29 01:09:34.621'),('86859d67-9c97-4900-b1f5-953e0c9d445f','chatbot:manage','Quản lý tài liệu chatbot','2026-04-09 12:29:32.926','2026-04-29 01:09:36.069'),('8f697f96-185a-4d46-973e-1e2263b5e84d','backup:read','Xem danh sách backup','2026-04-09 12:29:31.831','2026-04-29 01:09:35.194'),('9137c289-0fe4-4757-ad66-7afa70190662','UPDATE_USER','Cập nhật thông tin người dùng','2026-04-09 12:29:31.544','2026-04-29 01:09:34.917'),('91a8c3da-b131-4109-8c09-d8b338147a9a','VIEW_ROLE','Xem danh sách vai trò','2026-04-09 12:29:31.600','2026-04-29 01:09:34.983'),('960c7b59-7c9d-46de-8455-7614db95700d','don-vi-to-chuc:create','Tạo đơn vị mới','2026-04-09 12:29:32.551','2026-04-29 01:09:35.732'),('969a1628-cb82-4174-a3cd-5c531b144310','VIEW_CAU_HINH','Xem cấu hình hệ thống','2026-04-09 12:29:31.956','2026-04-29 01:09:35.355'),('96bd5b52-a2c1-45c6-8fe3-6a516b88f446','toi-danh:update','Cập nhật tội danh','2026-04-09 12:29:32.192','2026-04-29 01:09:35.560'),('990013e7-12da-4f6c-8350-390d3d2b6e0f','CREATE_USER','Tạo người dùng mới','2026-04-09 12:29:31.527','2026-04-29 01:09:34.900'),('9b57bd37-ffa4-4b4a-9d2b-6e369906e686','DELETE_CAU_HINH','Xóa cấu hình','2026-04-09 12:29:31.994','2026-04-29 01:09:35.412'),('9c0e4a3d-6d8d-4ab8-9e88-105ac4f2d72b','ho-so-vu-viec:delete','Xóa vụ việc','2026-04-09 12:29:31.432','2026-04-29 01:09:34.811'),('9d55412e-67e9-4e76-af42-98bd8b73602a','DELETE_QUAN_HE_XA_HOI','Xóa quan hệ xã hội','2026-04-09 12:29:32.485','2026-04-29 01:09:35.688'),('a400cea3-257e-4827-a17e-f34a345315a1','users:create','Tạo người dùng mới','2026-04-09 12:29:31.690','2026-04-29 01:09:35.083'),('a487a54b-337d-4b20-bce9-1fca1e840d4f','DELETE_ROLE','Xóa vai trò','2026-04-09 12:29:31.660','2026-04-29 01:09:35.048'),('a7146442-63d6-4fa8-9cb3-9ee51d1b84ae','UPDATE_QUAN_HE_XA_HOI','Cập nhật quan hệ xã hội','2026-04-09 12:29:32.457','2026-04-29 01:09:35.674'),('a87c32d4-ffd8-4e64-93a6-3a46651d4707','CREATE_DON_VI_HANH_CHINH','Tạo đơn vị hành chính mới','2026-04-09 12:29:32.025','2026-04-29 01:09:35.438'),('a89018fa-ff6c-490d-82a9-c1a2d42fcab7','CREATE_UNIT','Tạo đơn vị mới','2026-04-09 12:29:32.616','2026-04-29 01:09:35.787'),('ac8f9b88-b132-477d-b4ba-761df518a449','CREATE_ROLE','Tạo vai trò mới','2026-04-09 12:29:31.616','2026-04-29 01:09:35.001'),('ad144bd6-04f4-419b-adfc-eb0558329410','roles:delete','Xóa vai trò','2026-04-09 12:29:31.816','2026-04-29 01:09:35.176'),('b1eba70d-dc1c-4b48-88a6-c836d9f5c247','thong-bao:create','Tạo thông báo mới','2026-04-09 12:29:32.813','2026-04-29 01:09:35.956'),('b40d0db2-1aa3-4a5b-87a7-1cb454947426','VIEW_BIEU_MAU','Xem danh sách biểu mẫu','2026-04-09 12:29:32.717','2026-04-29 01:09:35.884'),('b5e5d6d7-1e4e-4522-8323-59d253c5dd88','thong-bao:delete','Xóa thông báo','2026-04-09 12:29:32.838','2026-04-29 01:09:35.987'),('b96a3d80-a213-4c7a-8bf5-f5e1b9117cf1','VIEW_QUAN_HE_XA_HOI','Xem danh sách quan hệ xã hội','2026-04-09 12:29:32.316','2026-04-29 01:09:35.648'),('bb8df150-0a9e-4772-82e9-463794e0ef57','settings:read','Xem cấu hình hệ thống','2026-04-09 12:29:31.887','2026-04-29 01:09:35.257'),('bc517fc0-91d0-47ff-b330-2269b5ca40ba','tai-lieu:read','Xem danh sách tài liệu','2026-04-09 12:29:31.917','2026-04-29 01:09:35.297'),('c17a9d4e-917f-4fac-bf1e-7d3adab32864','thong-bao:update','Cập nhật thông báo','2026-04-09 12:29:32.826','2026-04-29 01:09:35.971'),('c537c010-8dd9-431f-a14a-a4ea82cc18e6','DELETE_UNIT','Xóa đơn vị','2026-04-09 12:29:32.645','2026-04-29 01:09:35.816'),('c60a4ec1-b6da-4917-be16-0ddfc889e62f','chatbot:read','Sử dụng chatbot','2026-04-09 12:29:32.907','2026-04-29 01:09:36.056'),('ce299cde-c61c-4af1-8e7e-ab12fe324681','roles:read','Xem vai trò','2026-04-09 12:29:31.743','2026-04-29 01:09:35.126'),('ce9e90ce-e69b-4160-b11e-2b69e39d0150','roles:update','Chỉnh sửa vai trò','2026-04-09 12:29:31.794','2026-04-29 01:09:35.160'),('cf191a8a-7671-4ed6-a660-4eda48a422cb','don-vi-to-chuc:read','Xem danh sách đơn vị','2026-04-09 12:29:32.517','2026-04-29 01:09:35.718'),('d1d34627-fa4c-4516-8795-4dd2a47d5ab7','VIEW_DON_VI_HANH_CHINH','Xem danh sách đơn vị hành chính','2026-04-09 12:29:32.009','2026-04-29 01:09:35.425'),('d30c265a-a55d-48f0-a058-90fb5efa7902','ho-so-vu-viec:read','Xem danh sách vụ việc','2026-04-09 12:29:31.380','2026-04-29 01:09:34.760'),('d358d5f0-c40a-4845-9f19-97fc58263876','don-vi-to-chuc:update','Cập nhật đơn vị','2026-04-09 12:29:32.567','2026-04-29 01:09:35.743'),('d3e6f159-d345-4f12-b8d6-c8355b6f7423','tai-lieu:create','Tải lên tài liệu mới','2026-04-09 12:29:31.933','2026-04-29 01:09:35.313'),('d461803b-666a-4493-ba06-e1ddb898ba55','toi-danh:delete','Xóa tội danh','2026-04-09 12:29:32.206','2026-04-29 01:09:35.574'),('d4b31e0c-f8bc-4558-b9be-be340beb1fef','roles:create','Tạo vai trò mới','2026-04-09 12:29:31.765','2026-04-29 01:09:35.142'),('d5b850cd-ce5d-4cf8-8b18-11b40762441a','settings:update','Cập nhật cấu hình hệ thống','2026-04-09 12:29:31.904','2026-04-29 01:09:35.276'),('d9f5b23a-de4b-41f9-b46d-44d759fe0f5b','UPDATE_CAU_HINH','Cập nhật cấu hình hệ thống','2026-04-09 12:29:31.981','2026-04-29 01:09:35.392'),('da76b019-487f-46d1-add1-77d3e9939fa2','ho-so-vu-viec:update','Chỉnh sửa vụ việc','2026-04-09 12:29:31.415','2026-04-29 01:09:34.795'),('e12ed588-93bb-4956-9fd5-e3efb68eacf9','quan-he-xa-hoi:create','Tạo quan hệ xã hội mới','2026-04-09 12:29:32.249','2026-04-29 01:09:35.607'),('e3c65cde-96dc-4a28-8231-0699f1b06a15','tai-lieu:delete','Xóa tài liệu','2026-04-09 12:29:31.944','2026-04-29 01:09:35.332'),('e57cba94-336d-4c90-8421-8d24255a4741','ho-so-doi-tuong:update','Chỉnh sửa đối tượng','2026-04-09 12:29:31.338','2026-04-29 01:09:34.735'),('e70df534-f620-4bdc-8784-c16118b122cc','bieu-mau:delete','Xóa biểu mẫu','2026-04-09 12:29:32.701','2026-04-29 01:09:35.870'),('f4aa069b-b6b1-48f9-b5d6-bc996a0ff33e','DELETE_THONG_BAO','Xóa thông báo','2026-04-09 12:29:32.894','2026-04-29 01:09:36.041'),('f65a4261-3425-44e1-9310-7f12f0ad47aa','DELETE_DON_VI_HANH_CHINH','Xóa đơn vị hành chính','2026-04-09 12:29:32.066','2026-04-29 01:09:35.467'),('f8e01cae-ea93-4660-af4e-dbdf8f043d47','UPDATE_DON_VI_HANH_CHINH','Cập nhật đơn vị hành chính','2026-04-09 12:29:32.051','2026-04-29 01:09:35.452'),('fd1a49a2-ead8-4a9f-8afe-72bafbcce830','quan-he-xa-hoi:delete','Xóa quan hệ xã hội','2026-04-09 12:29:32.301','2026-04-29 01:09:35.633'),('fea63ce2-1b4d-4b39-b716-cbcaa76f519e','don-vi-to-chuc:delete','Xóa đơn vị','2026-04-09 12:29:32.593','2026-04-29 01:09:35.758');
/*!40000 ALTER TABLE `Quyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaiLieuDoiTuong`
--

DROP TABLE IF EXISTS `TaiLieuDoiTuong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiLieuDoiTuong` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doiTuongId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenTaiLieu` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiTaiLieu` enum('HINH_ANH','VIDEO','TAI_LIEU','CHUNG_CU_SO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duongDan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kichThuoc` int DEFAULT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaiLieuDoiTuong_doiTuongId_fkey` (`doiTuongId`),
  CONSTRAINT `TaiLieuDoiTuong_doiTuongId_fkey` FOREIGN KEY (`doiTuongId`) REFERENCES `HoSoDoiTuong` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiLieuDoiTuong`
--

LOCK TABLES `TaiLieuDoiTuong` WRITE;
/*!40000 ALTER TABLE `TaiLieuDoiTuong` DISABLE KEYS */;
INSERT INTO `TaiLieuDoiTuong` VALUES ('0f23a596-4ece-4d5e-874c-ca81e1927801','1c64b449-baf2-4832-8817-0506c955d2b9','DE44.pdf','CHUNG_CU_SO','uploads\\tai-lieu\\doi-tuong\\file-1779236693190-721503142.pdf',732134,NULL,'2026-05-20 00:24:53.289'),('16c8da7e-56ca-430e-8134-68e4d03838e8','b2538a89-0c6b-4a7d-93d3-0d3599890efe','Ảnh chụp CCCD','HINH_ANH','/uploads/tai-lieu/cccd-nguyen-van-an.jpg',524288,'Ảnh chụp CCCD 2 mặt','2026-04-09 12:29:38.546'),('365a0b3c-b25c-4a2c-9143-860f7939beb1','b2538a89-0c6b-4a7d-93d3-0d3599890efe','Biên bản lấy lời khai','TAI_LIEU','/uploads/tai-lieu/bb-loi-khai-an.pdf',1048576,'Biên bản lấy lời khai lần 1','2026-04-09 12:29:38.565'),('7f15d9bb-c70f-4088-85c0-80d1b519594f','b4ef30e9-9498-4886-99d8-c95e509861d4','Video camera an ninh','VIDEO','/uploads/tai-lieu/camera-cuong.mp4',10485760,'Video ghi hình tại hiện trường','2026-04-09 12:29:38.593'),('8e5565ef-0a88-44de-858c-e619a222cc4c','b2a2f0b8-cfb5-4db8-b0c1-176923abfd61','Ảnh chụp CCCD','HINH_ANH','/uploads/tai-lieu/cccd-tran-thi-binh.jpg',512000,NULL,'2026-04-09 12:29:38.577'),('aa9d8d2b-23cc-4c03-b323-c79f2222a81f','b4ef30e9-9498-4886-99d8-c95e509861d4','Bản án năm 2016','CHUNG_CU_SO','/uploads/tai-lieu/ban-an-cuong-2016.pdf',2097152,NULL,'2026-04-09 12:29:38.604'),('fc315272-91df-4264-a532-7bfdc0fcda06','7d20e605-0523-4237-8950-3802621b65be','de-hoc-ky-1-toan-9-nam-2025-2026-truong-thcs-nghia-an-nghe-an.pdf','TAI_LIEU','uploads\\tai-lieu\\doi-tuong\\file-1777944630903-359099425.pdf',398134,NULL,'2026-05-05 01:30:30.921');
/*!40000 ALTER TABLE `TaiLieuDoiTuong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaiLieuVuViec`
--

DROP TABLE IF EXISTS `TaiLieuVuViec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiLieuVuViec` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vuViecId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenTaiLieu` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiTaiLieu` enum('HINH_ANH','VIDEO','TAI_LIEU','CHUNG_CU_SO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duongDan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kichThuoc` int DEFAULT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaiLieuVuViec_vuViecId_fkey` (`vuViecId`),
  CONSTRAINT `TaiLieuVuViec_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiLieuVuViec`
--

LOCK TABLES `TaiLieuVuViec` WRITE;
/*!40000 ALTER TABLE `TaiLieuVuViec` DISABLE KEYS */;
INSERT INTO `TaiLieuVuViec` VALUES ('100ab17b-96c3-43d6-8a00-ecc4f26c196c','0d41aa2b-7a7a-4347-925e-05a5e59924f0','Ảnh hiện trường','HINH_ANH','/uploads/tai-lieu/hien-truong-danh-nhau.jpg',819200,NULL,'2026-04-09 12:29:38.663'),('4d1bb187-ec6b-43e1-ade9-0e1b9ce94e34','e6616241-039b-4c14-9118-48fddfd35c55','Sao kê giao dịch ngân hàng','CHUNG_CU_SO','/uploads/tai-lieu/sao-ke-ngan-hang.pdf',2097152,'Sao kê tài khoản nạn nhân và đối tượng','2026-04-09 12:29:38.688'),('6abfd018-52dd-43e8-9fbd-a39919e0fab6','0d41aa2b-7a7a-4347-925e-05a5e59924f0','Giấy xác nhận thương tích','CHUNG_CU_SO','/uploads/tai-lieu/xac-nhan-thuong-tich.pdf',524288,NULL,'2026-04-09 12:29:38.676'),('6bb9525d-4c57-456d-9a8e-06e2114d4477','65a40e55-13a2-4afa-ae45-649c0460fe59','Biên bản khám nghiệm hiện trường','TAI_LIEU','/uploads/tai-lieu/bb-kham-nghiem-hs001.pdf',1572864,NULL,'2026-04-09 12:29:38.644'),('a6d11e98-6177-4b6d-98f8-2ada70ef8c6f','65a40e55-13a2-4afa-ae45-649c0460fe59','Video camera bãi xe','VIDEO','/uploads/tai-lieu/camera-bai-xe.mp4',15728640,'Video camera ghi hình toàn cảnh vụ trộm','2026-04-09 12:29:38.623');
/*!40000 ALTER TABLE `TaiLieuVuViec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThongBao`
--

DROP TABLE IF EXISTS `ThongBao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThongBao` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tieuDe` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noiDung` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiThongBao` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uu_tien` int NOT NULL DEFAULT '1',
  `trangThai` tinyint(1) NOT NULL DEFAULT '1',
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao`
--

LOCK TABLES `ThongBao` WRITE;
/*!40000 ALTER TABLE `ThongBao` DISABLE KEYS */;
INSERT INTO `ThongBao` VALUES ('0982cc9a-8325-4c39-8651-7d7c80a9f839','Quy định về bảo mật thông tin','Các quy định về bảo mật thông tin trong quá trình sử dụng hệ thống','QUY_DINH',3,1,'2026-04-09 12:29:37.135','2026-04-09 12:29:37.135'),('0c8329d8-ba88-439a-b214-d1eff7d88863','Khóa đào tạo sử dụng hệ thống','Khóa đào tạo sử dụng hệ thống sẽ được tổ chức vào ngày 20/04/2026','THONG_BAO',2,1,'2026-04-09 12:29:37.266','2026-04-09 12:29:37.266'),('0f601472-c606-4f98-916e-8422ee920c86','Bảo trì hệ thống định kỳ','Hệ thống sẽ bảo trì định kỳ vào cuối tuần, từ 23:00 thứ 7 đến 6:00 chủ nhật','THONG_BAO',1,1,'2026-04-09 12:29:37.182','2026-04-09 12:29:37.182'),('12f5ea0c-e67d-43d1-91ad-f17f3e09d807','Khóa đào tạo sử dụng hệ thống','Khóa đào tạo sử dụng hệ thống sẽ được tổ chức vào ngày 20/04/2026','THONG_BAO',2,1,'2026-04-29 01:09:38.089','2026-04-29 01:09:38.089'),('187a0285-3a12-4ead-8974-44adc096eef0','Quy trình xử lý hồ sơ vụ việc','Hướng dẫn quy trình tạo mới, cập nhật và xử lý hồ sơ vụ việc','HUONG_DAN',2,1,'2026-04-09 12:29:37.207','2026-04-09 12:29:37.207'),('349d2a2c-0017-4028-85af-55f08f473cd4','Hướng dẫn sử dụng hệ thống QLCNC','Tài liệu hướng dẫn chi tiết sử dụng hệ thống quản lý đối tượng vi phạm pháp luật','HUONG_DAN',3,1,'2026-04-09 12:29:37.105','2026-04-09 12:29:37.105'),('34dbe84e-aa0c-41c2-8d78-2f819fd3e247','Quy định về backup dữ liệu','Hệ thống tự động backup dữ liệu hàng ngày lúc 2:00 AM','QUY_DINH',2,1,'2026-04-09 12:29:37.232','2026-04-09 12:29:37.232'),('44280b23-bb29-4a8d-a9ad-f2d25e48889c','Bảo trì hệ thống định kỳ','Hệ thống sẽ bảo trì định kỳ vào cuối tuần, từ 23:00 thứ 7 đến 6:00 chủ nhật','THONG_BAO',1,1,'2026-04-29 01:09:38.009','2026-04-29 01:09:38.009'),('4b9d8fcd-f4ec-47d9-b652-c3f43a3103de','Hướng dẫn sử dụng hệ thống QLCNC','Tài liệu hướng dẫn chi tiết sử dụng hệ thống quản lý đối tượng vi phạm pháp luật','HUONG_DAN',3,1,'2026-04-29 01:09:37.966','2026-04-29 01:09:37.966'),('5ba3a88d-673c-4f9e-9df6-48715215d759','Hotline hỗ trợ kỹ thuật','Liên hệ: 0236.3822.179 (giờ hành chính) để được hỗ trợ kỹ thuật','THONG_BAO',1,1,'2026-04-29 01:09:38.076','2026-04-29 01:09:38.076'),('65bded7d-6d33-4de6-bc06-7f5cb9a4e3d6','Hotline hỗ trợ kỹ thuật','Liên hệ: 0236.3822.179 (giờ hành chính) để được hỗ trợ kỹ thuật','THONG_BAO',1,1,'2026-04-09 12:29:37.255','2026-04-09 12:29:37.255'),('7f2e190d-65d8-4f87-af03-09f1e647765c','Quy định về backup dữ liệu','Hệ thống tự động backup dữ liệu hàng ngày lúc 2:00 AM','QUY_DINH',2,1,'2026-04-29 01:09:38.051','2026-04-29 01:09:38.051'),('85ca5cf8-af5c-4d9e-914c-8aaf8f6cf9a2','Nâng cấp hệ thống ngày 15/04/2026','Hệ thống sẽ nâng cấp vào lúc 22:00 ngày 15/04/2026, thời gian dự kiến 2 giờ','THONG_BAO',2,1,'2026-04-09 12:29:37.164','2026-04-09 12:29:37.164'),('937ac30f-2d03-4676-b15a-fa2987dcbdcc','Chính sách mật khẩu','Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt','QUY_DINH',2,1,'2026-04-09 12:29:37.243','2026-04-09 12:29:37.243'),('a362e2af-8471-4628-9a77-108d48571d0c','Quy trình nhập dữ liệu hồ sơ đối tượng','Hướng dẫn chi tiết quy trình nhập, cập nhật thông tin hồ sơ đối tượng','HUONG_DAN',2,1,'2026-04-09 12:29:37.195','2026-04-09 12:29:37.195'),('b63fbc79-515e-4cfc-96af-4de0fc06272b','Chính sách mật khẩu','Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt','QUY_DINH',2,1,'2026-04-29 01:09:38.062','2026-04-29 01:09:38.062'),('c770f26c-0a2a-45d0-9256-86b3c6654f7e','Nâng cấp hệ thống ngày 15/04/2026','Hệ thống sẽ nâng cấp vào lúc 22:00 ngày 15/04/2026, thời gian dự kiến 2 giờ','THONG_BAO',2,1,'2026-04-29 01:09:37.997','2026-04-29 01:09:37.997'),('ce51bf0a-67f1-4895-9a49-aeb33d50b53e','Quy trình xử lý hồ sơ vụ việc','Hướng dẫn quy trình tạo mới, cập nhật và xử lý hồ sơ vụ việc','HUONG_DAN',2,1,'2026-04-29 01:09:38.037','2026-04-29 01:09:38.037'),('de95e788-4811-469c-9ba5-ab451f5228bd','Quy định về bảo mật thông tin','Các quy định về bảo mật thông tin trong quá trình sử dụng hệ thống','QUY_DINH',3,1,'2026-04-29 01:09:37.983','2026-04-29 01:09:37.983'),('f4b5200f-df28-466a-abb0-efb0df3063c3','Quy trình nhập dữ liệu hồ sơ đối tượng','Hướng dẫn chi tiết quy trình nhập, cập nhật thông tin hồ sơ đối tượng','HUONG_DAN',2,1,'2026-04-29 01:09:38.022','2026-04-29 01:09:38.022');
/*!40000 ALTER TABLE `ThongBao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ToimDanh`
--

DROP TABLE IF EXISTS `ToimDanh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ToimDanh` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `khungHinhPhat` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ToimDanh_ma_key` (`ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ToimDanh`
--

LOCK TABLES `ToimDanh` WRITE;
/*!40000 ALTER TABLE `ToimDanh` DISABLE KEYS */;
INSERT INTO `ToimDanh` VALUES ('00437df8-8de4-4e7d-ba60-cde621fe6477','TD004','Cướp tài sản','Dùng vũ lực hoặc đe dọa dùng vũ lực chiếm đoạt tài sản','3 năm - Tử hình','2026-04-09 12:29:36.163','2026-04-09 12:29:36.163'),('091e9c51-826d-424f-bf04-63907b2dc7ce','TD010','Cưỡng đoạt tài sản','Dùng vũ lực, đe dọa buộc người khác giao tài sản','6 tháng - 20 năm tù','2026-04-09 12:29:36.265','2026-04-09 12:29:36.265'),('1b2ce332-3690-4ea8-a144-45dd9e10b921','TD024','Tàng trữ vũ khí trái phép','Tàng trữ vũ khí quân dụng không được phép','1 năm - 15 năm tù','2026-04-09 12:29:36.487','2026-04-09 12:29:36.487'),('1e7b65a5-d08b-48f1-adfb-cb8ad69ee295','TD011','Đánh bạc','Tham gia đánh bạc hoặc tổ chức đánh bạc','Phạt tiền - 7 năm tù','2026-04-09 12:29:36.290','2026-04-09 12:29:36.290'),('2ac06bbf-b3a6-4ad2-9a9c-e930f52110f4','TD001','Giết người','Cố ý tước đoạt mạng sống của người khác','12 năm tù - Tử hình','2026-04-09 12:29:36.103','2026-04-09 12:29:36.103'),('45cf4fef-36a7-459e-9f21-2944d5f6fc1f','TD006','Hiếp dâm','Giao cấu với người khác trái với ý muốn','2 năm - Tử hình','2026-04-09 12:29:36.202','2026-04-09 12:29:36.202'),('5bd7b886-991e-4f66-9658-169d3583533e','TD016','Hủy hoại tài sản','Phá hủy, làm hư hỏng tài sản của người khác','Phạt tiền - 15 năm tù','2026-04-09 12:29:36.362','2026-04-09 12:29:36.362'),('6614b0c1-4093-47d0-b6bf-f6ede4715ca2','TD002','Cố ý gây thương tích','Cố ý gây tổn hại cho sức khỏe người khác','6 tháng - 20 năm tù','2026-04-09 12:29:36.130','2026-04-09 12:29:36.130'),('6956d98f-0093-456e-9374-253747d967ab','TD021','Làm nhục người khác','Xúc phạm nghiêm trọng danh dự, nhân phẩm người khác','Phạt tiền - 3 năm tù','2026-04-09 12:29:36.439','2026-04-09 12:29:36.439'),('6d6de6ea-a1da-4076-92d1-e3a889914aed','TD014','Đe dọa giết người','Đe dọa sẽ giết người khác','Phạt tiền - 5 năm tù','2026-04-09 12:29:36.332','2026-04-09 12:29:36.332'),('7189fcdb-9e77-407e-9c43-342033001a54','TD009','Lừa đảo chiếm đoạt tài sản','Dùng thủ đoạn gian dối chiếm đoạt tài sản','6 tháng - 20 năm tù','2026-04-09 12:29:36.250','2026-04-09 12:29:36.250'),('767f0b47-fd8c-4171-b17e-9225c3d0c420','TD018','Chống người thi hành công vụ','Cản trở, chống đối người đang thi hành công vụ','6 tháng - 7 năm tù','2026-04-09 12:29:36.399','2026-04-09 12:29:36.399'),('794ff0b2-a574-4ac5-8ead-c8a325ca0711','TD025','Buôn lậu','Vận chuyển hàng hóa qua biên giới trái phép','Phạt tiền - 20 năm tù','2026-04-09 12:29:36.503','2026-04-09 12:29:36.503'),('920e3d6b-b559-4f5b-9c4d-0bf9caf24458','TD017','Tổ chức đánh bạc','Tổ chức, điều hành sòng bạc','3 năm - 15 năm tù','2026-04-09 12:29:36.384','2026-04-09 12:29:36.384'),('afe5d1f2-c9a7-4453-a6ae-7ca91fbd046a','TD003','Trộm cắp tài sản','Chiếm đoạt tài sản của người khác trái phép','6 tháng - 20 năm tù','2026-04-09 12:29:36.148','2026-04-09 12:29:36.148'),('b9cb9b7c-9057-46cd-929e-df789f2900af','TD015','Cưỡng đoạt tài sản','Chiếm đoạt tài sản bằng cách uy hiếp','6 tháng - 20 năm tù','2026-04-09 12:29:36.346','2026-04-09 12:29:36.346'),('c47fedb2-b5f6-4910-b2e0-6fd85fc55021','TD022','Trộm cắp điện','Ăn cắp điện năng','Phạt tiền - 7 năm tù','2026-04-09 12:29:36.452','2026-04-09 12:29:36.452'),('c9343851-d09a-4a02-aa07-a783344cdb2f','TD008','Tàng trữ ma túy','Tàng trữ trái phép chất ma túy','1 năm - Tử hình','2026-04-09 12:29:36.233','2026-04-09 12:29:36.233'),('d55d61de-8d64-4719-a288-da2fc089588b','TD020','Sử dụng tài liệu giả','Sử dụng tài liệu giả của cơ quan, tổ chức','Phạt tiền - 15 năm tù','2026-04-09 12:29:36.428','2026-04-09 12:29:36.428'),('e5f74e57-dc77-4c46-8567-fc9b2c7c7cca','TD005','Cướp giật tài sản','Công khai chiếm đoạt tài sản bằng cách giật, chộp','6 tháng - 20 năm tù','2026-04-09 12:29:36.187','2026-04-09 12:29:36.187'),('ea0b2a98-949d-442d-9c53-9c40c395960c','TD007','Mua bán ma túy','Mua bán, vận chuyển trái phép chất ma túy','2 năm - Tử hình','2026-04-09 12:29:36.216','2026-04-09 12:29:36.216'),('ec775aca-4b14-464f-8a75-d533c72d3b1a','TD019','Làm giả tài liệu','Làm giả con dấu, tài liệu của cơ quan, tổ chức','1 năm - 20 năm tù','2026-04-09 12:29:36.414','2026-04-09 12:29:36.414'),('ef443d79-b581-4f09-ba52-0c292776c0ba','TD012','Chứa mại dâm','Tổ chức, chứa chấp hoạt động mại dâm','1 năm - 15 năm tù','2026-04-09 12:29:36.307','2026-04-09 12:29:36.307'),('f5bf9c2d-306d-495f-96a5-7028f1ab1500','TD023','Làm rối loạn trật tự công cộng','Gây rối, làm mất trật tự nơi công cộng','Phạt tiền - 3 năm tù','2026-04-09 12:29:36.464','2026-04-09 12:29:36.464'),('fce7f6e7-fd4d-4a69-ac0f-83abd56e3ed5','TD013','Môi giới mại dâm','Làm trung gian môi giới hoạt động mại dâm','1 năm - 10 năm tù','2026-04-09 12:29:36.319','2026-04-09 12:29:36.319');
/*!40000 ALTER TABLE `ToimDanh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VaiTro`
--

DROP TABLE IF EXISTS `VaiTro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VaiTro` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenVaiTro` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ngayCapNhat` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VaiTro_tenVaiTro_key` (`tenVaiTro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VaiTro`
--

LOCK TABLES `VaiTro` WRITE;
/*!40000 ALTER TABLE `VaiTro` DISABLE KEYS */;
INSERT INTO `VaiTro` VALUES ('0accbc5d-4cfe-4747-b140-d5a9e599be41','Admin','Quản trị viên - Full quyền','2026-04-09 12:29:32.958','2026-04-09 12:29:32.958'),('393c1d37-b949-4349-a261-b7c59231e2ed','Cán bộ nghiệp vụ','Cán bộ nghiệp vụ - Quản lý hồ sơ, vụ việc, tài liệu','2026-04-09 12:29:34.728','2026-04-09 12:29:34.728'),('a38cd17a-1e24-414e-b8d6-8d82167fb69d','Lãnh đạo','Lãnh đạo - Xem danh sách, báo cáo, thống kê','2026-04-09 12:29:34.507','2026-04-09 12:29:34.507');
/*!40000 ALTER TABLE `VaiTro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VaiTroNguoiDung`
--

DROP TABLE IF EXISTS `VaiTroNguoiDung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VaiTroNguoiDung` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiDungId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaiTroId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VaiTroNguoiDung_nguoiDungId_vaiTroId_key` (`nguoiDungId`,`vaiTroId`),
  KEY `VaiTroNguoiDung_vaiTroId_idx` (`vaiTroId`),
  KEY `VaiTroNguoiDung_nguoiDungId_idx` (`nguoiDungId`),
  CONSTRAINT `VaiTroNguoiDung_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VaiTroNguoiDung_vaiTroId_fkey` FOREIGN KEY (`vaiTroId`) REFERENCES `VaiTro` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VaiTroNguoiDung`
--

LOCK TABLES `VaiTroNguoiDung` WRITE;
/*!40000 ALTER TABLE `VaiTroNguoiDung` DISABLE KEYS */;
INSERT INTO `VaiTroNguoiDung` VALUES ('ddac630f-0949-4df9-8fca-273591ede9fb','8d0885e1-e4af-463f-a682-4d432aa655cc','a38cd17a-1e24-414e-b8d6-8d82167fb69d'),('f26ad462-fa4c-45f7-9b95-b1b29e1550cf','956a69c4-495a-4ce8-8e9a-666ac74bdcf1','0accbc5d-4cfe-4747-b140-d5a9e599be41'),('3694535e-4a48-48b7-a8ab-fdd439b30620','f56c5165-c118-4da8-a37a-40b2ca386389','393c1d37-b949-4349-a261-b7c59231e2ed');
/*!40000 ALTER TABLE `VaiTroNguoiDung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VaiTroQuyen`
--

DROP TABLE IF EXISTS `VaiTroQuyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VaiTroQuyen` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaiTroId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quyenId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VaiTroQuyen_vaiTroId_quyenId_key` (`vaiTroId`,`quyenId`),
  KEY `VaiTroQuyen_quyenId_idx` (`quyenId`),
  KEY `VaiTroQuyen_vaiTroId_idx` (`vaiTroId`),
  CONSTRAINT `VaiTroQuyen_quyenId_fkey` FOREIGN KEY (`quyenId`) REFERENCES `Quyen` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VaiTroQuyen_vaiTroId_fkey` FOREIGN KEY (`vaiTroId`) REFERENCES `VaiTro` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VaiTroQuyen`
--

LOCK TABLES `VaiTroQuyen` WRITE;
/*!40000 ALTER TABLE `VaiTroQuyen` DISABLE KEYS */;
INSERT INTO `VaiTroQuyen` VALUES ('9f5fd5d7-bda1-4b30-bdcf-e17c53f3faa4','0accbc5d-4cfe-4747-b140-d5a9e599be41','0f9a7cd4-d78f-4cf5-803b-368b17eefb6c'),('d87c1a67-fa29-45df-ac32-5c4a46ffceb7','0accbc5d-4cfe-4747-b140-d5a9e599be41','11cb4dd6-338e-4da3-bca6-d9f3b4ad71cb'),('7ecdb88d-aa80-4984-a021-a2f210dfea52','0accbc5d-4cfe-4747-b140-d5a9e599be41','125fe957-bd46-4a8f-ba45-3e98b1462d36'),('fd2b8320-f386-4030-95d4-2ab7e0fd2c1a','0accbc5d-4cfe-4747-b140-d5a9e599be41','18e2339a-b4b5-4d39-a760-20ff6a80568b'),('ce9a1c07-9a6d-42f5-b257-6c467f8b1729','0accbc5d-4cfe-4747-b140-d5a9e599be41','1aed0608-b349-4eba-92e5-98d9bc83db08'),('f80f1829-7de1-4663-8cce-908d0170dbb6','0accbc5d-4cfe-4747-b140-d5a9e599be41','21b8e0dc-852c-45a3-a9b9-6bb84353a85d'),('81ab17d2-fa67-4609-b7c6-dfaac3f2c0b2','0accbc5d-4cfe-4747-b140-d5a9e599be41','21beecb9-6b8d-4cbb-a7c4-2ab743da448b'),('a71f3f56-052a-4ebc-96b5-5890de4e197c','0accbc5d-4cfe-4747-b140-d5a9e599be41','226c6818-efd6-42c6-a523-09d52a40e633'),('20c41f15-b544-4d37-9603-f8b2cadc6c2d','0accbc5d-4cfe-4747-b140-d5a9e599be41','237bf53e-cedf-4123-947b-d2659149f885'),('8a7fe940-11ce-4ef3-a7fc-6a777128c5c1','0accbc5d-4cfe-4747-b140-d5a9e599be41','25312ec0-4dd5-4d66-9b58-25904e5e5c6c'),('48eabad5-ff5c-4f11-902d-857783a161c9','0accbc5d-4cfe-4747-b140-d5a9e599be41','264efb79-c2ff-457e-ad80-da796db7999a'),('b3fed1c4-d6d0-417e-8e00-944673a89364','0accbc5d-4cfe-4747-b140-d5a9e599be41','2877d9e3-8551-4b42-b917-7690331e0939'),('f851b6b7-6c7b-4c56-8d88-f3e14bc501a0','0accbc5d-4cfe-4747-b140-d5a9e599be41','2a6c386b-5325-4f4e-8749-170e580d5048'),('332ddadf-c9c9-45ed-a195-68d3216bad99','0accbc5d-4cfe-4747-b140-d5a9e599be41','2a7c23bc-ad29-49a0-8151-f2b8c39efbee'),('181cb597-3815-41b0-9cca-e35d9c44aed1','0accbc5d-4cfe-4747-b140-d5a9e599be41','2bae05c8-d643-4d63-9dac-4e7bbee88446'),('e9d24794-2bd4-4c92-8da2-6b5504ce2573','0accbc5d-4cfe-4747-b140-d5a9e599be41','2bb1dccc-6002-49eb-a8cb-491896b9c5a9'),('a046eb9d-4134-422c-9010-175bcc1b3782','0accbc5d-4cfe-4747-b140-d5a9e599be41','2d2c53fe-1e64-4e6f-9737-25b86c4cbc5d'),('5f703ba8-726d-4aa7-a5aa-74f2bcfc76a3','0accbc5d-4cfe-4747-b140-d5a9e599be41','2e2c4fb3-702f-4113-99b2-70f9587a7642'),('338cf852-5951-4826-b1dc-1b37bf6eee2e','0accbc5d-4cfe-4747-b140-d5a9e599be41','2eacd8c0-6873-4b17-9319-c54208d3796a'),('867c778f-edec-49b9-9c40-0b61272cda88','0accbc5d-4cfe-4747-b140-d5a9e599be41','342c70dd-0d3c-4655-9fc2-f0b01bc5a315'),('105c0345-bf4e-4ad1-aef7-c49916720d5b','0accbc5d-4cfe-4747-b140-d5a9e599be41','36f2ccf0-b8cc-4e28-a63e-e877a6f053b3'),('dd051a65-f6bd-4e5f-bb90-28adde69944a','0accbc5d-4cfe-4747-b140-d5a9e599be41','38dadef7-274c-4cde-bdfd-9fa136df9aa3'),('93f95e2f-2948-4c93-be03-3387f27f213e','0accbc5d-4cfe-4747-b140-d5a9e599be41','39ebc8b4-b60d-44c9-9af6-b48265eb3be3'),('b22d013e-108a-4227-bb80-b0e74145e289','0accbc5d-4cfe-4747-b140-d5a9e599be41','3a6270fd-6aa2-49b4-8061-3b87dd1ff9db'),('35e2bce6-e27c-4b49-91c1-f64177f61fe6','0accbc5d-4cfe-4747-b140-d5a9e599be41','3a828806-c669-462b-8bac-d05981b6270a'),('0d94eaf3-5147-4475-a5d4-2994cbcde17d','0accbc5d-4cfe-4747-b140-d5a9e599be41','3f1c1a9f-7b4d-4604-9134-25870325cca4'),('6fd9042d-6f47-4ad5-81f2-5b06a7557d2b','0accbc5d-4cfe-4747-b140-d5a9e599be41','414641fd-f39b-4fb5-87e5-fbb3e8cf99c9'),('554f5d0c-1308-4e4f-926f-dbb524d7623d','0accbc5d-4cfe-4747-b140-d5a9e599be41','4445843b-297b-4911-b1ac-d0fdaad30cc4'),('ca2c4483-9f29-4e3f-9c20-23b3db3b01fa','0accbc5d-4cfe-4747-b140-d5a9e599be41','4b57814e-736b-4f90-891b-80c88c25ad89'),('f8e107f6-7422-4d5e-912a-fa12fb78a208','0accbc5d-4cfe-4747-b140-d5a9e599be41','5a3d40c6-e9c2-4de0-a05f-424b80050c8d'),('98b60bcc-05f3-4311-872f-8323792337e9','0accbc5d-4cfe-4747-b140-d5a9e599be41','62a861c8-5ba0-480a-9bde-a11f7834da7a'),('d46d713d-3ee5-4730-9fe2-01b69230ad7d','0accbc5d-4cfe-4747-b140-d5a9e599be41','678293df-d264-474a-8482-1bba2116700f'),('20e6c823-83e8-45e8-96ba-0d78ea2ed8f0','0accbc5d-4cfe-4747-b140-d5a9e599be41','6c217b4b-53a2-4947-bcb4-caf9854b8596'),('f417e28d-3184-4a93-92ff-1494f83afa1b','0accbc5d-4cfe-4747-b140-d5a9e599be41','713cbb53-22af-49fe-974b-fee4f51cd0c5'),('1b559ae0-2c51-4638-91e6-2e4e5e68dded','0accbc5d-4cfe-4747-b140-d5a9e599be41','72f2d46a-ae94-406e-85bd-bb04ea07db6b'),('931eb3d4-e09f-4580-91b7-35e5f1049e56','0accbc5d-4cfe-4747-b140-d5a9e599be41','78cac1c3-540d-4dad-8b62-85c0991547dd'),('6a8fb673-16e8-4fba-b74a-71624ea3db75','0accbc5d-4cfe-4747-b140-d5a9e599be41','7c7d37b8-5a85-4aeb-87f9-bfdbbf3ec250'),('c60a2ddf-11fe-4457-94ba-2570f9e02e6b','0accbc5d-4cfe-4747-b140-d5a9e599be41','8338a945-3a1a-48fa-85e5-fd851ee2e2c7'),('c37036c1-be64-4e8a-99ad-22f68e905fc3','0accbc5d-4cfe-4747-b140-d5a9e599be41','8458741b-dc5e-4e07-b071-ae1f1ab805dc'),('ab8187fd-4418-43c0-af29-01d9f130c203','0accbc5d-4cfe-4747-b140-d5a9e599be41','86859d67-9c97-4900-b1f5-953e0c9d445f'),('cb194e84-e6d7-4104-8076-ee1e9d08a35a','0accbc5d-4cfe-4747-b140-d5a9e599be41','8f697f96-185a-4d46-973e-1e2263b5e84d'),('d83f011e-0064-4806-b04a-97dae8d68052','0accbc5d-4cfe-4747-b140-d5a9e599be41','9137c289-0fe4-4757-ad66-7afa70190662'),('3cb9eaa1-2102-4e02-95e0-6bba1f303499','0accbc5d-4cfe-4747-b140-d5a9e599be41','91a8c3da-b131-4109-8c09-d8b338147a9a'),('0766cdd5-3b14-42f4-a5cf-f849ea61b294','0accbc5d-4cfe-4747-b140-d5a9e599be41','960c7b59-7c9d-46de-8455-7614db95700d'),('16304e49-871e-41f1-8de9-33c025f80557','0accbc5d-4cfe-4747-b140-d5a9e599be41','969a1628-cb82-4174-a3cd-5c531b144310'),('1684017c-6d35-4253-864c-aab85dba3bfe','0accbc5d-4cfe-4747-b140-d5a9e599be41','96bd5b52-a2c1-45c6-8fe3-6a516b88f446'),('77dd441a-f16a-4666-9c47-fa7b827c1732','0accbc5d-4cfe-4747-b140-d5a9e599be41','990013e7-12da-4f6c-8350-390d3d2b6e0f'),('a58e08dc-2c00-41a9-835d-6960eea2fb8e','0accbc5d-4cfe-4747-b140-d5a9e599be41','9b57bd37-ffa4-4b4a-9d2b-6e369906e686'),('5492101a-3eed-4361-87ee-ba9b9a3d6e57','0accbc5d-4cfe-4747-b140-d5a9e599be41','9c0e4a3d-6d8d-4ab8-9e88-105ac4f2d72b'),('24a1dce4-8ddd-4ef0-8baa-9e8302795d44','0accbc5d-4cfe-4747-b140-d5a9e599be41','9d55412e-67e9-4e76-af42-98bd8b73602a'),('8a97a638-ebd8-4ef2-a8c8-4e17a0dc44b2','0accbc5d-4cfe-4747-b140-d5a9e599be41','a400cea3-257e-4827-a17e-f34a345315a1'),('f21e532a-7d02-4f07-83a9-1c9c4431f068','0accbc5d-4cfe-4747-b140-d5a9e599be41','a487a54b-337d-4b20-bce9-1fca1e840d4f'),('1093c26b-185b-4d7e-8694-a3db8e12c159','0accbc5d-4cfe-4747-b140-d5a9e599be41','a7146442-63d6-4fa8-9cb3-9ee51d1b84ae'),('24ce4665-4d0b-4efe-9c9c-9d80d2fd4225','0accbc5d-4cfe-4747-b140-d5a9e599be41','a87c32d4-ffd8-4e64-93a6-3a46651d4707'),('dca31e3f-11c5-47e3-8287-35c4d341b675','0accbc5d-4cfe-4747-b140-d5a9e599be41','a89018fa-ff6c-490d-82a9-c1a2d42fcab7'),('d35e703b-8b21-4bdc-91c9-fcbc9bee356f','0accbc5d-4cfe-4747-b140-d5a9e599be41','ac8f9b88-b132-477d-b4ba-761df518a449'),('f3ce0384-e7f3-4ee1-818e-b3c8145b540d','0accbc5d-4cfe-4747-b140-d5a9e599be41','ad144bd6-04f4-419b-adfc-eb0558329410'),('e3104735-905a-4224-aad2-b31bdd6210e4','0accbc5d-4cfe-4747-b140-d5a9e599be41','b1eba70d-dc1c-4b48-88a6-c836d9f5c247'),('f43fa24d-3fde-44fc-9066-f19caad17419','0accbc5d-4cfe-4747-b140-d5a9e599be41','b40d0db2-1aa3-4a5b-87a7-1cb454947426'),('dd34d60b-9f30-498d-83b5-fe65e7958ac4','0accbc5d-4cfe-4747-b140-d5a9e599be41','b5e5d6d7-1e4e-4522-8323-59d253c5dd88'),('9c7401c4-c996-47e8-b973-6c35177ffa30','0accbc5d-4cfe-4747-b140-d5a9e599be41','b96a3d80-a213-4c7a-8bf5-f5e1b9117cf1'),('ae18f931-f2cb-4a82-9b79-d56183c379f8','0accbc5d-4cfe-4747-b140-d5a9e599be41','bb8df150-0a9e-4772-82e9-463794e0ef57'),('2e7d8c65-84a7-470c-83e3-2268879ddfea','0accbc5d-4cfe-4747-b140-d5a9e599be41','bc517fc0-91d0-47ff-b330-2269b5ca40ba'),('e0ca56c7-e985-45c9-acd8-f2e3d632fe75','0accbc5d-4cfe-4747-b140-d5a9e599be41','c17a9d4e-917f-4fac-bf1e-7d3adab32864'),('a058c237-0275-4c94-88b4-821355d51bfb','0accbc5d-4cfe-4747-b140-d5a9e599be41','c537c010-8dd9-431f-a14a-a4ea82cc18e6'),('3ec205a7-499b-4033-a939-63a03d4e61a3','0accbc5d-4cfe-4747-b140-d5a9e599be41','c60a4ec1-b6da-4917-be16-0ddfc889e62f'),('28bd04f3-93f9-4b77-9a2e-811b9d698e9c','0accbc5d-4cfe-4747-b140-d5a9e599be41','ce299cde-c61c-4af1-8e7e-ab12fe324681'),('50e97e11-02b1-40db-82da-6f99d4e4659b','0accbc5d-4cfe-4747-b140-d5a9e599be41','ce9e90ce-e69b-4160-b11e-2b69e39d0150'),('4ea50f1a-f34f-4645-ab20-a511a0683b54','0accbc5d-4cfe-4747-b140-d5a9e599be41','cf191a8a-7671-4ed6-a660-4eda48a422cb'),('7493e69f-3392-47ae-867b-319b40a8f1bf','0accbc5d-4cfe-4747-b140-d5a9e599be41','d1d34627-fa4c-4516-8795-4dd2a47d5ab7'),('540445cd-3dc3-4ead-bf15-5d35dfe442bc','0accbc5d-4cfe-4747-b140-d5a9e599be41','d30c265a-a55d-48f0-a058-90fb5efa7902'),('d3a3e558-2f95-4d58-9166-930245b96f75','0accbc5d-4cfe-4747-b140-d5a9e599be41','d358d5f0-c40a-4845-9f19-97fc58263876'),('922a286d-be35-4abe-bb0d-3fe0cbdeb399','0accbc5d-4cfe-4747-b140-d5a9e599be41','d3e6f159-d345-4f12-b8d6-c8355b6f7423'),('18fda003-6fc2-43a0-af7d-98ee16b008cd','0accbc5d-4cfe-4747-b140-d5a9e599be41','d461803b-666a-4493-ba06-e1ddb898ba55'),('1936c060-a42a-4024-95a7-eec4f777a699','0accbc5d-4cfe-4747-b140-d5a9e599be41','d4b31e0c-f8bc-4558-b9be-be340beb1fef'),('47ea20da-68ae-429c-af9a-86f9290d1b1a','0accbc5d-4cfe-4747-b140-d5a9e599be41','d5b850cd-ce5d-4cf8-8b18-11b40762441a'),('9961b6e9-f34f-4517-bb8c-85b37c2421bf','0accbc5d-4cfe-4747-b140-d5a9e599be41','d9f5b23a-de4b-41f9-b46d-44d759fe0f5b'),('317bcae5-eac5-4c0e-bbd8-ac418bec34b6','0accbc5d-4cfe-4747-b140-d5a9e599be41','da76b019-487f-46d1-add1-77d3e9939fa2'),('3704ce99-fc17-4d1b-94ff-73303fa93a5d','0accbc5d-4cfe-4747-b140-d5a9e599be41','e12ed588-93bb-4956-9fd5-e3efb68eacf9'),('72c14229-a483-4f3e-bd59-7cef7329cf03','0accbc5d-4cfe-4747-b140-d5a9e599be41','e3c65cde-96dc-4a28-8231-0699f1b06a15'),('21c785e8-e768-447e-895a-1ef4312c3d9d','0accbc5d-4cfe-4747-b140-d5a9e599be41','e57cba94-336d-4c90-8421-8d24255a4741'),('c61a6868-ad74-40d6-9306-5575b23cfa22','0accbc5d-4cfe-4747-b140-d5a9e599be41','e70df534-f620-4bdc-8784-c16118b122cc'),('65ced783-51e4-4315-a8bb-2ede2b7a849a','0accbc5d-4cfe-4747-b140-d5a9e599be41','f4aa069b-b6b1-48f9-b5d6-bc996a0ff33e'),('eb608f16-1ff6-4124-9ac7-fd5643372865','0accbc5d-4cfe-4747-b140-d5a9e599be41','f65a4261-3425-44e1-9310-7f12f0ad47aa'),('6a952fa7-b314-448b-b478-0fdebec3d629','0accbc5d-4cfe-4747-b140-d5a9e599be41','f8e01cae-ea93-4660-af4e-dbdf8f043d47'),('7b189c09-b1d1-430a-814d-9a735631e18f','0accbc5d-4cfe-4747-b140-d5a9e599be41','fd1a49a2-ead8-4a9f-8afe-72bafbcce830'),('763823d9-f17f-42fd-9fe2-b577ac26b14f','0accbc5d-4cfe-4747-b140-d5a9e599be41','fea63ce2-1b4d-4b39-b716-cbcaa76f519e'),('10d9a1aa-8794-4a6b-b89a-eef6626d5d69','393c1d37-b949-4349-a261-b7c59231e2ed','0f9a7cd4-d78f-4cf5-803b-368b17eefb6c'),('5ad8455d-cede-4112-84c3-4ad759120aeb','393c1d37-b949-4349-a261-b7c59231e2ed','11cb4dd6-338e-4da3-bca6-d9f3b4ad71cb'),('dc18f283-8b1f-4272-b2be-772867288341','393c1d37-b949-4349-a261-b7c59231e2ed','125fe957-bd46-4a8f-ba45-3e98b1462d36'),('1b8bec1e-8d08-40cf-a072-40b6bac1dc6c','393c1d37-b949-4349-a261-b7c59231e2ed','1aed0608-b349-4eba-92e5-98d9bc83db08'),('f02f44a9-58ec-447e-a349-e194854afc6e','393c1d37-b949-4349-a261-b7c59231e2ed','226c6818-efd6-42c6-a523-09d52a40e633'),('7fc75720-dc54-4f54-8d2b-02a1259e3631','393c1d37-b949-4349-a261-b7c59231e2ed','25312ec0-4dd5-4d66-9b58-25904e5e5c6c'),('ded1dc46-72b6-43dd-8acd-b3efafc1fdb7','393c1d37-b949-4349-a261-b7c59231e2ed','264efb79-c2ff-457e-ad80-da796db7999a'),('cd6df51c-9c49-4f9b-b4d5-5deb2859fb7b','393c1d37-b949-4349-a261-b7c59231e2ed','2877d9e3-8551-4b42-b917-7690331e0939'),('22b187ae-0bcc-4b0d-bcd3-71bb8eac8432','393c1d37-b949-4349-a261-b7c59231e2ed','2a7c23bc-ad29-49a0-8151-f2b8c39efbee'),('3ba068d7-de8b-4d17-a6d7-659f81d866d0','393c1d37-b949-4349-a261-b7c59231e2ed','2bb1dccc-6002-49eb-a8cb-491896b9c5a9'),('e4031a49-d4a0-462b-8084-22883be11fd9','393c1d37-b949-4349-a261-b7c59231e2ed','342c70dd-0d3c-4655-9fc2-f0b01bc5a315'),('a6bb627e-57be-4eb1-b6d2-e859b2260446','393c1d37-b949-4349-a261-b7c59231e2ed','3f1c1a9f-7b4d-4604-9134-25870325cca4'),('dc193348-158b-40c1-8b19-66164a18e878','393c1d37-b949-4349-a261-b7c59231e2ed','4445843b-297b-4911-b1ac-d0fdaad30cc4'),('15d49489-cbfb-4d4d-9da7-865cddd13072','393c1d37-b949-4349-a261-b7c59231e2ed','4b57814e-736b-4f90-891b-80c88c25ad89'),('c4fda94f-2b85-4f4f-b929-aef1ad338006','393c1d37-b949-4349-a261-b7c59231e2ed','678293df-d264-474a-8482-1bba2116700f'),('ba3b95d0-7625-418b-9110-28d7dfa73c63','393c1d37-b949-4349-a261-b7c59231e2ed','7c7d37b8-5a85-4aeb-87f9-bfdbbf3ec250'),('5398bfbc-7842-4846-99f7-b2e012573c35','393c1d37-b949-4349-a261-b7c59231e2ed','8338a945-3a1a-48fa-85e5-fd851ee2e2c7'),('7088664c-fa2e-4a94-867f-97988c40be28','393c1d37-b949-4349-a261-b7c59231e2ed','8458741b-dc5e-4e07-b071-ae1f1ab805dc'),('3626a96e-dfea-4989-afe1-cdd98285e4ed','393c1d37-b949-4349-a261-b7c59231e2ed','86859d67-9c97-4900-b1f5-953e0c9d445f'),('2f2bb364-e02c-4823-a83a-e864e42e7020','393c1d37-b949-4349-a261-b7c59231e2ed','960c7b59-7c9d-46de-8455-7614db95700d'),('410e5eef-43b6-411f-bbd8-172f08441dbe','393c1d37-b949-4349-a261-b7c59231e2ed','96bd5b52-a2c1-45c6-8fe3-6a516b88f446'),('1db94481-ddbd-4876-83bb-4d5c23122f32','393c1d37-b949-4349-a261-b7c59231e2ed','9c0e4a3d-6d8d-4ab8-9e88-105ac4f2d72b'),('deedb894-2c8a-4065-9d44-d74fbdc1f2aa','393c1d37-b949-4349-a261-b7c59231e2ed','b1eba70d-dc1c-4b48-88a6-c836d9f5c247'),('6e2c4820-fdf6-40f9-a65c-1186d25f70db','393c1d37-b949-4349-a261-b7c59231e2ed','b5e5d6d7-1e4e-4522-8323-59d253c5dd88'),('cc77f935-5f25-4fc9-9d03-14b2051bf5ee','393c1d37-b949-4349-a261-b7c59231e2ed','bc517fc0-91d0-47ff-b330-2269b5ca40ba'),('fe5c8695-c69e-4725-9e22-d46669dadff4','393c1d37-b949-4349-a261-b7c59231e2ed','c17a9d4e-917f-4fac-bf1e-7d3adab32864'),('dd9147f9-ed6e-4a8d-bc98-e1ac3f2bdaf8','393c1d37-b949-4349-a261-b7c59231e2ed','c60a4ec1-b6da-4917-be16-0ddfc889e62f'),('7197660c-ce8a-457f-a3ef-d588186d1090','393c1d37-b949-4349-a261-b7c59231e2ed','cf191a8a-7671-4ed6-a660-4eda48a422cb'),('99d55184-bf8f-4b97-a326-af0492e59ca1','393c1d37-b949-4349-a261-b7c59231e2ed','d30c265a-a55d-48f0-a058-90fb5efa7902'),('f3bcad1d-6169-48b6-ad19-19e582848137','393c1d37-b949-4349-a261-b7c59231e2ed','d358d5f0-c40a-4845-9f19-97fc58263876'),('cae5134f-835d-4c33-92e3-d40e804d3130','393c1d37-b949-4349-a261-b7c59231e2ed','d3e6f159-d345-4f12-b8d6-c8355b6f7423'),('00bec7f2-f41c-48cc-b421-30f6b3d1dc7d','393c1d37-b949-4349-a261-b7c59231e2ed','d461803b-666a-4493-ba06-e1ddb898ba55'),('6d2a4fc5-eda4-48d5-8d72-a9dbfa526b80','393c1d37-b949-4349-a261-b7c59231e2ed','da76b019-487f-46d1-add1-77d3e9939fa2'),('2bad8a20-5551-48b9-aed1-ad51d01e38d3','393c1d37-b949-4349-a261-b7c59231e2ed','e12ed588-93bb-4956-9fd5-e3efb68eacf9'),('12cfc4c6-54f8-4d92-848a-2514ef8d9a8f','393c1d37-b949-4349-a261-b7c59231e2ed','e57cba94-336d-4c90-8421-8d24255a4741'),('c454d63d-6203-4f09-9537-990f987e2331','393c1d37-b949-4349-a261-b7c59231e2ed','e70df534-f620-4bdc-8784-c16118b122cc'),('6fa14399-effa-4c7c-bea9-1fa705a4ab18','393c1d37-b949-4349-a261-b7c59231e2ed','fd1a49a2-ead8-4a9f-8afe-72bafbcce830'),('27d1dc94-f7a7-472e-87ad-e11672519610','393c1d37-b949-4349-a261-b7c59231e2ed','fea63ce2-1b4d-4b39-b716-cbcaa76f519e'),('08ec084f-0a20-41df-abae-38ea70c41155','a38cd17a-1e24-414e-b8d6-8d82167fb69d','1aed0608-b349-4eba-92e5-98d9bc83db08'),('5f479e6d-c420-4f03-9157-41716d23e4b9','a38cd17a-1e24-414e-b8d6-8d82167fb69d','226c6818-efd6-42c6-a523-09d52a40e633'),('fa7afb58-b9bb-490d-bfd6-68e6532a0956','a38cd17a-1e24-414e-b8d6-8d82167fb69d','25312ec0-4dd5-4d66-9b58-25904e5e5c6c'),('f0a8879e-78b1-41a8-bf9d-78a406f6eb71','a38cd17a-1e24-414e-b8d6-8d82167fb69d','264efb79-c2ff-457e-ad80-da796db7999a'),('54d2c5c4-8966-4ece-b039-2f024de6ca1b','a38cd17a-1e24-414e-b8d6-8d82167fb69d','2877d9e3-8551-4b42-b917-7690331e0939'),('e5a3914a-75b2-49a8-913c-c21dadfa3633','a38cd17a-1e24-414e-b8d6-8d82167fb69d','2a6c386b-5325-4f4e-8749-170e580d5048'),('e4cc61a7-bd09-4e8d-aa16-623af9aaea35','a38cd17a-1e24-414e-b8d6-8d82167fb69d','2a7c23bc-ad29-49a0-8151-f2b8c39efbee'),('81045e58-7c09-45dd-b0b6-716360c80e5c','a38cd17a-1e24-414e-b8d6-8d82167fb69d','2bb1dccc-6002-49eb-a8cb-491896b9c5a9'),('2fd409a5-7572-4e3a-9944-66c73e18f8c3','a38cd17a-1e24-414e-b8d6-8d82167fb69d','8458741b-dc5e-4e07-b071-ae1f1ab805dc'),('81c97b8b-6351-40ba-b2ff-153064747f77','a38cd17a-1e24-414e-b8d6-8d82167fb69d','cf191a8a-7671-4ed6-a660-4eda48a422cb'),('483d0cf2-f571-49ec-bd61-3888aba0559e','a38cd17a-1e24-414e-b8d6-8d82167fb69d','d30c265a-a55d-48f0-a058-90fb5efa7902');
/*!40000 ALTER TABLE `VaiTroQuyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VuViecDoiTuong`
--

DROP TABLE IF EXISTS `VuViecDoiTuong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VuViecDoiTuong` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vuViecId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doiTuongId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaiTro` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `VuViecDoiTuong_vuViecId_doiTuongId_key` (`vuViecId`,`doiTuongId`),
  KEY `VuViecDoiTuong_doiTuongId_fkey` (`doiTuongId`),
  CONSTRAINT `VuViecDoiTuong_doiTuongId_fkey` FOREIGN KEY (`doiTuongId`) REFERENCES `HoSoDoiTuong` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VuViecDoiTuong_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VuViecDoiTuong`
--

LOCK TABLES `VuViecDoiTuong` WRITE;
/*!40000 ALTER TABLE `VuViecDoiTuong` DISABLE KEYS */;
INSERT INTO `VuViecDoiTuong` VALUES ('0361e05f-f90f-4a44-b414-dac8393e7b9c','0d41aa2b-7a7a-4347-925e-05a5e59924f0','b4ef30e9-9498-4886-99d8-c95e509861d4','Chủ mưu','Đối tượng khởi xướng và trực tiếp tham gia đánh nhau','2026-04-09 12:29:38.382'),('554178bb-1ae0-4418-94d7-6035a80573ab','65a40e55-13a2-4afa-ae45-649c0460fe59','b2538a89-0c6b-4a7d-93d3-0d3599890efe','Chủ mưu','Đối tượng trực tiếp thực hiện hành vi trộm cắp','2026-04-09 12:29:38.360'),('7bec003d-5c01-4091-8f9b-314cc2dcac04','2316e478-eda5-478e-91cd-77a866eee754','b2538a89-0c6b-4a7d-93d3-0d3599890efe',NULL,NULL,'2026-04-29 02:36:15.488'),('7d80ee78-7086-4b58-b743-00cf4d1f16b2','2316e478-eda5-478e-91cd-77a866eee754','7d20e605-0523-4237-8950-3802621b65be',NULL,NULL,'2026-04-29 02:36:15.488'),('86d36cdf-0fcd-4a7b-8661-015c1f031b99','e6616241-039b-4c14-9118-48fddfd35c55','b2a2f0b8-cfb5-4db8-b0c1-176923abfd61','Chủ mưu','Đối tượng trực tiếp thực hiện hành vi lừa đảo','2026-04-09 12:29:38.411'),('8b43f525-fe02-45b7-a0e2-63e5e646136d','0d41aa2b-7a7a-4347-925e-05a5e59924f0','b2538a89-0c6b-4a7d-93d3-0d3599890efe','Đồng phạm','Tham gia đánh nhau cùng nhóm','2026-04-09 12:29:38.394');
/*!40000 ALTER TABLE `VuViecDoiTuong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VuViecToimDanh`
--

DROP TABLE IF EXISTS `VuViecToimDanh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VuViecToimDanh` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vuViecId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toimDanhId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayTao` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `VuViecToimDanh_vuViecId_toimDanhId_key` (`vuViecId`,`toimDanhId`),
  KEY `VuViecToimDanh_toimDanhId_fkey` (`toimDanhId`),
  CONSTRAINT `VuViecToimDanh_toimDanhId_fkey` FOREIGN KEY (`toimDanhId`) REFERENCES `ToimDanh` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VuViecToimDanh_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VuViecToimDanh`
--

LOCK TABLES `VuViecToimDanh` WRITE;
/*!40000 ALTER TABLE `VuViecToimDanh` DISABLE KEYS */;
INSERT INTO `VuViecToimDanh` VALUES ('0846682d-3465-4421-9d81-9964cf29dee4','0d41aa2b-7a7a-4347-925e-05a5e59924f0','6614b0c1-4093-47d0-b6bf-f6ede4715ca2','Gây thương tích cho 3 nạn nhân','2026-04-09 12:29:38.459'),('0ca4f3d8-e742-4a7b-ac2c-68a5111da241','0d41aa2b-7a7a-4347-925e-05a5e59924f0','f5bf9c2d-306d-495f-96a5-7028f1ab1500','Gây rối trật tự công cộng tại quán nhậu','2026-04-09 12:29:38.474'),('dc220565-eab6-4f4d-b261-835f350f22e6','e6616241-039b-4c14-9118-48fddfd35c55','7189fcdb-9e77-407e-9c43-342033001a54','Lừa đảo chiếm đoạt 500 triệu đồng qua hình thức giả danh ngân hàng','2026-04-09 12:29:38.487'),('f9330d9f-7a01-43ae-9de5-3e24d0a35565','65a40e55-13a2-4afa-ae45-649c0460fe59','afe5d1f2-c9a7-4453-a6ae-7ca91fbd046a','Trộm 3 xe máy trị giá khoảng 60 triệu đồng','2026-04-09 12:29:38.439');
/*!40000 ALTER TABLE `VuViecToimDanh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('32e8aa53-287a-45d1-9941-ca11a3af6a6d','0abc42ca169c205bcf65767069be6419f3874869bf237d6bc566b1e6b40a2b24','2026-04-09 12:29:05.755','20260304014746_init_qlcnc_database',NULL,NULL,'2026-04-09 12:28:58.735',1),('38c8a52f-0906-4575-ae30-c6aba71a9e2d','ae4f2c94baa484cdd4724234487e1c9909c3fcaecba6c28cfff915350839c456','2026-04-09 12:29:06.324','20260304085535_bo_cap_huyen',NULL,NULL,'2026-04-09 12:29:05.781',1),('665dae1e-a025-40a0-a59e-62e95f09035b','beaf817d05acd0ad115e0aa1a750014a889ae1942e1241bb0647cb510b2097ff','2026-04-10 06:19:45.843','20260410061945_them_nguoi_dung_thong_bao',NULL,NULL,'2026-04-10 06:19:45.273',1),('edeaab7f-5163-4005-857b-6b561237ef1c','6b0bef86603e11efc22ff4e2bd153b5de25e9a3b24dc24dd2d45a9cfb9b97e98','2026-04-29 02:35:23.329','20260429023523_add_performance_indexes',NULL,NULL,'2026-04-29 02:35:23.048',1),('f299e037-2604-49d0-9ccd-0a034ffaa279','d12df4c82aa0142fee246cdf0cc49f437f56287d5151c30d83ab6551d80c34fa','2026-04-09 12:29:06.913','20260402000000_them_truong_file_anh',NULL,NULL,'2026-04-09 12:29:06.650',1),('f8ac8926-27a4-4da9-9cf5-24ca83c3d081','7ce0bdb1f4565d2878eb03ed626704dacef673e4265e6bc0e44cf62922de1d11','2026-04-09 12:29:06.629','20260305002619_them_bang_don_vi',NULL,NULL,'2026-04-09 12:29:06.333',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20  8:59:50

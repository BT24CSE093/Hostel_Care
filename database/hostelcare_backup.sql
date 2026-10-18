-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: hostelcare_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `complaint_assignments`
--

DROP TABLE IF EXISTS `complaint_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assignment_status` enum('ACTIVE','COMPLETED','CANCELLED') DEFAULT 'ACTIVE',
  PRIMARY KEY (`assignment_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_assignment_staff_status` (`staff_id`,`assignment_status`),
  CONSTRAINT `complaint_assignments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `complaint_assignments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles` (`staff_id`),
  CONSTRAINT `complaint_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_assignments`
--

LOCK TABLES `complaint_assignments` WRITE;
/*!40000 ALTER TABLE `complaint_assignments` DISABLE KEYS */;
INSERT INTO `complaint_assignments` VALUES (1,1,1,2,'2026-10-16 08:49:06','ACTIVE'),(2,1,1,2,'2026-10-16 08:51:13','ACTIVE');
/*!40000 ALTER TABLE `complaint_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_attachments`
--

DROP TABLE IF EXISTS `complaint_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_attachments` (
  `attachment_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `complaint_attachments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `complaint_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_attachments`
--

LOCK TABLES `complaint_attachments` WRITE;
/*!40000 ALTER TABLE `complaint_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_categories`
--

DROP TABLE IF EXISTS `complaint_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(60) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `default_priority` enum('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_categories`
--

LOCK TABLES `complaint_categories` WRITE;
/*!40000 ALTER TABLE `complaint_categories` DISABLE KEYS */;
INSERT INTO `complaint_categories` VALUES (1,'Plumbing','Water leakage and tap problems','HIGH'),(2,'Electrical','Lights, fans and electrical faults','HIGH'),(3,'Cleaning','Room and common area cleaning','MEDIUM'),(4,'Furniture','Bed, chair and table repairs','LOW');
/*!40000 ALTER TABLE `complaint_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_status_history`
--

DROP TABLE IF EXISTS `complaint_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_status_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `old_status` varchar(30) DEFAULT NULL,
  `new_status` varchar(30) NOT NULL,
  `changed_by` int NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_history_complaint_date` (`complaint_id`,`changed_at`),
  CONSTRAINT `complaint_status_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `complaint_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_status_history`
--

LOCK TABLES `complaint_status_history` WRITE;
/*!40000 ALTER TABLE `complaint_status_history` DISABLE KEYS */;
INSERT INTO `complaint_status_history` VALUES (1,1,NULL,'SUBMITTED',1,'Complaint registered','2026-10-16 08:52:27'),(2,1,'SUBMITTED','ASSIGNED',2,'Assigned to electrician','2026-10-16 08:52:27');
/*!40000 ALTER TABLE `complaint_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `room_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  `status` enum('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED','REJECTED','CANCELLED') DEFAULT 'SUBMITTED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  KEY `student_id` (`student_id`),
  KEY `room_id` (`room_id`),
  KEY `category_id` (`category_id`),
  KEY `idx_complaints_status_created` (`status`,`created_at`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`student_id`),
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,1,1,1,'Water leakage','Bathroom tap is leaking continuously','HIGH','ASSIGNED','2026-10-16 08:48:47','2026-10-16 08:48:47'),(2,1,1,2,'Fan not working','Ceiling fan has stopped working','MEDIUM','SUBMITTED','2026-10-16 08:48:47','2026-10-16 08:48:47');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `student_id` int NOT NULL,
  `rating` int NOT NULL,
  `comments` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  UNIQUE KEY `complaint_id` (`complaint_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`student_id`),
  CONSTRAINT `feedback_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostels`
--

DROP TABLE IF EXISTS `hostels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostels` (
  `hostel_id` int NOT NULL AUTO_INCREMENT,
  `hostel_name` varchar(100) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`hostel_id`),
  UNIQUE KEY `hostel_name` (`hostel_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostels`
--

LOCK TABLES `hostels` WRITE;
/*!40000 ALTER TABLE `hostels` DISABLE KEYS */;
INSERT INTO `hostels` VALUES (1,'Hostel A','North Campus'),(2,'Hostel B','South Campus');
/*!40000 ALTER TABLE `hostels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_expenses`
--

DROP TABLE IF EXISTS `maintenance_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `expense_type` enum('LABOR','MATERIAL','OTHER') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `recorded_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`expense_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `recorded_by` (`recorded_by`),
  CONSTRAINT `maintenance_expenses_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `maintenance_expenses_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `maintenance_expenses_chk_1` CHECK ((`amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_expenses`
--

LOCK TABLES `maintenance_expenses` WRITE;
/*!40000 ALTER TABLE `maintenance_expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_work_logs`
--

DROP TABLE IF EXISTS `maintenance_work_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_work_logs` (
  `work_log_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `work_description` text NOT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`work_log_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `maintenance_work_logs_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `maintenance_work_logs_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles` (`staff_id`),
  CONSTRAINT `maintenance_work_logs_chk_1` CHECK (((`completed_at` is null) or (`started_at` is null) or (`completed_at` >= `started_at`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_work_logs`
--

LOCK TABLES `maintenance_work_logs` WRITE;
/*!40000 ALTER TABLE `maintenance_work_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_work_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `complaint_id` int DEFAULT NULL,
  `message` varchar(500) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `complaint_id` (`complaint_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_allocations`
--

DROP TABLE IF EXISTS `room_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_allocations` (
  `allocation_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `room_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`allocation_id`),
  KEY `student_id` (`student_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `room_allocations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`student_id`),
  CONSTRAINT `room_allocations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `room_allocations_chk_1` CHECK (((`end_date` is null) or (`end_date` >= `start_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_allocations`
--

LOCK TABLES `room_allocations` WRITE;
/*!40000 ALTER TABLE `room_allocations` DISABLE KEYS */;
INSERT INTO `room_allocations` VALUES (1,1,1,'2026-10-16',NULL);
/*!40000 ALTER TABLE `room_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `hostel_id` int NOT NULL,
  `room_number` varchar(20) NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `hostel_id` (`hostel_id`,`room_number`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`hostel_id`),
  CONSTRAINT `rooms_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'101',2),(2,1,'102',2),(3,2,'201',3);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_profiles` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `staff_type` enum('ELECTRICIAN','PLUMBER','CARPENTER','CLEANER','GENERAL') NOT NULL,
  `availability` enum('AVAILABLE','BUSY','INACTIVE') DEFAULT 'AVAILABLE',
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (1,3,'ELECTRICIAN','AVAILABLE');
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `roll_number` varchar(30) NOT NULL,
  `course` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (1,1,'HC001','CSE');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('STUDENT','WARDEN','STAFF','ADMIN') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Demo Student','student@example.com','9000000001','DEMO_HASH','STUDENT',1,'2026-10-16 08:45:32'),(2,'Demo Warden','warden@example.com','9000000002','DEMO_HASH','WARDEN',1,'2026-10-16 08:45:32'),(3,'Demo Electrician','staff@example.com','9000000003','DEMO_HASH','STAFF',1,'2026-10-16 08:45:32'),(4,'Demo Admin','admin@example.com','9000000004','DEMO_HASH','ADMIN',1,'2026-10-16 08:45:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-16 14:38:30

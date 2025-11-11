-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 10, 2025 at 09:06 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u728741476_hkf_forms`
--

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `hkfId` varchar(20) DEFAULT NULL,
  `submission_date` timestamp NULL DEFAULT current_timestamp(),
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `gender` varchar(10) NOT NULL,
  `address` varchar(255) NOT NULL,
  `postalCode` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `entryDate` date NOT NULL,
  `sepaGender` varchar(20) NOT NULL,
  `sepaFirstName` varchar(255) NOT NULL,
  `sepaLastName` varchar(255) NOT NULL,
  `sepaAddress` varchar(255) NOT NULL,
  `sepaPostalCode` varchar(10) NOT NULL,
  `sepaCity` varchar(100) NOT NULL,
  `iban` varchar(34) NOT NULL,
  `sepaEntryDate` date NOT NULL,
  `signature` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hkfId` (`hkfId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Rebinit — full schema, current as of the whole build.
-- Run this once against a fresh database (local or Aiven) instead of
-- chasing down every individual migration file separately.

CREATE DATABASE IF NOT EXISTS rebinit_db;
USE rebinit_db;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  points INT DEFAULT 0,
  phone VARCHAR(20),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ CIVIC DUMPING REPORTS ============
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description TEXT,
  severity ENUM('Low','Medium','High') DEFAULT 'Medium',
  image_url VARCHAR(255),
  category VARCHAR(50),
  confidence FLOAT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  status ENUM('Reported','In Progress','Resolved') DEFAULT 'Reported',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============ PERSONAL RECYCLING LOG ============
-- Separate from `reports` on purpose — no status workflow, no location
-- requirement, no admin review. Just "I recycled this."
CREATE TABLE IF NOT EXISTS recycling_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50),
  confidence FLOAT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============ MARKETPLACE ============
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150),
  category VARCHAR(50),
  description TEXT,
  quantity VARCHAR(50),
  image_url VARCHAR(255),
  location VARCHAR(150),
  status ENUM('Available','Sold') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============ REWARDS ============
CREATE TABLE IF NOT EXISTS rewards_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INT,
  reason VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rewards_catalog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  partner_name VARCHAR(100),
  points_cost INT NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  catalog_item_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  points_spent INT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (catalog_item_id) REFERENCES rewards_catalog(id)
);

-- ============ MAP ============
CREATE TABLE IF NOT EXISTS collection_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  type VARCHAR(50)
);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150),
  message TEXT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============ SEED DATA ============
-- Demo voucher catalog — fictional partners, swap for real ones if this
-- ever goes into actual production.
INSERT INTO rewards_catalog (title, description, partner_name, points_cost) VALUES
('10% off your next order', 'Valid on any purchase over ₹500', 'GreenMart', 100),
('₹50 off storewide', 'One-time use, no minimum purchase', 'EcoStore', 150),
('Free reusable tote bag', 'Redeemable in-store or via delivery', 'CleanCity Co.', 80),
('15% off clothing', 'Valid on new and pre-loved items', 'ThriftLoop', 120),
('Free compost starter kit', 'Includes bin, starter culture, and guide', 'UrbanFarm', 200);
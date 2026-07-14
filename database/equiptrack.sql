-- EquipTrack initial MySQL schema
-- Safe to re-run: drops tables in reverse foreign-key dependency order

CREATE DATABASE IF NOT EXISTS equiptrack;
USE equiptrack;

-- Drop child tables first, then parents
DROP TABLE IF EXISTS damage_reports;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('borrower', 'staff', 'admin') DEFAULT 'borrower',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE equipment (
  equipment_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  equipment_name VARCHAR(150) NOT NULL,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  equipment_condition ENUM('Good', 'Fair', 'Damaged') DEFAULT 'Good',
  status ENUM('Available', 'Reserved', 'Borrowed', 'Maintenance', 'Damaged') DEFAULT 'Available',
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  equipment_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Waitlisted', 'Cancelled', 'Collected', 'Returned', 'Overdue') DEFAULT 'Pending',
  queue_position INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

CREATE TABLE loans (
  loan_id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  issued_by INT NOT NULL,
  collection_date DATETIME,
  due_date DATE NOT NULL,
  loan_status ENUM('Active', 'Returned', 'Overdue') DEFAULT 'Active',
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
  FOREIGN KEY (issued_by) REFERENCES users(user_id)
);

CREATE TABLE returns (
  return_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  received_by INT NOT NULL,
  return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  return_condition ENUM('Good', 'Fair', 'Damaged') NOT NULL,
  late_days INT DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
  FOREIGN KEY (received_by) REFERENCES users(user_id)
);

CREATE TABLE damage_reports (
  damage_id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  loan_id INT,
  reported_by INT NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('Minor', 'Moderate', 'Severe') NOT NULL,
  repair_cost DECIMAL(10,2) DEFAULT 0,
  status ENUM('Reported', 'Under Repair', 'Resolved') DEFAULT 'Reported',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
  FOREIGN KEY (reported_by) REFERENCES users(user_id)
);

-- Sample users
-- NOTE: The password values below are placeholders that look like bcrypt hashes.
-- Proper password hashes will be created later by the registration / auth feature.
INSERT INTO users (name, email, password, role) VALUES
('Alex Borrower', 'borrower@equiptrack.local', '$2b$10$PLACEHOLDER_HASH_BORROWER____________xx', 'borrower'),
('Sam Staff', 'staff@equiptrack.local', '$2b$10$PLACEHOLDER_HASH_STAFF_______________xx', 'staff'),
('Ada Admin', 'admin@equiptrack.local', '$2b$10$PLACEHOLDER_HASH_ADMIN_______________xx', 'admin');

-- Sample categories
INSERT INTO categories (category_name, description) VALUES
('Cameras', 'Digital cameras and photography kits'),
('Audio', 'Microphones, recorders, and audio accessories'),
('Laptops', 'Portable computers for coursework and events');

-- Sample equipment (5 items across the three categories)
INSERT INTO equipment (category_id, equipment_name, asset_code, description, equipment_condition, status, image) VALUES
(1, 'Canon EOS 90D', 'CAM-001', 'DSLR camera body with 18-55mm kit lens', 'Good', 'Available', '/img/equipment-placeholder.svg'),
(1, 'Sony Alpha A6400', 'CAM-002', 'Mirrorless camera for video and stills', 'Good', 'Available', '/img/equipment-placeholder.svg'),
(2, 'Rode Wireless GO II', 'AUD-001', 'Wireless dual-channel microphone system', 'Good', 'Available', '/img/equipment-placeholder.svg'),
(2, 'Zoom H5 Recorder', 'AUD-002', 'Portable handheld audio recorder', 'Fair', 'Maintenance', '/img/equipment-placeholder.svg'),
(3, 'Dell XPS 13', 'LAP-001', '13-inch ultrabook for presentations and editing', 'Good', 'Available', '/img/equipment-placeholder.svg');

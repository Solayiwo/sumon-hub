CREATE DATABASE IF NOT EXISTS sumonhub_db;
USE sumonhub_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email_address VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS Categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS Products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL DEFAULT 'Generic',
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(255) DEFAULT 'Pending',
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 5. Order_Items Table
CREATE TABLE IF NOT EXISTS Order_Items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- -- Seed Categories
INSERT INTO Categories (category_name) VALUES 
('smartphones'), ('laptops'), ('gadgets'), ('accessories')
ON DUPLICATE KEY UPDATE category_name=category_name;

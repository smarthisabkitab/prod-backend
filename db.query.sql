CREATE DATABASE gold_jewellery_dev;

use gold_jewellery_dev;

CREATE TABLE IF NOT EXISTS users(
    id bigint primary key auto_increment not null unique,
    fullname varchar(32) not null,
    email varchar(100) not null unique,
    password varchar(255) not null,
    role enum("subscriber", "editor", "admin", "paid") default "subscriber",
    phone_no varchar(15) not null unique,
    address varchar(100) not null,
    is_deleted tinyint(1) default 0,
    last_login timestamp default current_timestamp on update current_timestamp,

    createdAt timestamp default current_timestamp,
    updatedAt timestamp default current_timestamp on update current_timestamp
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    plan ENUM("free", "premium") DEFAULT "free",
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    status ENUM("active", "expired", "cancelled") DEFAULT "active",

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    shop_name VARCHAR(100) NOT NULL,
    db_name VARCHAR(100) NOT NULL UNIQUE, -- each shop has separate DB
    status ENUM("active", "inactive") DEFAULT "active",
    settings JSON NULL, -- Store shop-specific settings in JSON

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Whenever a shop is created, we spin up a new database named like shop_{id}.

-- 1. Customers (people buying jewellery)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) NULL,
    address VARCHAR(255) NULL,
    notes TEXT NULL,
    total_purchase_amount DECIMAL(12,2) DEFAULT 0.00,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Transactions (daily sales/purchases)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT,
    transaction_type ENUM('sale', 'purchase', 'return', 'exchange') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    gold_weight DECIMAL(10,3) NULL, 
    making_charge DECIMAL(10,2) NULL,
    gold_rate DECIMAL(10,2) NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invoice_number VARCHAR(50) NULL UNIQUE,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 3. Products (optional, if shop wants to track inventory)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    purity ENUM('22K', '18K', '14K', '10K') DEFAULT '22K',
    weight DECIMAL(10,3) NOT NULL, -- grams with more precision
    price DECIMAL(10,2),
    making_charge DECIMAL(10,2) NULL,
    stock_quantity INT DEFAULT 0,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    transaction_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
);


CREATE DATABASE IF NOT EXISTS student_portfolio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE student_portfolio;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL DEFAULT '',
    avatar_path VARCHAR(500) NULL,
    is_owner TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_storage (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    storage_key VARCHAR(190) NOT NULL,
    storage_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_storage (user_id, storage_key),
    CONSTRAINT fk_storage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- OWNER ACCOUNT
-- Username: matthaevs
-- Password: matthaevs0203
-- Change the password after first setup if this is a real deployment.
INSERT INTO users (username, password_hash, display_name, is_owner)
SELECT 'matthaevs', '$2y$12$BEej0ySIBVf/GNE2oG3/7exke3Te4w7izu6M9ZUX8sjUV4g9ajlcW', 'MANECLANG', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'matthaevs');

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(255),
  github_url VARCHAR(255),
  image_url VARCHAR(255),
  tags JSON,
  thumbnail VARCHAR(500) DEFAULT NULL COMMENT 'Main image for project card',
  images JSON DEFAULT NULL COMMENT 'Array of image paths for carousel',
  status ENUM('active', 'archived') DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  -- Create admin user
  -- Default password: "admin123" (CHANGE THIS IN PRODUCTION!)
  -- Hash generated with bcrypt (10 rounds)
  INSERT INTO users (username, password_hash) VALUES (
    'admin',
    '$2b$10$62SxqtwpHC647jFvKG5Vv.0cPZ95nW/3c/s0Msvdh3UxN/yBU78/e'
  );
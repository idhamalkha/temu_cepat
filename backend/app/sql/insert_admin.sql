-- Script untuk menambah admin sample ke database
-- Password: admin123 (hashed dengan bcrypt)

INSERT INTO admin (nama_admin, username, password_hash)
VALUES 
  ('Administrator', 'admin', '$2b$12$c.H50nDm1y.0eRzu9xWnRO78lQ9hfnLIpEHd6PP/MNvjj26MhjWem'),
  ('Manager', 'manager', '$2b$12$c.H50nDm1y.0eRzu9xWnRO78lQ9hfnLIpEHd6PP/MNvjj26MhjWem')
ON CONFLICT (username) DO NOTHING;

-- Note: Default password untuk kedua user adalah 'admin123'
-- Username: admin, Password: admin123
-- Username: manager, Password: admin123

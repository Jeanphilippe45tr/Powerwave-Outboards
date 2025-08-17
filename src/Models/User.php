<?php
namespace App\Models;

use App\Core\Database;

class User
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(array $data): ?int
    {
        $sql = "INSERT INTO users (first_name, last_name, username, email, password, phone, created_at) 
                VALUES (?, ?, ?, ?,?, ?, NOW())";
        
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $this->db->query($sql, [
            $data['first_name'],
            $data['last_name'],
            $data['username'],
            $data['email'],
            $hashedPassword,
            $data['phone'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL";
        return $this->db->fetch($sql, [$email]);
    }

    public function findByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL";
        return $this->db->fetch($sql, [$username]);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, first_name, last_name, username, email, phone, role, created_at 
                FROM users WHERE id = ? AND deleted_at IS NULL";
        return $this->db->fetch($sql, [$id]);
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['first_name', 'last_name', 'username', 'email', 'phone'])) {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $this->db->query($sql, $values);
        return $stmt->rowCount() > 0;
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function updateLastLogin(int $id): void
    {
        $sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $this->db->query($sql, [$id]);
    }
}
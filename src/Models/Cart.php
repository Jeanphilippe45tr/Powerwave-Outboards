<?php
namespace App\Models;

use App\Core\Database;

class Cart
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function addItem(int $userId, int $productId, int $quantity): bool
    {
        // Check if item already exists in cart
        $existing = $this->findItem($userId, $productId);
        
        if ($existing) {
            return $this->updateQuantity($existing['id'], $existing['quantity'] + $quantity);
        }
        
        $sql = "INSERT INTO cart_items (user_id, product_id, quantity, created_at) 
                VALUES (?, ?, ?, NOW())";
        
        $this->db->query($sql, [$userId, $productId, $quantity]);
        return true;
    }

    public function updateQuantity(int $itemId, int $quantity): bool
    {
        if ($quantity <= 0) {
            return $this->removeItem($itemId);
        }
        
        $sql = "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->query($sql, [$quantity, $itemId]);
        return $stmt->rowCount() > 0;
    }

    public function removeItem(int $itemId): bool
    {
        $sql = "DELETE FROM cart_items WHERE id = ?";
        $stmt = $this->db->query($sql, [$itemId]);
        return $stmt->rowCount() > 0;
    }

    public function getItems(int $userId): array
    {
        $sql = "SELECT ci.*, p.name, p.price, p.stock_quantity, p.sku,
                       (ci.quantity * p.price) as subtotal
                FROM cart_items ci 
                LEFT JOIN products p ON ci.product_id = p.id 
                WHERE ci.user_id = ? AND p.deleted_at IS NULL
                ORDER BY ci.created_at DESC";
        
        return $this->db->fetchAll($sql, [$userId]);
    }

    public function getTotalAmount(int $userId): float
    {
        $sql = "SELECT SUM(ci.quantity * p.price) as total 
                FROM cart_items ci 
                LEFT JOIN products p ON ci.product_id = p.id 
                WHERE ci.user_id = ? AND p.deleted_at IS NULL";
        
        $result = $this->db->fetch($sql, [$userId]);
        return (float) ($result['total'] ?? 0);
    }

    public function clearCart(int $userId): bool
    {
        $sql = "DELETE FROM cart_items WHERE user_id = ?";
        $stmt = $this->db->query($sql, [$userId]);
        return $stmt->rowCount() > 0;
    }

    private function findItem(int $userId, int $productId): ?array
    {
        $sql = "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?";
        return $this->db->fetch($sql, [$userId, $productId]);
    }
}
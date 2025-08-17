<?php
namespace App\Models;

use App\Core\Database;

class Order
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(array $orderData, array $items): ?int
    {
        // Start transaction
        $this->db->getConnection()->beginTransaction();
        
        try {
            // Create order
            $sql = "INSERT INTO orders (user_id, total_amount, shipping_address, 
                                      billing_address, payment_method, status, created_at) 
                    VALUES (?, ?, ?, ?, ?, 'pending', NOW())";
            
            $this->db->query($sql, [
                $orderData['user_id'],
                $orderData['total_amount'],
                json_encode($orderData['shipping_address']),
                json_encode($orderData['billing_address']),
                $orderData['payment_method']
            ]);
            
            $orderId = (int) $this->db->lastInsertId();
            
            // Create order items
            foreach ($items as $item) {
                $this->createOrderItem($orderId, $item);
                $this->updateProductStock($item['product_id'], -$item['quantity']);
            }
            
            $this->db->getConnection()->commit();
            return $orderId;
            
        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }

    private function createOrderItem(int $orderId, array $item): void
    {
        $sql = "INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)";
        
        $this->db->query($sql, [
            $orderId,
            $item['product_id'],
            $item['quantity'],
            $item['price']
        ]);
    }

    private function updateProductStock(int $productId, int $quantityChange): void
    {
        $sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
        $this->db->query($sql, [$quantityChange, $productId]);
    }

    public function findByUserId(int $userId): array
    {
        $sql = "SELECT o.*, COUNT(oi.id) as item_count 
                FROM orders o 
                LEFT JOIN order_items oi ON o.id = oi.order_id 
                WHERE o.user_id = ? 
                GROUP BY o.id 
                ORDER BY o.created_at DESC";
        
        return $this->db->fetchAll($sql, [$userId]);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT o.*, u.first_name, u.last_name, u.email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?";
        
        return $this->db->fetch($sql, [$id]);
    }

    public function getOrderItems(int $orderId): array
    {
        $sql = "SELECT oi.*, p.name, p.sku 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?";
        
        return $this->db->fetchAll($sql, [$orderId]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $sql = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->query($sql, [$status, $id]);
        return $stmt->rowCount() > 0;
    }
}
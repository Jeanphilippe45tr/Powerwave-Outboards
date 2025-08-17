<?php
namespace App\Models;

use App\Core\Database;

class Product
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(array $filters = []): array
    {
        $sql = "SELECT p.*, c.name as category_name, b.name as brand_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN brands b ON p.brand_id = b.id 
                WHERE p.deleted_at IS NULL";
        
        $params = [];
        
        if (!empty($filters['category_id'])) {
            $sql .= " AND p.category_id = ?";
            $params[] = $filters['category_id'];
        }
        
        if (!empty($filters['brand_id'])) {
            $sql .= " AND p.brand_id = ?";
            $params[] = $filters['brand_id'];
        }
        
        if (!empty($filters['min_price'])) {
            $sql .= " AND p.price >= ?";
            $params[] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $sql .= " AND p.price <= ?";
            $params[] = $filters['max_price'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY p.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT ?";
            $params[] = (int) $filters['limit'];
            
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET ?";
                $params[] = (int) $filters['offset'];
            }
        }
        
        return $this->db->fetchAll($sql, $params);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT p.*, c.name as category_name, b.name as brand_name,
                       GROUP_CONCAT(pi.image_url) as images
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN brands b ON p.brand_id = b.id 
                LEFT JOIN product_images pi ON p.id = pi.product_id
                WHERE p.id = ? AND p.deleted_at IS NULL 
                GROUP BY p.id";
        
        $product = $this->db->fetch($sql, [$id]);
        
        if ($product && $product['images']) {
            $product['images'] = explode(',', $product['images']);
        } else {
            $product['images'] = [];
        }
        
        return $product;
    }

    public function create(array $data): ?int
    {
        $sql = "INSERT INTO products (name, description, price, horsepower, fuel_type, 
                                    propulsion_type, weight, warranty_years, stock_quantity, 
                                    category_id, brand_id, sku, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $this->db->query($sql, [
            $data['name'],
            $data['description'],
            $data['price'],
            $data['horsepower'],
            $data['fuel_type'],
            $data['propulsion_type'],
            $data['weight'] ?? null,
            $data['warranty_years'] ?? 1,
            $data['stock_quantity'] ?? 0,
            $data['category_id'],
            $data['brand_id'],
            $data['sku']
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        
        $allowedFields = ['name', 'description', 'price', 'horsepower', 'fuel_type', 
                         'propulsion_type', 'weight', 'warranty_years', 'stock_quantity', 
                         'category_id', 'brand_id', 'sku'];
        
        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $this->db->query($sql, $values);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?";
        $stmt = $this->db->query($sql, [$id]);
        return $stmt->rowCount() > 0;
    }

    public function updateStock(int $id, int $quantity): bool
    {
        $sql = "UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->query($sql, [$quantity, $id]);
        return $stmt->rowCount() > 0;
    }
}
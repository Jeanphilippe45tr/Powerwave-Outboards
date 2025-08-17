<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Cart;

class CartController
{
    private Cart $cartModel;

    public function __construct()
    {
        $this->cartModel = new Cart();
    }

    public function index(Request $request): Response
    {
        $userId = $request->get('user_id');
        $items = $this->cartModel->getItems($userId);
        $total = $this->cartModel->getTotalAmount($userId);
        
        return Response::success([
            'items' => $items,
            'total_amount' => $total,
            'item_count' => count($items)
        ]);
    }

    public function addItem(Request $request): Response
    {
        $userId = $request->get('user_id');
        $data = $request->getBody();
        
        if (empty($data['product_id']) || empty($data['quantity'])) {
            return Response::error('Product ID and quantity are required', 422);
        }
        
        if ($data['quantity'] < 1) {
            return Response::error('Quantity must be at least 1', 422);
        }
        
        if ($this->cartModel->addItem($userId, $data['product_id'], $data['quantity'])) {
            return Response::success(['message' => 'Item added to cart']);
        }
        
        return Response::error('Failed to add item to cart', 500);
    }

    public function updateItem(Request $request): Response
    {
        $itemId = (int) $request->getParam('id');
        $data = $request->getBody();
        
        if (empty($data['quantity'])) {
            return Response::error('Quantity is required', 422);
        }
        
        if ($this->cartModel->updateQuantity($itemId, $data['quantity'])) {
            return Response::success(['message' => 'Cart item updated']);
        }
        
        return Response::error('Failed to update cart item', 500);
    }

    public function removeItem(Request $request): Response
    {
        $itemId = (int) $request->getParam('id');
        
        if ($this->cartModel->removeItem($itemId)) {
            return Response::success(['message' => 'Item removed from cart']);
        }
        
        return Response::error('Failed to remove item from cart', 500);
    }

    public function clear(Request $request): Response
    {
        $userId = $request->get('user_id');
        
        if ($this->cartModel->clearCart($userId)) {
            return Response::success(['message' => 'Cart cleared']);
        }
        
        return Response::error('Failed to clear cart', 500);
    }
}
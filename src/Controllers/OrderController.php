<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Order;
use App\Models\Cart;

class OrderController
{
    private Order $orderModel;
    private Cart $cartModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->cartModel = new Cart();
    }

    public function index(Request $request): Response
    {
        $userId = $request->get('user_id');
        $orders = $this->orderModel->findByUserId($userId);
        
        return Response::success(['orders' => $orders]);
    }

    public function show(Request $request): Response
    {
        $id = (int) $request->getParam('id');
        $userId = $request->get('user_id');
        
        $order = $this->orderModel->findById($id);
        
        if (!$order) {
            return Response::error('Order not found', 404);
        }
        
        // Check if user owns this order
        if ($order['user_id'] !== $userId) {
            return Response::error('Access denied', 403);
        }
        
        $items = $this->orderModel->getOrderItems($id);
        $order['items'] = $items;
        
        return Response::success(['order' => $order]);
    }

    public function store(Request $request): Response
    {
        $userId = $request->get('user_id');
        $data = $request->getBody();
        
        // Get cart items
        $cartItems = $this->cartModel->getItems($userId);
        
        if (empty($cartItems)) {
            return Response::error('Cart is empty', 422);
        }
        
        // Validate required fields
        $required = ['shipping_address', 'billing_address', 'payment_method'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return Response::error("Field $field is required", 422);
            }
        }
        
        // Calculate total
        $totalAmount = array_sum(array_column($cartItems, 'subtotal'));
        
        $orderData = [
            'user_id' => $userId,
            'total_amount' => $totalAmount,
            'shipping_address' => $data['shipping_address'],
            'billing_address' => $data['billing_address'],
            'payment_method' => $data['payment_method']
        ];
        
        try {
            $orderId = $this->orderModel->create($orderData, $cartItems);
            
            // Clear cart after successful order
            $this->cartModel->clearCart($userId);
            
            $order = $this->orderModel->findById($orderId);
            
            return Response::success([
                'message' => 'Order created successfully',
                'order' => $order
            ], 201);
            
        } catch (\Exception $e) {
            return Response::error('Failed to create order: ' . $e->getMessage(), 500);
        }
    }
}
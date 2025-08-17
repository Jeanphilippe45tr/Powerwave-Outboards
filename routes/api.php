<?php
use App\Controllers\AuthController;
use App\Controllers\ProductController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Middleware\AuthMiddleware;

// Authentication routes
$router->post('/api/auth/register', function($request) {
    return (new AuthController())->register($request);
});

$router->post('/api/auth/login', function($request) {
    return (new AuthController())->login($request);
});

// Protected authentication routes
$router->get('/api/auth/profile', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new AuthController())->profile($request);
});

$router->put('/api/auth/profile', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new AuthController())->updateProfile($request);
});

// Product routes (public)
$router->get('/api/products', function($request) {
    return (new ProductController())->index($request);
});

$router->get('/api/products/{id}', function($request) {
    return (new ProductController())->show($request);
});

// Protected product routes (admin only)
$router->post('/api/products', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new ProductController())->store($request);
});

$router->put('/api/products/{id}', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new ProductController())->update($request);
});

$router->delete('/api/products/{id}', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new ProductController())->destroy($request);
});

// Cart routes (protected)
$router->get('/api/cart', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new CartController())->index($request);
});

$router->post('/api/cart/items', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new CartController())->addItem($request);
});

$router->put('/api/cart/items/{id}', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new CartController())->updateItem($request);
});

$router->delete('/api/cart/items/{id}', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new CartController())->removeItem($request);
});

$router->delete('/api/cart', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new CartController())->clear($request);
});

// Order routes (protected)
$router->get('/api/orders', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new OrderController())->index($request);
});

$router->get('/api/orders/{id}', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new OrderController())->show($request);
});

$router->post('/api/orders', function($request) {
    $middleware = new AuthMiddleware();
    $middlewareResponse = $middleware->handle($request);
    if ($middlewareResponse) return $middlewareResponse;
    
    return (new OrderController())->store($request);
});

// Health check
$router->get('/api/health', function($request) {
    return new \App\Core\Response(['status' => 'OK', 'timestamp' => date('c')]);
});
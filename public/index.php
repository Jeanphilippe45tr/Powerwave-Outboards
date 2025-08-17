<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/bootstrap.php';

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $request = new Request();
    $router = new Router();
    
    // Load routes
    require_once __DIR__ . '/../routes/api.php';
    
    $response = $router->dispatch($request);
    $response->send();
    
} catch (Exception $e) {
    $response = new Response([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage()
    ], 500);
    $response->send();
}
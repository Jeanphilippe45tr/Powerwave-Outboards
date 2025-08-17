<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Services\JWTService;

class AuthMiddleware
{
    private JWTService $jwtService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
    }

    public function handle(Request $request): ?Response
    {
        $token = $request->getAuthToken();
        
        if (!$token) {
            return Response::error('Access token required', 401);
        }
        
        $payload = $this->jwtService->validateToken($token);
        
        if (!$payload) {
            return Response::error('Invalid or expired token', 401);
        }
        
        // Add user data to request
        $request->getBody()['user_id'] = $payload['user_id'];
        $request->getBody()['user_email'] = $payload['user_email'];
        $request->getBody()['user_role'] = $payload['user_role'];
        
        return null; // Continue to next middleware/controller
    }
}
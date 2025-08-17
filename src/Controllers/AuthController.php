<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;
use App\Services\JWTService;
use App\Services\ValidationService;

class AuthController
{
    private User $userModel;
    private JWTService $jwtService;
    private ValidationService $validator;

    public function __construct()
    {
        $this->userModel = new User();
        $this->jwtService = new JWTService();
        $this->validator = new ValidationService();
    }

    public function register(Request $request): Response
    {
        $data = $request->getBody();
        
        // Validate input
        $validation = $this->validator->validate($data, [
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:20',
            'email' => 'required|email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20'
        ]);
        
        if (!$validation['valid']) {
            return Response::error('Validation failed: ' . implode(', ', $validation['errors']), 422);
        }
        
        // Check if user already exists
        if ($this->userModel->findByEmail($data['email'])) {
            return Response::error('User with this email already exists', 409);
        }

        // Check if username already exists
        if ($this->userModel->findByUsername($data['username'])) {
            return Response::error('User with this username already exists', 409);
        }
        
        try {
            $userId = $this->userModel->create($data);
            $user = $this->userModel->findById($userId);
            $token = $this->jwtService->generateToken($user);
            
            return Response::success([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token
            ], 201);
            
        } catch (\Exception $e) {
            return Response::error('Registration failed', 500);
        }
    }

    public function login(Request $request): Response
    {
        $data = $request->getBody();
        
        // Validate input
        $validation = $this->validator->validate($data, [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        if (!$validation['valid']) {
            return Response::error('Validation failed: ' . implode(', ', $validation['errors']), 422);
        }
        
        $user = $this->userModel->findByEmail($data['email']);
        
        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            return Response::error('Invalid credentials', 401);
        }
        
        // Update last login
        $this->userModel->updateLastLogin($user['id']);
        
        // Remove password from response
        unset($user['password']);
        
        $token = $this->jwtService->generateToken($user);
        
        return Response::success([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function profile(Request $request): Response
    {
        $userId = $request->get('user_id'); // Set by auth middleware
        $user = $this->userModel->findById($userId);
        
        if (!$user) {
            return Response::error('User not found', 404);
        }
        
        return Response::success(['user' => $user]);
    }

    public function updateProfile(Request $request): Response
    {
        $userId = $request->get('user_id');
        $data = $request->getBody();
        
        $validation = $this->validator->validate($data, [
            'first_name' => 'nullable|string|max:50',
            'last_name' => 'nullable|string|max:50',
            'username' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20'
        ]);
        
        if (!$validation['valid']) {
            return Response::error('Validation failed: ' . implode(', ', $validation['errors']), 422);
        }

        // Check if username already exists
        if ($this->userModel->findByUsername($data['username'])) {
            return Response::error('User with this username already exists', 409);
        }
        
        if ($this->userModel->update($userId, $data)) {
            $user = $this->userModel->findById($userId);
            return Response::success(['user' => $user]);
        }
        
        return Response::error('Update failed', 500);
    }
}
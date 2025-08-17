<?php
namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService
{
    private string $secret;
    private int $expiry;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'];
        $this->expiry = (int) $_ENV['JWT_EXPIRY'];
    }

    public function generateToken(array $user): string
    {
        $payload = [
            'iss' => $_ENV['APP_URL'],
            'iat' => time(),
            'exp' => time() + $this->expiry,
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'customer'
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}
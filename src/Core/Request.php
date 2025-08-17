<?php
namespace App\Core;

class Request
{
    private array $params = [];
    private array $body;
    private array $headers;

    public function __construct()
    {
        $this->body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->headers = getallheaders() ?: [];
    }

    public function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function getPath(): string
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return rtrim($path, '/') ?: '/';
    }

    public function getBody(): array
    {
        return $this->body;
    }

    public function get(string $key, $default = null)
    {
        return $this->body[$key] ?? $_GET[$key] ?? $default;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[$name] ?? null;
    }

    public function getAuthToken(): ?string
    {
        $header = $this->getHeader('Authorization');
        if ($header && strpos($header, 'Bearer ') === 0) {
            return substr($header, 7);
        }
        return null;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getParam(string $key): ?string
    {
        return $this->params[$key] ?? null;
    }

    public function getParams(): array
    {
        return $this->params;
    }
}
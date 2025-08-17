<?php
namespace App\Core;

class Response
{
    private array $data;
    private int $statusCode;
    private array $headers;

    public function __construct(array $data = [], int $statusCode = 200, array $headers = [])
    {
        $this->data = $data;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    public function send(): void
    {
        http_response_code($this->statusCode);
        
        foreach ($this->headers as $header) {
            header($header);
        }
        
        echo json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public static function success(array $data = [], int $statusCode = 200): self
    {
        return new self($data, $statusCode);
    }

    public static function error(string $message, int $statusCode = 400): self
    {
        return new self(['error' => $message], $statusCode);
    }
}
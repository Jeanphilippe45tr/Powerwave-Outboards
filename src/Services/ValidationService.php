<?php
namespace App\Services;

class ValidationService
{
    public function validate(array $data, array $rules): array
    {
        $errors = [];
        $valid = true;
        
        foreach ($rules as $field => $rule) {
            $ruleArray = explode('|', $rule);
            $value = $data[$field] ?? null;
            
            foreach ($ruleArray as $r) {
                if (strpos($r, ':') !== false) {
                    [$ruleName, $parameter] = explode(':', $r);
                } else {
                    $ruleName = $r;
                    $parameter = null;
                }
                
                if (!$this->validateRule($field, $value, $ruleName, $parameter)) {
                    $errors[] = $this->getErrorMessage($field, $ruleName, $parameter);
                    $valid = false;
                }
            }
        }
        
        return ['valid' => $valid, 'errors' => $errors];
    }
    
    private function validateRule(string $field, $value, string $rule, ?string $parameter): bool
    {
        switch ($rule) {
            case 'required':
                return !empty($value);
            case 'nullable':
                return true;
            case 'string':
                return is_string($value) || is_null($value);
            case 'email':
                return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
            case 'min':
                return strlen($value) >= (int) $parameter;
            case 'max':
                return strlen($value) <= (int) $parameter;
            case 'numeric':
                return is_numeric($value);
            default:
                return true;
        }
    }
    
    private function getErrorMessage(string $field, string $rule, ?string $parameter): string
    {
        $messages = [
            'required' => "$field is required",
            'string' => "$field must be a string",
            'email' => "$field must be a valid email",
            'min' => "$field must be at least $parameter characters",
            'max' => "$field must not exceed $parameter characters",
            'numeric' => "$field must be numeric"
        ];
        
        return $messages[$rule] ?? "$field validation failed";
    }
}
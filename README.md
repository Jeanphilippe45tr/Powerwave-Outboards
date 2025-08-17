# Boat Motors Ecommerce API

A comprehensive PHP backend API for an ecommerce system specializing in boat motors and marine equipment.

## Features

- **User Management**: Registration, authentication, and profile management
- **Product Catalog**: Complete product management with categories, brands, and detailed specifications
- **Shopping Cart**: Add, update, remove items with real-time calculations
- **Order Processing**: Complete order workflow from cart to delivery
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean, standardized API endpoints
- **Input Validation**: Comprehensive data validation and sanitization
- **Database Security**: Prepared statements and proper SQL injection prevention

## Requirements

- PHP 8.0 or higher
- MySQL 5.7 or higher
- Composer

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your database settings in `.env`

5. Create the database and run the schema:
   ```bash
   mysql -u your_username -p your_database < database/schema.sql
   ```

6. Start the development server:
   ```bash
   composer start
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Products
- `GET /api/products` - List products with filtering
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

### Shopping Cart
- `GET /api/cart` - Get cart contents (protected)
- `POST /api/cart/items` - Add item to cart (protected)
- `PUT /api/cart/items/{id}` - Update cart item (protected)
- `DELETE /api/cart/items/{id}` - Remove cart item (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `GET /api/orders` - List user orders (protected)
- `GET /api/orders/{id}` - Get order details (protected)
- `POST /api/orders` - Create order from cart (protected)

### Health Check
- `GET /api/health` - API health status

## Database Schema

The system includes tables for:
- Users with role-based access
- Products with motor-specific attributes (horsepower, fuel type, etc.)
- Categories and brands for organization
- Shopping cart functionality
- Complete order management
- Product reviews and ratings
- Product image management

## Security Features

- Password hashing with PHP's `password_hash()`
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention with prepared statements
- CORS handling
- Role-based access control

## Project Structure

```
src/
├── Controllers/     # API controllers
├── Models/         # Database models
├── Services/       # Business logic services
├── Middleware/     # Request middleware
└── Core/          # Core framework classes

routes/
└── api.php        # API route definitions

database/
└── schema.sql     # Database schema

public/
└── index.php      # Application entry point
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"password123"}'
```

### Get products with filtering
```bash
curl "http://localhost:8000/api/products?category_id=1&min_price=1000&max_price=5000"
```

### Add item to cart (requires authentication)
```bash
curl -X POST http://localhost:8000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"product_id":1,"quantity":1}'
```
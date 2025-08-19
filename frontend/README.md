# Marine Motors Pro - Frontend

A modern, responsive frontend for the Boat Motors Ecommerce API built with HTML5, CSS3, JavaScript, and Bootstrap 5.

## Features

### 🎨 Modern Design
- Clean, professional interface with marine-themed styling
- Responsive design that works on all devices
- Smooth animations and micro-interactions
- Bootstrap 5 components with custom styling

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Profile management
- Secure session handling

### 🛍️ Product Catalog
- Browse products with advanced filtering
- Search by name, category, brand, and price range
- Detailed product specifications for marine motors
- High-quality product images
- Stock status indicators

### 🛒 Shopping Cart
- Add/remove items from cart
- Update quantities
- Real-time cart total calculation
- Persistent cart across sessions

### 📦 Order Management
- Complete checkout process
- Order history and tracking
- Order status updates
- Detailed order information

### ⚡ Performance Features
- Debounced search and filtering
- Lazy loading of images
- Optimized API calls
- Local storage caching
- Error handling and retry logic

## File Structure

```
frontend/
├── index.html          # Main HTML file with all sections
├── styles.css          # Custom CSS with marine theme
├── app.js             # Main application logic
├── api.js             # API communication layer
└── README.md          # This file
```

## Setup Instructions

1. **Backend Setup**: Ensure the PHP backend is running on `http://localhost:8000`

2. **Frontend Setup**: 
   - Open `index.html` in a web browser
   - Or serve via a local web server for better development experience

3. **Configuration**:
   - Update the API base URL in `api.js` if your backend runs on a different port
   - Modify the CORS settings in your PHP backend to allow frontend requests

## API Integration

The frontend connects to the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - List products with filtering
- `GET /api/products/{id}` - Get product details

### Shopping Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders` - Create order

## Key Features Explained

### Product Display
- **Motor Specifications**: Displays horsepower, fuel type, propulsion type, weight, and warranty
- **Smart Filtering**: Real-time filtering by category, brand, price range, and search terms
- **Stock Management**: Visual indicators for stock levels (In Stock, Low Stock, Out of Stock)

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages and recovery options
- **Toast Notifications**: Non-intrusive success and error messages

### Shopping Experience
- **Quick Add to Cart**: One-click add to cart from product grid
- **Detailed Product View**: Modal with full specifications and quantity selection
- **Cart Management**: Easy quantity updates and item removal
- **Secure Checkout**: Complete order form with address and payment options

### Performance Optimizations
- **Debounced Search**: Reduces API calls during typing
- **Image Optimization**: Placeholder images and error handling
- **Local Storage**: Caches authentication tokens and user preferences
- **Lazy Loading**: Images load as needed

## Customization

### Styling
- Modify CSS variables in `:root` to change the color scheme
- Update the hero background image URL in `styles.css`
- Customize Bootstrap components with utility classes

### Functionality
- Add new product filters in the `loadProducts()` method
- Extend the API class with additional endpoints
- Implement additional user features like wishlists or reviews

### Images
- Replace placeholder images with actual product photos
- Add image galleries for products
- Implement image upload for user profiles

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- **Bootstrap 5.3.0**: UI framework
- **Font Awesome 6.4.0**: Icons
- **Modern JavaScript**: ES6+ features

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All API calls include proper error handling
- Input validation on both frontend and backend
- CORS configuration required on backend

## Future Enhancements

- Progressive Web App (PWA) features
- Offline functionality
- Push notifications for order updates
- Advanced product filtering (price sliders, multi-select)
- Product reviews and ratings
- Wishlist functionality
- Social sharing
- Live chat support
- Advanced search with autocomplete
- Product comparison feature

## Development Tips

1. **Testing**: Use browser developer tools to test responsive design
2. **Debugging**: Check browser console for API errors and JavaScript issues
3. **Performance**: Use Lighthouse to audit performance and accessibility
4. **SEO**: Add meta tags and structured data for better search visibility

## Production Deployment

1. **Minification**: Minify CSS and JavaScript files
2. **CDN**: Use CDN for Bootstrap and Font Awesome
3. **HTTPS**: Ensure all connections use HTTPS
4. **Caching**: Implement proper caching headers
5. **Monitoring**: Add error tracking and analytics
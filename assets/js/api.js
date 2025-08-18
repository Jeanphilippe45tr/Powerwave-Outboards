// API Configuration
const API_CONFIG = {
    baseURL: 'http://localhost/your-php-backend', // Update this to match your PHP backend URL
    endpoints: {
        // Authentication
        login: '/api/auth/login',
        register: '/api/auth/register',
        profile: '/api/auth/profile',
        
        // Products
        products: '/api/products',
        product: '/api/products/{id}',
        
        // Cart
        cart: '/api/cart',
        cartItems: '/api/cart/items',
        cartItem: '/api/cart/items/{id}',
        
        // Orders
        orders: '/api/orders',
        order: '/api/orders/{id}',
        
        // Health check
        health: '/api/health'
    }
};

// API Helper Class
class API {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // Get default headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            showLoading();
            const response = await fetch(url, config);
            
            // Handle different response types
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            showToast('Error', error.message, 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.post(API_CONFIG.endpoints.login, { email, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async register(userData) {
        return this.post(API_CONFIG.endpoints.register, userData);
    }

    async getProfile() {
        return this.get(API_CONFIG.endpoints.profile);
    }

    async updateProfile(userData) {
        return this.put(API_CONFIG.endpoints.profile, userData);
    }

    // Product methods
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_CONFIG.endpoints.products}?${queryString}` : API_CONFIG.endpoints.products;
        return this.get(endpoint);
    }

    async getProduct(id) {
        return this.get(API_CONFIG.endpoints.product.replace('{id}', id));
    }

    async createProduct(productData) {
        return this.post(API_CONFIG.endpoints.products, productData);
    }

    async updateProduct(id, productData) {
        return this.put(API_CONFIG.endpoints.product.replace('{id}', id), productData);
    }

    async deleteProduct(id) {
        return this.delete(API_CONFIG.endpoints.product.replace('{id}', id));
    }

    // Cart methods
    async getCart() {
        return this.get(API_CONFIG.endpoints.cart);
    }

    async addToCart(productId, quantity = 1) {
        return this.post(API_CONFIG.endpoints.cartItems, { 
            product_id: productId, 
            quantity: quantity 
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.put(API_CONFIG.endpoints.cartItem.replace('{id}', itemId), { 
            quantity: quantity 
        });
    }

    async removeFromCart(itemId) {
        return this.delete(API_CONFIG.endpoints.cartItem.replace('{id}', itemId));
    }

    async clearCart() {
        return this.delete(API_CONFIG.endpoints.cart);
    }

    // Order methods
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_CONFIG.endpoints.orders}?${queryString}` : API_CONFIG.endpoints.orders;
        return this.get(endpoint);
    }

    async getOrder(id) {
        return this.get(API_CONFIG.endpoints.order.replace('{id}', id));
    }

    async createOrder(orderData = {}) {
        return this.post(API_CONFIG.endpoints.orders, orderData);
    }

    // Health check
    async healthCheck() {
        return this.get(API_CONFIG.endpoints.health);
    }
}

// Create global API instance
const api = new API();

// Utility functions
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('show');
}

function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('auth_token');
}

// Get user data from localStorage
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Set user data in localStorage
function setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
}

// Remove user data from localStorage
function removeUserData() {
    localStorage.removeItem('user_data');
}
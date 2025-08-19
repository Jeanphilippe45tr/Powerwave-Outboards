// API Configuration and Helper Functions
class API {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('auth_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    // Get authentication headers
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: this.getHeaders(options.auth),
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication Methods
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }

    async getProfile() {
        return this.request('/auth/profile', {
            auth: true
        });
    }

    async updateProfile(userData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            auth: true,
            body: userData
        });
    }

    // Product Methods
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return this.request(endpoint);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    // Cart Methods
    async getCart() {
        return this.request('/cart', {
            auth: true
        });
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart/items', {
            method: 'POST',
            auth: true,
            body: {
                product_id: productId,
                quantity: quantity
            }
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'PUT',
            auth: true,
            body: {
                quantity: quantity
            }
        });
    }

    async removeCartItem(itemId) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'DELETE',
            auth: true
        });
    }

    async clearCart() {
        return this.request('/cart', {
            method: 'DELETE',
            auth: true
        });
    }

    // Order Methods
    async getOrders() {
        return this.request('/orders', {
            auth: true
        });
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`, {
            auth: true
        });
    }

    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            auth: true,
            body: orderData
        });
    }

    // Health Check
    async healthCheck() {
        return this.request('/health');
    }

    // Utility Methods
    isAuthenticated() {
        return !!this.token;
    }

    logout() {
        this.setToken(null);
        window.location.reload();
    }
}

// Create global API instance
const api = new API();

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(dateString));
}

function getStockStatus(quantity) {
    if (quantity === 0) {
        return { text: 'Out of Stock', class: 'out-of-stock' };
    } else if (quantity <= 5) {
        return { text: 'Low Stock', class: 'low-stock' };
    } else {
        return { text: 'In Stock', class: 'in-stock' };
    }
}

function getFuelTypeBadge(fuelType) {
    const badges = {
        'gasoline': 'gasoline',
        'electric': 'electric',
        'diesel': 'diesel'
    };
    return badges[fuelType] || 'gasoline';
}

function getMotorTypeIcon(propulsionType) {
    const icons = {
        'outboard': 'fas fa-ship',
        'inboard': 'fas fa-cog',
        'sterndrive': 'fas fa-anchor',
        'jet': 'fas fa-water'
    };
    return icons[propulsionType] || 'fas fa-ship';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastBody = document.getElementById('toastBody');
    
    // Set message
    toastBody.textContent = message;
    
    // Set toast type
    toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : ''}`;
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('d-none', !show);
    }
}

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

// Error Handling
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Invalid or expired token')) {
        api.logout();
        showToast('Session expired. Please login again.', 'error');
        return;
    }
    
    showToast(error.message || 'An error occurred. Please try again.', 'error');
}

// Local Storage Helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
}

// Image Helpers
function getProductImageUrl(product) {
    // Since we're using placeholder images, return a boat motor image from Pexels
    const motorImages = [
        'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ];
    
    // Use product ID to consistently assign the same image
    const imageIndex = (product.id || 0) % motorImages.length;
    return motorImages[imageIndex];
}

// Validation Helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 8;
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Form Validation
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
        const value = formData.get(field) || document.getElementById(field)?.value;
        const rule = rules[field];

        if (rule.required && !validateRequired(value)) {
            errors[field] = `${rule.label} is required`;
            isValid = false;
        } else if (value && rule.type === 'email' && !validateEmail(value)) {
            errors[field] = 'Please enter a valid email address';
            isValid = false;
        } else if (value && rule.type === 'password' && !validatePassword(value)) {
            errors[field] = 'Password must be at least 8 characters long';
            isValid = false;
        }
    });

    // Display errors
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        const errorDiv = document.getElementById(`${field}Error`);
        
        if (input) {
            input.classList.add('is-invalid');
        }
        
        if (errorDiv) {
            errorDiv.textContent = errors[field];
        }
    });

    // Clear previous errors for valid fields
    Object.keys(rules).forEach(field => {
        if (!errors[field]) {
            const input = document.getElementById(field);
            const errorDiv = document.getElementById(`${field}Error`);
            
            if (input) {
                input.classList.remove('is-invalid');
            }
            
            if (errorDiv) {
                errorDiv.textContent = '';
            }
        }
    });

    return { isValid, errors };
}

// Animation Helpers
function animateElement(element, animation, duration = 600) {
    element.style.animation = `${animation} ${duration}ms ease-out`;
    
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '1';
    }, 10);
}

function fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}
// Main Application Logic
class MarineMotorsApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.products = [];
        this.isLoginMode = true;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        await this.loadProducts();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('toggleAuthMode').addEventListener('click', () => this.toggleAuthMode());

        // Cart
        document.getElementById('cartBtn').addEventListener('click', () => this.showCart());

        // Profile
        document.getElementById('profileForm').addEventListener('submit', (e) => this.updateProfile(e));

        // Checkout
        document.getElementById('checkoutForm').addEventListener('submit', (e) => this.handleCheckout(e));
        document.getElementById('sameAsShipping').addEventListener('change', (e) => this.toggleBillingFields(e));

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.loadProducts());
        document.getElementById('brandFilter').addEventListener('change', () => this.loadProducts());
        document.getElementById('minPrice').addEventListener('input', debounce(() => this.loadProducts(), 500));
        document.getElementById('maxPrice').addEventListener('input', debounce(() => this.loadProducts(), 500));
        document.getElementById('searchInput').addEventListener('input', debounce(() => this.loadProducts(), 500));

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    checkAuthStatus() {
        if (api.isAuthenticated()) {
            this.loadUserProfile();
        }
    }

    async loadUserProfile() {
        try {
            const response = await api.getProfile();
            this.currentUser = response.user;
            this.updateAuthUI();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            api.logout();
        }
    }

    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        
        if (this.currentUser) {
            authSection.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-2"></i>${this.currentUser.first_name}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="app.showProfile()">
                            <i class="fas fa-user me-2"></i>Profile
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="app.showOrders()">
                            <i class="fas fa-box me-2"></i>My Orders
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="app.logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a></li>
                    </ul>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button class="btn btn-outline-light" id="loginBtn" onclick="app.showLoginModal()">
                    Login
                </button>
            `;
        }
    }

    showLoginModal() {
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        const title = document.getElementById('loginModalTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const toggleBtn = document.getElementById('toggleAuthMode');
        
        const firstNameGroup = document.getElementById('firstNameGroup');
        const lastNameGroup = document.getElementById('lastNameGroup');
        const usernameGroup = document.getElementById('usernameGroup');
        const phoneGroup = document.getElementById('phoneGroup');

        if (this.isLoginMode) {
            title.textContent = 'Login';
            submitBtn.textContent = 'Login';
            toggleBtn.textContent = "Don't have an account? Register";
            
            firstNameGroup.style.display = 'none';
            lastNameGroup.style.display = 'none';
            usernameGroup.style.display = 'none';
            phoneGroup.style.display = 'none';
        } else {
            title.textContent = 'Register';
            submitBtn.textContent = 'Register';
            toggleBtn.textContent = 'Already have an account? Login';
            
            firstNameGroup.style.display = 'block';
            lastNameGroup.style.display = 'block';
            usernameGroup.style.display = 'block';
            phoneGroup.style.display = 'block';
        }
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            let response;
            
            if (this.isLoginMode) {
                response = await api.login({ email, password });
            } else {
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const username = document.getElementById('username').value;
                const phone = document.getElementById('phone').value;
                
                response = await api.register({
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    email: email,
                    password: password,
                    phone: phone
                });
            }
            
            api.setToken(response.token);
            this.currentUser = response.user;
            this.updateAuthUI();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
            
            showToast(`${this.isLoginMode ? 'Login' : 'Registration'} successful!`, 'success');
            
            // Reset form
            document.getElementById('authForm').reset();
            
        } catch (error) {
            handleApiError(error);
        }
    }

    logout() {
        api.logout();
        this.currentUser = null;
        this.cart = [];
        this.updateAuthUI();
        this.updateCartDisplay();
        showToast('Logged out successfully', 'success');
    }

    async loadProducts() {
        showLoading(true);
        
        try {
            const filters = {
                category_id: document.getElementById('categoryFilter').value,
                brand_id: document.getElementById('brandFilter').value,
                min_price: document.getElementById('minPrice').value,
                max_price: document.getElementById('maxPrice').value,
                search: document.getElementById('searchInput').value,
                limit: 20
            };

            const response = await api.getProducts(filters);
            this.products = response.products || [];
            this.renderProducts();
            
        } catch (error) {
            handleApiError(error);
            this.products = [];
            this.renderProducts();
        } finally {
            showLoading(false);
        }
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h4>No products found</h4>
                        <p>Try adjusting your search criteria or browse all products.</p>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const stockStatus = getStockStatus(product.stock_quantity);
        const imageUrl = getProductImageUrl(product);
        const motorIcon = getMotorTypeIcon(product.propulsion_type);
        const fuelBadge = getFuelTypeBadge(product.fuel_type);

        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card product-card h-100">
                    <div class="image-zoom">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/400x300/e9ecef/6c757d?text=Motor'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title">${product.name}</h5>
                            <span class="fuel-badge ${fuelBadge}">${product.fuel_type}</span>
                        </div>
                        
                        <p class="card-text text-muted flex-grow-1">${product.description || 'High-quality marine motor'}</p>
                        
                        <div class="motor-specs mb-3">
                            <div class="spec-item">
                                <span class="spec-label"><i class="${motorIcon} me-2"></i>Type:</span>
                                <span class="spec-value">${product.propulsion_type}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-tachometer-alt me-2"></i>Power:</span>
                                <span class="spec-value horsepower">${product.horsepower} HP</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-weight me-2"></i>Weight:</span>
                                <span class="spec-value">${product.weight || 'N/A'} lbs</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-shield-alt me-2"></i>Warranty:</span>
                                <span class="spec-value">${product.warranty_years} years</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="product-price">${formatPrice(product.price)}</span>
                            <span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary flex-grow-1" onclick="app.showProductDetail(${product.id})">
                                <i class="fas fa-eye me-2"></i>Details
                            </button>
                            <button class="btn btn-primary btn-add-to-cart" 
                                    onclick="app.addToCart(${product.id})"
                                    ${product.stock_quantity === 0 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async showProductDetail(productId) {
        try {
            const response = await api.getProduct(productId);
            const product = response.product;
            
            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            const modalTitle = document.getElementById('productModalTitle');
            const modalBody = document.getElementById('productModalBody');
            
            modalTitle.textContent = product.name;
            
            const stockStatus = getStockStatus(product.stock_quantity);
            const imageUrl = getProductImageUrl(product);
            const motorIcon = getMotorTypeIcon(product.propulsion_type);
            const fuelBadge = getFuelTypeBadge(product.fuel_type);
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="image-zoom">
                            <img src="${imageUrl}" class="img-fluid rounded" alt="${product.name}"
                                 onerror="this.src='https://via.placeholder.com/500x400/e9ecef/6c757d?text=Motor'">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h4>${product.name}</h4>
                            <span class="fuel-badge ${fuelBadge}">${product.fuel_type}</span>
                        </div>
                        
                        <p class="text-muted mb-4">${product.description || 'High-quality marine motor for all your boating needs.'}</p>
                        
                        <div class="motor-specs mb-4">
                            <h6 class="fw-bold mb-3">Specifications</h6>
                            <div class="spec-item">
                                <span class="spec-label"><i class="${motorIcon} me-2"></i>Propulsion Type:</span>
                                <span class="spec-value">${product.propulsion_type}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-tachometer-alt me-2"></i>Horsepower:</span>
                                <span class="spec-value horsepower">${product.horsepower} HP</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-gas-pump me-2"></i>Fuel Type:</span>
                                <span class="spec-value">${product.fuel_type}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-weight me-2"></i>Weight:</span>
                                <span class="spec-value">${product.weight || 'N/A'} lbs</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-shield-alt me-2"></i>Warranty:</span>
                                <span class="spec-value warranty-badge">${product.warranty_years} years</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-barcode me-2"></i>SKU:</span>
                                <span class="spec-value">${product.sku}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-building me-2"></i>Brand:</span>
                                <span class="spec-value">${product.brand_name}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label"><i class="fas fa-tags me-2"></i>Category:</span>
                                <span class="spec-value">${product.category_name}</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <span class="product-price h4">${formatPrice(product.price)}</span>
                            <span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <div class="quantity-controls">
                                <button type="button" onclick="this.nextElementSibling.stepDown()">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" value="1" min="1" max="${product.stock_quantity}" id="productQuantity">
                                <button type="button" onclick="this.previousElementSibling.stepUp()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-primary flex-grow-1 btn-add-to-cart" 
                                    onclick="app.addToCartWithQuantity(${product.id})"
                                    ${product.stock_quantity === 0 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus me-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.show();
            
        } catch (error) {
            handleApiError(error);
        }
    }

    async addToCart(productId, quantity = 1) {
        if (!api.isAuthenticated()) {
            showToast('Please login to add items to cart', 'error');
            this.showLoginModal();
            return;
        }

        try {
            await api.addToCart(productId, quantity);
            await this.loadCart();
            showToast('Item added to cart!', 'success');
            
            // Add visual feedback
            const button = event.target.closest('button');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('btn-success');
                button.classList.remove('btn-primary');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-primary');
                }, 1000);
            }
            
        } catch (error) {
            handleApiError(error);
        }
    }

    async addToCartWithQuantity(productId) {
        const quantityInput = document.getElementById('productQuantity');
        const quantity = parseInt(quantityInput.value) || 1;
        await this.addToCart(productId, quantity);
    }

    async loadCart() {
        if (!api.isAuthenticated()) {
            this.cart = [];
            this.updateCartDisplay();
            return;
        }

        try {
            const response = await api.getCart();
            this.cart = response.items || [];
            this.updateCartDisplay();
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.cart = [];
            this.updateCartDisplay();
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.classList.remove('d-none');
        } else {
            cartCount.classList.add('d-none');
        }
    }

    async showCart() {
        if (!api.isAuthenticated()) {
            showToast('Please login to view your cart', 'error');
            this.showLoginModal();
            return;
        }

        await this.loadCart();
        
        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        const modalBody = document.getElementById('cartModalBody');
        
        if (this.cart.length === 0) {
            modalBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>Your cart is empty</h4>
                    <p>Add some products to get started!</p>
                </div>
            `;
            document.getElementById('checkoutBtn').style.display = 'none';
        } else {
            modalBody.innerHTML = this.renderCartItems();
            document.getElementById('checkoutBtn').style.display = 'block';
        }
        
        modal.show();
    }

    renderCartItems() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return `
            <div class="cart-items">
                ${this.cart.map(item => `
                    <div class="cart-item">
                        <div class="row align-items-center">
                            <div class="col-md-2">
                                <img src="${getProductImageUrl(item)}" class="cart-item-image" alt="${item.name}">
                            </div>
                            <div class="col-md-4">
                                <h6 class="mb-1">${item.name}</h6>
                                <small class="text-muted">SKU: ${item.sku}</small>
                            </div>
                            <div class="col-md-2">
                                <span class="fw-bold">${formatPrice(item.price)}</span>
                            </div>
                            <div class="col-md-3">
                                <div class="quantity-controls">
                                    <button type="button" onclick="app.updateCartItemQuantity(${item.id}, ${item.quantity - 1})">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" value="${item.quantity}" min="1" readonly>
                                    <button type="button" onclick="app.updateCartItemQuantity(${item.id}, ${item.quantity + 1})">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-1">
                                <button class="btn btn-outline-danger btn-sm" onclick="app.removeCartItem(${item.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Total:</h5>
                    <span class="cart-total">${formatPrice(total)}</span>
                </div>
                <div class="mt-2">
                    <small class="text-muted">${this.cart.length} item(s) in cart</small>
                </div>
            </div>
        `;
    }

    async updateCartItemQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            await this.removeCartItem(itemId);
            return;
        }

        try {
            await api.updateCartItem(itemId, newQuantity);
            await this.loadCart();
            
            // Update the cart modal if it's open
            const cartModal = document.getElementById('cartModal');
            if (cartModal.classList.contains('show')) {
                const modalBody = document.getElementById('cartModalBody');
                modalBody.innerHTML = this.renderCartItems();
            }
            
        } catch (error) {
            handleApiError(error);
        }
    }

    async removeCartItem(itemId) {
        try {
            await api.removeCartItem(itemId);
            await this.loadCart();
            
            // Update the cart modal if it's open
            const cartModal = document.getElementById('cartModal');
            if (cartModal.classList.contains('show')) {
                const modalBody = document.getElementById('cartModalBody');
                if (this.cart.length === 0) {
                    modalBody.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <h4>Your cart is empty</h4>
                            <p>Add some products to get started!</p>
                        </div>
                    `;
                    document.getElementById('checkoutBtn').style.display = 'none';
                } else {
                    modalBody.innerHTML = this.renderCartItems();
                }
            }
            
            showToast('Item removed from cart', 'success');
            
        } catch (error) {
            handleApiError(error);
        }
    }

    showCheckout() {
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        cartModal.hide();
        
        const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('checkoutTotal').textContent = total.toFixed(2);
        
        checkoutModal.show();
    }

    toggleBillingFields(e) {
        const billingFields = document.getElementById('billingFields');
        billingFields.style.display = e.target.checked ? 'none' : 'block';
    }

    async handleCheckout(e) {
        e.preventDefault();
        
        const sameAsShipping = document.getElementById('sameAsShipping').checked;
        
        const shippingAddress = {
            street: document.getElementById('shippingStreet').value,
            city: document.getElementById('shippingCity').value,
            state: document.getElementById('shippingState').value,
            zip: document.getElementById('shippingZip').value
        };
        
        const billingAddress = sameAsShipping ? shippingAddress : {
            street: document.getElementById('billingStreet').value,
            city: document.getElementById('billingCity').value,
            state: document.getElementById('billingState').value,
            zip: document.getElementById('billingZip').value
        };
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        try {
            const response = await api.createOrder({
                shipping_address: shippingAddress,
                billing_address: billingAddress,
                payment_method: paymentMethod
            });
            
            const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            checkoutModal.hide();
            
            showToast('Order placed successfully!', 'success');
            
            // Reset form and reload cart
            document.getElementById('checkoutForm').reset();
            await this.loadCart();
            
        } catch (error) {
            handleApiError(error);
        }
    }

    showProfile() {
        if (!this.currentUser) return;
        
        const modal = new bootstrap.Modal(document.getElementById('profileModal'));
        
        // Populate form with current user data
        document.getElementById('profileFirstName').value = this.currentUser.first_name || '';
        document.getElementById('profileLastName').value = this.currentUser.last_name || '';
        document.getElementById('profileUsername').value = this.currentUser.username || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        
        this.loadUserOrders();
        modal.show();
    }

    async updateProfile(e) {
        e.preventDefault();
        
        const userData = {
            first_name: document.getElementById('profileFirstName').value,
            last_name: document.getElementById('profileLastName').value,
            username: document.getElementById('profileUsername').value,
            email: document.getElementById('profileEmail').value,
            phone: document.getElementById('profilePhone').value
        };
        
        try {
            const response = await api.updateProfile(userData);
            this.currentUser = response.user;
            this.updateAuthUI();
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            handleApiError(error);
        }
    }

    async loadUserOrders() {
        try {
            const response = await api.getOrders();
            const orders = response.orders || [];
            this.renderUserOrders(orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            this.renderUserOrders([]);
        }
    }

    renderUserOrders(orders) {
        const ordersContainer = document.getElementById('userOrders');
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box"></i>
                    <h6>No orders yet</h6>
                    <p>Start shopping to see your orders here!</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">Order #${order.id}</h6>
                        <small class="text-muted">${formatDate(order.created_at)}</small>
                    </div>
                    <div class="text-end">
                        <span class="order-status ${order.status}">${order.status}</span>
                        <div class="mt-1">
                            <strong>${formatPrice(order.total_amount)}</strong>
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">${order.item_count} item(s)</small>
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="app.showOrderDetail(${order.id})">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    async showOrderDetail(orderId) {
        try {
            const response = await api.getOrder(orderId);
            const order = response.order;
            
            // You could create a separate modal for order details
            // For now, we'll show an alert with basic info
            alert(`Order #${order.id}\nStatus: ${order.status}\nTotal: ${formatPrice(order.total_amount)}\nDate: ${formatDate(order.created_at)}`);
            
        } catch (error) {
            handleApiError(error);
        }
    }

    showOrders() {
        this.showProfile();
        // Scroll to orders section in the profile modal
        setTimeout(() => {
            const ordersSection = document.getElementById('userOrders');
            ordersSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('brandFilter').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('searchInput').value = '';
        this.loadProducts();
    }
}

// Global Functions
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
}

function showLoginModal() {
    app.showLoginModal();
}

// Initialize App
const app = new MarineMotorsApp();

// Health Check on Load
api.healthCheck().then(response => {
    console.log('API Health Check:', response);
}).catch(error => {
    console.error('API Health Check Failed:', error);
    showToast('Unable to connect to server. Please try again later.', 'error');
});

// Auto-refresh cart every 5 minutes if user is logged in
setInterval(() => {
    if (api.isAuthenticated()) {
        app.loadCart();
    }
}, 5 * 60 * 1000);

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    // Handle navigation state if needed
});

// Handle online/offline status
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('Connection lost. Some features may not work.', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.card, .feature-card');
    animatedElements.forEach(el => observer.observe(el));
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
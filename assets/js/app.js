// Global variables
let currentUser = null;
let cartItems = [];
let products = [];
let orders = [];
let currentPage = 1;
let totalPages = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize application
async function initializeApp() {
    try {
        // Check if user is authenticated
        if (isAuthenticated()) {
            await loadUserProfile();
            updateUIForAuthenticatedUser();
            await loadCart();
        } else {
            updateUIForGuestUser();
        }
        
        // Load initial products
        await loadProducts();
        
        // Show products section by default
        showSection('products');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('Error', 'Failed to initialize application', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Product form
    document.getElementById('saveProduct').addEventListener('click', handleProductSave);
    
    // Search functionality
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProductsByCategory);
    }
    
    // Navigation links
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section') || e.target.closest('[data-section]').getAttribute('data-section');
            showSection(section);
        });
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await api.login(email, password);
        
        if (response.user) {
            currentUser = response.user;
            setUserData(response.user);
            updateUIForAuthenticatedUser();
            await loadCart();
            showSection('products');
            showToast('Success', 'Welcome back!', 'success');
        }
    } catch (error) {
        showToast('Login Failed', error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('Error', 'Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await api.register({ name, email, password });
        
        showToast('Success', 'Account created successfully! Please login.', 'success');
        showSection('login');
    } catch (error) {
        showToast('Registration Failed', error.message, 'error');
    }
}

async function logout() {
    try {
        api.removeToken();
        removeUserData();
        currentUser = null;
        cartItems = [];
        updateUIForGuestUser();
        showSection('products');
        showToast('Success', 'Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// User profile functions
async function loadUserProfile() {
    try {
        const profile = await api.getProfile();
        currentUser = profile.user || profile;
        setUserData(currentUser);
        
        // Update profile form
        if (currentUser) {
            document.getElementById('profileName').value = currentUser.name || '';
            document.getElementById('profileEmail').value = currentUser.email || '';
            document.getElementById('profilePhone').value = currentUser.phone || '';
            document.getElementById('profileAddress').value = currentUser.address || '';
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        // If profile loading fails, user might not be authenticated
        logout();
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value
    };
    
    try {
        const response = await api.updateProfile(profileData);
        currentUser = response.user || response;
        setUserData(currentUser);
        updateUIForAuthenticatedUser();
        showToast('Success', 'Profile updated successfully', 'success');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

// UI update functions
function updateUIForAuthenticatedUser() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userDropdown').style.display = 'block';
    document.getElementById('cartNavItem').style.display = 'block';
    document.getElementById('ordersNavItem').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('userDisplayName').textContent = currentUser.name || 'User';
        
        // Show admin panel if user is admin
        if (currentUser.role === 'admin' || currentUser.is_admin) {
            document.getElementById('adminNavItem').style.display = 'block';
        }
    }
}

function updateUIForGuestUser() {
    document.getElementById('authButtons').style.display = 'block';
    document.getElementById('userDropdown').style.display = 'none';
    document.getElementById('cartNavItem').style.display = 'none';
    document.getElementById('ordersNavItem').style.display = 'none';
    document.getElementById('adminNavItem').style.display = 'none';
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionName) {
        case 'products':
            loadProducts();
            break;
        case 'cart':
            if (isAuthenticated()) loadCart();
            break;
        case 'orders':
            if (isAuthenticated()) loadOrders();
            break;
        case 'profile':
            if (isAuthenticated()) loadUserProfile();
            break;
        case 'admin':
            if (isAuthenticated()) loadAdminProducts();
            break;
    }
}

// Product functions
async function loadProducts(page = 1, search = '', category = '') {
    try {
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (category) params.category = category;
        
        const response = await api.getProducts(params);
        products = response.products || response.data || response;
        
        if (response.pagination) {
            currentPage = response.pagination.current_page || page;
            totalPages = response.pagination.total_pages || 1;
        }
        
        renderProducts();
        renderPagination();
        loadCategories();
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Error', 'Failed to load products', 'error');
    }
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="col-12"><div class="alert alert-info">No products found.</div></div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">` :
                        `<i class="bi bi-image"></i>`
                    }
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted small">${product.description || 'No description available'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 mb-0 text-primary">${formatCurrency(product.price)}</span>
                            <small class="text-muted">Stock: ${product.stock || 0}</small>
                        </div>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewProduct(${product.id})">
                                <i class="bi bi-eye"></i>
                            </button>
                            ${isAuthenticated() ? 
                                `<button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})" ${(product.stock || 0) <= 0 ? 'disabled' : ''}>
                                    <i class="bi bi-cart-plus me-1"></i>Add to Cart
                                </button>` :
                                `<button class="btn btn-primary btn-sm" onclick="showSection('login')">
                                    Login to Buy
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPagination() {
    const pagination = document.getElementById('productsPagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadProducts(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage || i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadProducts(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadProducts(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

async function loadCategories() {
    // Extract unique categories from products
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value;
    const category = document.getElementById('categoryFilter').value;
    loadProducts(1, searchTerm, category);
}

function filterProductsByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('productSearch').value;
    loadProducts(1, searchTerm, category);
}

async function viewProduct(productId) {
    try {
        const product = await api.getProduct(productId);
        
        document.getElementById('productDetailTitle').textContent = product.name;
        document.getElementById('productDetailBody').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    ${product.image ? 
                        `<img src="${product.image}" class="img-fluid rounded" alt="${product.name}">` :
                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 300px;">
                            <i class="bi bi-image display-1 text-muted"></i>
                        </div>`
                    }
                </div>
                <div class="col-md-6">
                    <h4>${product.name}</h4>
                    <p class="text-muted">${product.description || 'No description available'}</p>
                    <h5 class="text-primary">${formatCurrency(product.price)}</h5>
                    <p><strong>Category:</strong> ${product.category || 'Uncategorized'}</p>
                    <p><strong>Stock:</strong> ${product.stock || 0} available</p>
                    <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                </div>
            </div>
        `;
        
        document.getElementById('addToCartFromDetail').onclick = () => addToCart(productId);
        
        const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
        modal.show();
    } catch (error) {
        showToast('Error', 'Failed to load product details', 'error');
    }
}

// Cart functions
async function loadCart() {
    if (!isAuthenticated()) return;
    
    try {
        const response = await api.getCart();
        cartItems = response.items || response.cart_items || response;
        renderCart();
        updateCartBadge();
    } catch (error) {
        console.error('Failed to load cart:', error);
        cartItems = [];
        renderCart();
        updateCartBadge();
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    
    if (!cartItems || cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x display-1 text-muted"></i>
                <h4 class="mt-3">Your cart is empty</h4>
                <p class="text-muted">Add some products to get started!</p>
                <button class="btn btn-primary" onclick="showSection('products')">Shop Now</button>
            </div>
        `;
        updateCartSummary(0, 0, 0, 0);
        return;
    }
    
    cartContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item border-bottom py-3">
            <div class="row align-items-center">
                <div class="col-md-2">
                    ${item.product?.image ? 
                        `<img src="${item.product.image}" class="img-fluid rounded" alt="${item.product?.name}">` :
                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 60px;">
                            <i class="bi bi-image"></i>
                        </div>`
                    }
                </div>
                <div class="col-md-4">
                    <h6 class="mb-1">${item.product?.name || 'Product'}</h6>
                    <small class="text-muted">${item.product?.category || ''}</small>
                </div>
                <div class="col-md-2">
                    <span class="fw-bold">${formatCurrency(item.product?.price || 0)}</span>
                </div>
                <div class="col-md-2">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" 
                               onchange="updateCartItemQuantity(${item.id}, this.value)">
                        <button class="btn btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="col-md-1">
                    <span class="fw-bold">${formatCurrency((item.product?.price || 0) * item.quantity)}</span>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shipping;
    
    updateCartSummary(subtotal, tax, shipping, total);
}

function updateCartSummary(subtotal, tax, shipping, total) {
    document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cartTax').textContent = formatCurrency(tax);
    document.getElementById('cartShipping').textContent = formatCurrency(shipping);
    document.getElementById('cartTotal').textContent = formatCurrency(total);
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = cartItems.length === 0;
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (itemCount > 0) {
        badge.textContent = itemCount;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

async function addToCart(productId, quantity = 1) {
    if (!isAuthenticated()) {
        showSection('login');
        return;
    }
    
    try {
        await api.addToCart(productId, quantity);
        await loadCart();
        showToast('Success', 'Product added to cart', 'success');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function updateCartItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    try {
        await api.updateCartItem(itemId, newQuantity);
        await loadCart();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function removeFromCart(itemId) {
    try {
        await api.removeFromCart(itemId);
        await loadCart();
        showToast('Success', 'Item removed from cart', 'success');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
        await api.clearCart();
        await loadCart();
        showToast('Success', 'Cart cleared', 'success');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function checkout() {
    if (!cartItems || cartItems.length === 0) {
        showToast('Error', 'Your cart is empty', 'error');
        return;
    }
    
    try {
        const order = await api.createOrder();
        await loadCart(); // Refresh cart (should be empty now)
        showToast('Success', 'Order placed successfully!', 'success');
        showSection('orders');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

// Order functions
async function loadOrders() {
    if (!isAuthenticated()) return;
    
    try {
        const response = await api.getOrders();
        orders = response.orders || response.data || response;
        renderOrders();
    } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Error', 'Failed to load orders', 'error');
    }
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-bag-x display-1 text-muted"></i>
                <h4 class="mt-3">No orders found</h4>
                <p class="text-muted">Start shopping to see your orders here!</p>
                <button class="btn btn-primary" onclick="showSection('products')">Shop Now</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">Order #${order.id}</h6>
                    <small class="text-muted">${formatDate(order.created_at)}</small>
                </div>
                <div>
                    <span class="badge ${getOrderStatusClass(order.status)}">${order.status}</span>
                    <span class="ms-2 fw-bold">${formatCurrency(order.total)}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        ${order.items ? order.items.map(item => `
                            <div class="d-flex align-items-center mb-2">
                                <div class="me-3">
                                    ${item.product?.image ? 
                                        `<img src="${item.product.image}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" alt="${item.product?.name}">` :
                                        `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                            <i class="bi bi-image"></i>
                                        </div>`
                                    }
                                </div>
                                <div class="flex-grow-1">
                                    <div class="fw-medium">${item.product?.name || 'Product'}</div>
                                    <small class="text-muted">Qty: ${item.quantity} × ${formatCurrency(item.price)}</small>
                                </div>
                            </div>
                        `).join('') : '<p class="text-muted">No items found</p>'}
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewOrder(${order.id})">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getOrderStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'shipped': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
}

function filterOrders(status) {
    // Update active filter button
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${status}"]`).classList.add('active');
    
    // Filter and render orders
    let filteredOrders = orders;
    if (status !== 'all') {
        filteredOrders = orders.filter(order => order.status === status);
    }
    
    // Temporarily replace orders array for rendering
    const originalOrders = orders;
    orders = filteredOrders;
    renderOrders();
    orders = originalOrders;
}

async function viewOrder(orderId) {
    try {
        const order = await api.getOrder(orderId);
        // You can implement a detailed order view modal here
        showToast('Info', `Order #${orderId} details loaded`, 'info');
    } catch (error) {
        showToast('Error', 'Failed to load order details', 'error');
    }
}

// Admin functions
async function loadAdminProducts() {
    try {
        const response = await api.getProducts({ limit: 100 }); // Load all products for admin
        const adminProducts = response.products || response.data || response;
        renderAdminProducts(adminProducts);
    } catch (error) {
        console.error('Failed to load admin products:', error);
        showToast('Error', 'Failed to load products', 'error');
    }
}

function renderAdminProducts(products) {
    const tbody = document.querySelector('#adminProductsTable tbody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock || 0}</td>
            <td>${product.category || 'N/A'}</td>
            <td>
                <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editProduct(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function editProduct(productId) {
    try {
        const product = await api.getProduct(productId);
        
        // Fill the form with product data
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productImage').value = product.image || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        showToast('Error', 'Failed to load product for editing', 'error');
    }
}

async function handleProductSave() {
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value
    };
    
    try {
        if (productId) {
            // Update existing product
            await api.updateProduct(productId, productData);
            showToast('Success', 'Product updated successfully', 'success');
        } else {
            // Create new product
            await api.createProduct(productData);
            showToast('Success', 'Product created successfully', 'success');
        }
        
        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        
        // Refresh admin products and main products
        await loadAdminProducts();
        await loadProducts();
        
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await api.deleteProduct(productId);
        showToast('Success', 'Product deleted successfully', 'success');
        await loadAdminProducts();
        await loadProducts();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}
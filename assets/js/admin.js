document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Checkbox functionality for CRUD tables
    setupTableCheckboxes('products');
    setupTableCheckboxes('orders');
    setupTableCheckboxes('users');
    
    // Form submissions
    document.getElementById('product-form')?.addEventListener('submit', handleProductSubmit);
    document.getElementById('order-form')?.addEventListener('submit', handleOrderSubmit);
    document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
    
    // PHP Integration Notes:
    // All the CRUD operations below need to be connected to PHP backend
    // The functions are ready to be implemented with AJAX calls
});

// CRUD Functions
function setupTableCheckboxes(tableType) {
    const selectAll = document.getElementById(`select-all-${tableType}`);
    const checkboxes = document.querySelectorAll(`.${tableType}-checkbox`);
    const editBtn = document.querySelector(`.tab-content#${tableType}-tab .crud-btn.edit`);
    const deleteBtn = document.querySelector(`.tab-content#${tableType}-tab .crud-btn.delete`);
    
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateActionButtons(tableType);
        });
    }
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateActionButtons(tableType);
            if (!this.checked) {
                document.getElementById(`select-all-${tableType}`).checked = false;
            }
        });
    });
    
    function updateActionButtons() {
        const checkedCount = document.querySelectorAll(`.${tableType}-checkbox:checked`).length;
        
        if (editBtn) {
            editBtn.disabled = checkedCount !== 1;
        }
        if (deleteBtn) {
            deleteBtn.disabled = checkedCount === 0;
        }
        
        // Special case for orders status update
        if (tableType === 'orders') {
            const statusSelect = document.getElementById('order-status-select');
            const statusBtn = document.querySelector('.crud-btn.status');
            if (statusSelect && statusBtn) {
                statusSelect.disabled = checkedCount === 0;
                statusBtn.disabled = checkedCount === 0;
            }
        }
    }
}

// Product CRUD
function openProductModal(action, productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    
    if (action === 'add') {
        title.textContent = 'Add New Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
    } else if (action === 'edit') {
        title.textContent = 'Edit Product';
        // PHP placeholder: Fetch product data and populate form
        // This should be replaced with actual AJAX call
        const selectedProduct = document.querySelector('.product-checkbox:checked').closest('tr');
        document.getElementById('product-id').value = selectedProduct.cells[1].textContent;
        document.getElementById('product-name').value = selectedProduct.cells[2].textContent;
        document.getElementById('product-category').value = selectedProduct.cells[3].textContent;
        document.getElementById('product-price').value = selectedProduct.cells[4].textContent.replace('$', '');
        document.getElementById('product-stock').value = selectedProduct.cells[5].textContent;
        document.getElementById('product-status').value = selectedProduct.cells[6].querySelector('.status').textContent.toLowerCase();
        // Note: Description would come from database via AJAX
    }
    
    modal.classList.add('active');
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    // PHP placeholder: This should be replaced with actual form submission via AJAX
    const formData = {
        id: document.getElementById('product-id').value,
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        category: document.getElementById('product-category').value,
        price: document.getElementById('product-price').value,
        stock: document.getElementById('product-stock').value,
        status: document.getElementById('product-status').value,
        image: document.getElementById('product-image').files[0] // For file upload
    };
    
    console.log('Product form submitted:', formData);
    alert('Product saved successfully! (This will be AJAX in production)');
    closeModal('product-modal');
    
    // PHP Integration Note:
    // This should be replaced with:
    /*
    const formData = new FormData(document.getElementById('product-form'));
    
    fetch('../scripts/ajax/save_product.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product saved successfully!');
            closeModal('product-modal');
            // Refresh product list
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the product');
    });
    */
}

function deleteSelectedProduct() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked'))
        .map(checkbox => checkbox.closest('tr').cells[1].textContent);
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected product(s)?`)) {
        // PHP placeholder: This should be replaced with actual deletion via AJAX
        console.log('Products to delete:', selectedIds);
        alert(`${selectedIds.length} product(s) deleted successfully! (This will be AJAX in production)`);
        
        // PHP Integration Note:
        // This should be replaced with:
        /*
        fetch('../scripts/ajax/delete_products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Refresh product list
                loadProducts();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting products');
        });
        */
    }
}

// Order CRUD
function openOrderModal(action, orderId = null) {
    const modal = document.getElementById('order-modal');
    
    if (action === 'edit') {
        // PHP placeholder: Fetch order data and populate form
        // This should be replaced with actual AJAX call
        const selectedOrder = document.querySelector('.order-checkbox:checked').closest('tr');
        document.getElementById('order-id').value = selectedOrder.cells[1].textContent.replace('#', '');
        document.getElementById('order-id-display').textContent = selectedOrder.cells[1].textContent.replace('#', '');
        document.getElementById('order-customer').textContent = selectedOrder.cells[2].textContent;
        document.getElementById('order-date').textContent = selectedOrder.cells[3].textContent;
        document.getElementById('order-amount').textContent = selectedOrder.cells[4].textContent;
        document.getElementById('order-status').value = selectedOrder.cells[5].querySelector('.status').textContent.toLowerCase();
        
        // Note: Order items would come from database via AJAX
        // This is just placeholder data
        const itemsList = document.getElementById('order-items-list');
        itemsList.innerHTML = `
            <tr>
                <td>WaveRunner 250HP</td>
                <td>1</td>
                <td>$5,299.00</td>
                <td>$5,299.00</td>
            </tr>
            <tr>
                <td>Marine Propeller</td>
                <td>2</td>
                <td>$149.99</td>
                <td>$299.98</td>
            </tr>
        `;
    }
    
    modal.classList.add('active');
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    // PHP placeholder: This should be replaced with actual form submission via AJAX
    const formData = {
        id: document.getElementById('order-id').value,
        status: document.getElementById('order-status').value,
        notes: document.getElementById('order-notes').value
    };
    
    console.log('Order form submitted:', formData);
    alert('Order updated successfully! (This will be AJAX in production)');
    closeModal('order-modal');
    
    // PHP Integration Note: Similar to product form submission
}

function updateOrderStatus() {
    const selectedIds = Array.from(document.querySelectorAll('.order-checkbox:checked'))
        .map(checkbox => checkbox.closest('tr').cells[1].textContent.replace('#', ''));
    const newStatus = document.getElementById('order-status-select').value;
    
    if (confirm(`Update ${selectedIds.length} selected order(s) to ${newStatus} status?`)) {
        // PHP placeholder: This should be replaced with actual status update via AJAX
        console.log('Orders to update:', selectedIds, 'New status:', newStatus);
        alert(`${selectedIds.length} order(s) updated to ${newStatus}! (This will be AJAX in production)`);
        
        // PHP Integration Note: Similar to product deletion
    }
}

// User CRUD
function openUserModal(action, userId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    
    if (action === 'add') {
        title.textContent = 'Add New User';
        document.getElementById('user-form').reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-password').required = true;
    } else if (action === 'edit') {
        title.textContent = 'Edit User';
        // PHP placeholder: Fetch user data and populate form
        // This should be replaced with actual AJAX call
        const selectedUser = document.querySelector('.user-checkbox:checked').closest('tr');
        document.getElementById('user-id').value = selectedUser.cells[1].textContent;
        document.getElementById('user-username').value = selectedUser.cells[2].textContent;
        document.getElementById('user-email').value = selectedUser.cells[3].textContent;
        document.getElementById('user-role').value = selectedUser.cells[4].textContent.toLowerCase();
        document.getElementById('user-status').value = selectedUser.cells[5].querySelector('.status').textContent.toLowerCase();
        document.getElementById('user-password').required = false;
    }
    
    modal.classList.add('active');
}

function handleUserSubmit(e) {
    e.preventDefault();
    
    // PHP placeholder: This should be replaced with actual form submission via AJAX
    const formData = {
        id: document.getElementById('user-id').value,
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value,
        status: document.getElementById('user-status').value
    };
    
    console.log('User form submitted:', formData);
    alert('User saved successfully! (This will be AJAX in production)');
    closeModal('user-modal');
    
    // PHP Integration Note: Similar to product form submission
}

function deleteSelectedUser() {
    const selectedIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
        .map(checkbox => checkbox.closest('tr').cells[1].textContent);
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected user(s)?`)) {
        // PHP placeholder: This should be replaced with actual deletion via AJAX
        console.log('Users to delete:', selectedIds);
        alert(`${selectedIds.length} user(s) deleted successfully! (This will be AJAX in production)`);
        
        // PHP Integration Note: Similar to product deletion
    }
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// PHP Integration Note: Add this function to load products dynamically
/*
function loadProducts() {
    fetch('../scripts/ajax/get_products.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tbody = document.querySelector('.crud-table#products tbody');
                tbody.innerHTML = '';
                
                data.products.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" class="product-checkbox"></td>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td><span class="status ${product.status}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</span></td>
                    `;
                    tbody.appendChild(row);
                });
                
                // Reattach event listeners
                setupTableCheckboxes('products');
            }
        })
        .catch(error => console.error('Error loading products:', error));
}
*/
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const sortSelect = document.getElementById('sort-by');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            // This will be handled by PHP in the backend
            // For now, we'll just show a message
            console.log('Filters would be applied here');
            // In production, this would submit the form or make an AJAX call
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset all filter inputs
            document.querySelectorAll('.filter-list input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            document.getElementById('hp-range').value = 0;
            document.getElementById('hp-min').textContent = '0';
            document.getElementById('price-range').value = '';
            document.getElementById('sort-by').value = 'featured';
            
            // In production, this would reload the page or reset the product listing
            console.log('Filters would be reset here');
        });
    }
    
    // Horsepower range display
    const hpRange = document.getElementById('hp-range');
    if (hpRange) {
        hpRange.addEventListener('input', function() {
            document.getElementById('hp-min').textContent = this.value;
        });
    }
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            // This will be handled by PHP in the backend
            console.log('Sorting by:', this.value);
            // In production, this would reload the page or make an AJAX call
        });
    }
    
    // Quick view modal
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const modal = document.getElementById('quick-view-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (quickViewButtons.length && modal) {
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                
                // In production, this would make an AJAX call to get product details
                console.log('Would fetch details for:', productName);
                
                // For demo purposes, we'll just show the modal with a message
                modal.style.display = 'block';
                document.querySelector('.modal-body').innerHTML = `
                    <h3>${productName}</h3>
                    <p>Detailed product information would appear here.</p>
                    <p>In production, this would be loaded via AJAX from the server.</p>
                `;
            });
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
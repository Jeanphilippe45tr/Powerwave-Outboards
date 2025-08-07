document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Toggle password visibility
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Reset all bars
            strengthBars.forEach(bar => {
                bar.style.backgroundColor = '#ddd';
            });
            
            // Update bars based on strength
            for (let i = 0; i < strength.level; i++) {
                strengthBars[i].style.backgroundColor = strength.color;
            }
            
            strengthText.textContent = strength.text;
            strengthText.style.color = strength.color;
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            let isValid = true;
            const inputs = this.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--error-color)';
                } else {
                    input.style.borderColor = '#ddd';
                }
            });
            
            // Additional validation for register form
            if (this.id === 'register-form') {
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                
                if (password !== confirmPassword) {
                    isValid = false;
                    document.getElementById('register-confirm-password').style.borderColor = 'var(--error-color)';
                    alert('Passwords do not match!');
                }
                
                const termsChecked = document.getElementById('register-terms').checked;
                if (!termsChecked) {
                    isValid = false;
                    alert('You must agree to the terms and conditions');
                }
            }
            
            if (isValid) {
                // Form is valid - in a real app, you would submit to server here
                alert('Form submitted successfully!');
                // this.submit(); // Uncomment to actually submit the form
            }
        });
    });
    
    // Helper function to calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        let text = 'Weak';
        let color = '#ff3333';
        
        // Length check
        if (password.length > 0) strength += 1;
        if (password.length >= 8) strength += 1;
        
        // Complexity checks
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/\d/)) strength += 1;
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;
        
        // Determine strength level
        if (strength <= 2) {
            text = 'Weak';
            color = '#ff3333';
        } else if (strength <= 4) {
            text = 'Medium';
            color = '#ffcc00';
        } else {
            text = 'Strong';
            color = '#4bb543';
        }
        
        return {
            level: strength > 3 ? 3 : strength, // Max 3 bars
            text: text,
            color: color
        };
    }
});
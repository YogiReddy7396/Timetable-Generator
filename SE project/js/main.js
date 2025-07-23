// Form validation and UI interaction
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all forms
    initializeForms();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Check if we have stored credentials
    checkStoredCredentials();
});

function initializeForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id === 'loginForm') {
            form.addEventListener('submit', handleLogin);
        } else if (form.id === 'registerForm') {
            form.addEventListener('submit', handleRegistration);
        } else if (form.id === 'contactForm') {
            form.addEventListener('submit', handleContactForm);
        }
    });

    // Add input validation listeners
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', validateInput);
    });

    // Clear error messages when switching forms
    const loginLink = document.querySelector('a[href="#"]');
    const registerLink = document.querySelector('a[href="#register"]');
    
    if (loginLink) {
        loginLink.addEventListener('click', () => {
            clearErrors();
            document.getElementById('registerForm').reset();
        });
    }
    
    if (registerLink) {
        registerLink.addEventListener('click', () => {
            clearErrors();
            document.getElementById('loginForm').reset();
        });
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch(input.type) {
        case 'text':
            if (input.id === 'username' || input.id === 'login-username') {
                const usernameRegex = /^[A-Z][a-zA-Z0-9]{0,7}$/;
                isValid = usernameRegex.test(value);
                errorMessage = 'Username must start with a capital letter and be up to 8 characters long';
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'password':
            if (input.id === 'password') {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
                isValid = passwordRegex.test(value);
                errorMessage = 'Password must contain at least 8 characters, including uppercase, lowercase, and special characters';
            } else if (input.id === 'confirm_password') {
                const password = document.getElementById('password').value;
                isValid = value === password;
                errorMessage = 'Passwords do not match';
            } else if (input.id === 'login-password') {
                isValid = value.length >= 8;
                errorMessage = 'Password must be at least 8 characters long';
            }
            break;
    }

    showInputValidation(input, isValid, errorMessage);
    return isValid;
}

function showInputValidation(input, isValid, message) {
    const errorElement = input.nextElementSibling;
    
    if (!isValid && input.value !== '') {
        input.classList.add('invalid');
        input.classList.remove('valid');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    clearErrors();

    const form = e.target;
    const username = form.querySelector('#login-username').value.trim();
    const password = form.querySelector('#login-password').value.trim();
    const errorDiv = document.getElementById('login-error');
    const loginButton = document.getElementById('login-button');

    // Validate inputs
    let isValid = true;
    form.querySelectorAll('input').forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });

    if (!isValid) {
        errorDiv.textContent = 'Please fix the errors above';
        errorDiv.style.display = 'block';
        return false;
    }

    // Get stored credentials
    const storedCredentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    const user = storedCredentials.find(cred => cred.username === username && cred.password === password);

    if (user) {
        // Show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Login successful!', 'success');
        
        // Redirect to timetable page after a short delay
        setTimeout(() => {
            window.location.href = 'sets.html';
        }, 1000);
    } else {
        errorDiv.textContent = 'Invalid username or password';
        errorDiv.style.display = 'block';
        form.querySelector('#login-password').value = '';
    }

    return false;
}

function handleRegistration(e) {
    e.preventDefault();
    clearErrors();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const errorDiv = document.getElementById('register-error');
    const registerButton = document.getElementById('register-button');
    
    // Validate all inputs
    let isValid = true;
    form.querySelectorAll('input').forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });

    if (!isValid) {
        errorDiv.textContent = 'Please fix the errors above';
        errorDiv.style.display = 'block';
        return false;
    }

    // Check if username already exists
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    if (credentials.some(cred => cred.username === data.username)) {
        errorDiv.textContent = 'Username already exists';
        errorDiv.style.display = 'block';
        return false;
    }

    // Show loading state
    registerButton.disabled = true;
    registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    // Store credentials
    credentials.push({
        username: data.username,
        email: data.email,
        password: data.password
    });
    localStorage.setItem('credentials', JSON.stringify(credentials));

    showNotification('Registration successful!', 'success');
    
    // Redirect to success page after a short delay
    setTimeout(() => {
        window.location.href = 'success_page.html';
    }, 1000);

    return false;
}

function handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    
    showLoadingState(form, true);
    
    // Simulate sending message
    setTimeout(() => {
        showLoadingState(form, false);
        showNotification('Message sent successfully!', 'success');
        form.reset();
    }, 1500);
}

function showLoadingState(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkStoredCredentials() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPath = window.location.pathname;
    
    // If user is logged in and trying to access login page, redirect to timetable
    if (currentUser && (currentPath.includes('home page.html') || currentPath === '/' || currentPath.endsWith('/'))) {
        window.location.href = 'sets.html';
    }
    
    // If user is not logged in and trying to access protected pages, redirect to login
    if (!currentUser && (currentPath.includes('sets.html'))) {
        window.location.href = 'home page.html';
    }
}

// Toggle between login and registration forms with animation
function toggleForms() {
    const loginForm = document.querySelector('.form-container:nth-child(1)');
    const registerForm = document.querySelector('.form-container:nth-child(2)');
    
    loginForm.classList.add('fade-in');
    registerForm.classList.add('fade-in');
    
    if (loginForm.style.display === 'none') {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'home page.html';
} 
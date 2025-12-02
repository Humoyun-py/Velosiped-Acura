// Auth Management System
class AuthManager {
    constructor() {
        this.storageKey = 'premiumshop_users';
        this.currentUserKey = 'premiumshop_current_user';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAutoLogin();
    }
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Show password toggle
            const showPasswordBtn = document.getElementById('showLoginPassword');
            if (showPasswordBtn) {
                showPasswordBtn.addEventListener('click', () => {
                    this.togglePasswordVisibility('loginPassword', showPasswordBtn);
                });
            }
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            
            // Show password toggles
            const showRegisterPassword = document.getElementById('showRegisterPassword');
            const showConfirmPassword = document.getElementById('showConfirmPassword');
            
            if (showRegisterPassword) {
                showRegisterPassword.addEventListener('click', () => {
                    this.togglePasswordVisibility('registerPassword', showRegisterPassword);
                });
            }
            
            if (showConfirmPassword) {
                showConfirmPassword.addEventListener('click', () => {
                    this.togglePasswordVisibility('confirmPassword', showConfirmPassword);
                });
            }
            
            // Password strength check
            const passwordInput = document.getElementById('registerPassword');
            if (passwordInput) {
                passwordInput.addEventListener('input', () => {
                    this.checkPasswordStrength(passwordInput.value);
                });
            }
            
            // Phone number formatting
            const phoneInput = document.getElementById('registerPhone');
            if (phoneInput) {
                phoneInput.addEventListener('input', () => {
                    this.formatPhoneNumber(phoneInput);
                });
            }
        }
        
        // Reset password form
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }
        
        // Forgot password link
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showResetPasswordForm();
            });
        }
        
        // Back to login link
        const backToLogin = document.getElementById('backToLogin');
        if (backToLogin) {
            backToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
        
        // Social login buttons
        document.querySelectorAll('.btn-social').forEach(button => {
            button.addEventListener('click', () => {
                this.handleSocialLogin(button.classList.contains('btn-google') ? 'google' : 'facebook');
            });
        });
    }
    
    checkAutoLogin() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // User is already logged in
            this.redirectToDashboard(currentUser.role);
        }
    }
    
    togglePasswordVisibility(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('998')) {
            value = '+' + value;
        } else if (value.startsWith('9') && value.length <= 9) {
            value = '+998' + value;
        } else if (value.startsWith('8')) {
            value = '+7' + value;
        }
        
        input.value = value;
    }
    
    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        if (!strengthBar) return;
        
        const bars = strengthBar.querySelectorAll('.strength-bar');
        const strengthText = strengthBar.querySelector('.strength-text');
        
        // Reset bars
        bars.forEach(bar => {
            bar.classList.remove('active', 'good', 'strong');
        });
        
        if (password.length === 0) {
            strengthText.textContent = this.getTranslatedText('password_strength');
            return;
        }
        
        // Calculate strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update bars
        for (let i = 0; i < Math.min(strength, 4); i++) {
            bars[i].classList.add('active');
            
            if (strength >= 4) {
                bars[i].classList.add('strong');
                strengthText.textContent = this.getTranslatedText('strong_password');
            } else if (strength >= 3) {
                bars[i].classList.add('good');
                strengthText.textContent = this.getTranslatedText('good_password');
            } else {
                strengthText.textContent = this.getTranslatedText('weak_password');
            }
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const emailOrPhone = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        // Basic validation
        if (!emailOrPhone || !password) {
            this.showToast(this.getTranslatedText('fill_all_fields'), 'error');
            return;
        }
        
        // Demo accounts check
        if ((emailOrPhone === 'admin' || emailOrPhone === 'admin@example.com') && password === 'admin123') {
            // Admin login
            const adminUser = {
                id: 'admin_001',
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                phone: '+998901234567',
                createdAt: new Date().toISOString()
            };
            
            this.loginUser(adminUser, rememberMe);
            this.showToast(this.getTranslatedText('welcome_admin'), 'success');
            setTimeout(() => this.redirectToDashboard('admin'), 1500);
            return;
        }
        
        if ((emailOrPhone === 'user@example.com' || emailOrPhone === 'demo') && password === 'password123') {
            // Demo user login
            const demoUser = {
                id: 'user_001',
                email: 'user@example.com',
                firstName: 'Demo',
                lastName: 'User',
                role: 'user',
                phone: '+998901112233',
                createdAt: new Date().toISOString()
            };
            
            this.loginUser(demoUser, rememberMe);
            this.showToast(this.getTranslatedText('welcome_back'), 'success');
            setTimeout(() => this.redirectToDashboard('user'), 1500);
            return;
        }
        
        // Check against registered users
        const users = this.getUsers();
        const user = users.find(u => 
            u.email === emailOrPhone || 
            u.phone === emailOrPhone ||
            u.username === emailOrPhone
        );
        
        if (!user) {
            this.showToast(this.getTranslatedText('user_not_found'), 'error');
            return;
        }
        
        if (user.password !== password) {
            this.showToast(this.getTranslatedText('wrong_password'), 'error');
            return;
        }
        
        // Login successful
        this.loginUser(user, rememberMe);
        this.showToast(this.getTranslatedText('login_success'), 'success');
        setTimeout(() => this.redirectToDashboard(user.role || 'user'), 1500);
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const birthDate = document.getElementById('birthDate').value;
        const newsletter = document.getElementById('newsletter')?.checked || false;
        const terms = document.getElementById('terms')?.checked || false;
        
        // Validation
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            this.showToast(this.getTranslatedText('fill_required_fields'), 'error');
            return;
        }
        
        if (!terms) {
            this.showToast(this.getTranslatedText('accept_terms_error'), 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showToast(this.getTranslatedText('invalid_email'), 'error');
            return;
        }
        
        if (!this.validatePhone(phone)) {
            this.showToast(this.getTranslatedText('invalid_phone'), 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showToast(this.getTranslatedText('password_min_length'), 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showToast(this.getTranslatedText('passwords_not_match'), 'error');
            return;
        }
        
        // Check if user already exists
        const users = this.getUsers();
        if (users.some(u => u.email === email)) {
            this.showToast(this.getTranslatedText('email_exists'), 'error');
            return;
        }
        
        if (users.some(u => u.phone === phone)) {
            this.showToast(this.getTranslatedText('phone_exists'), 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            firstName,
            lastName,
            email,
            phone,
            password, // In real app, this should be hashed
            birthDate: birthDate || null,
            newsletter,
            role: 'user',
            createdAt: new Date().toISOString(),
            verified: false,
            orders: [],
            wishlist: []
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem(this.storageKey, JSON.stringify(users));
        
        // Auto login
        this.loginUser(newUser, true);
        
        // Show success message
        this.showToast(this.getTranslatedText('registration_success'), 'success');
        
        // Redirect to profile or home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    async handleResetPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!this.validateEmail(email)) {
            this.showToast(this.getTranslatedText('invalid_email'), 'error');
            return;
        }
        
        // Check if user exists
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            this.showToast(this.getTranslatedText('email_not_found'), 'error');
            return;
        }
        
        // In a real app, send reset email here
        // For demo, just show success message
        this.showToast(this.getTranslatedText('reset_link_sent'), 'success');
        
        // Return to login form after 2 seconds
        setTimeout(() => {
            this.showLoginForm();
            document.getElementById('resetEmail').value = '';
        }, 2000);
    }
    
    handleSocialLogin(provider) {
        // For demo purposes
        this.showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} ${this.getTranslatedText('login_coming_soon')}`, 'info');
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePhone(phone) {
        const re = /^\+998\d{9}$/;
        return re.test(phone);
    }
    
    getUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }
    
    loginUser(user, rememberMe = false) {
        // Remove password from user object before saving to current user
        const { password, ...userWithoutPassword } = user;
        
        // Save to session storage
        sessionStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
        
        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
        }
    }
    
    logout() {
        sessionStorage.removeItem(this.currentUserKey);
        localStorage.removeItem(this.currentUserKey);
        window.location.href = 'index.html';
    }
    
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem(this.currentUserKey) || localStorage.getItem(this.currentUserKey) || 'null');
    }
    
    isLoggedIn() {
        return !!this.getCurrentUser();
    }
    
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
    
    redirectToDashboard(role) {
        switch (role) {
            case 'admin':
                window.location.href = 'admin.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }
    
    showResetPasswordForm() {
        const loginBox = document.getElementById('loginBox');
        const resetBox = document.getElementById('resetPasswordBox');
        
        if (loginBox && resetBox) {
            loginBox.style.display = 'none';
            resetBox.style.display = 'block';
        }
    }
    
    showLoginForm() {
        const loginBox = document.getElementById('loginBox');
        const resetBox = document.getElementById('resetPasswordBox');
        
        if (loginBox && resetBox) {
            loginBox.style.display = 'block';
            resetBox.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        // Check if toast container exists
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-message">
                ${message}
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
    
    getTranslatedText(key) {
        const currentLang = localStorage.getItem('preferred_language') || 'uz';
        const translations = {
            uz: {
                'fill_all_fields': 'Iltimos, barcha maydonlarni to\'ldiring',
                'welcome_admin': 'Xush kelibsiz, Admin!',
                'welcome_back': 'Xush kelibsiz!',
                'user_not_found': 'Foydalanuvchi topilmadi',
                'wrong_password': 'Noto\'g\'ri parol',
                'login_success': 'Muvaffaqiyatli kirdingiz!',
                'fill_required_fields': 'Iltimos, barcha majburiy maydonlarni to\'ldiring',
                'accept_terms_error': 'Foydalanish shartlarini qabul qilishingiz kerak',
                'invalid_email': 'Noto\'g\'ri email formati',
                'invalid_phone': 'Noto\'g\'ri telefon raqami formati',
                'password_min_length': 'Parol kamida 8 belgidan iborat bo\'lishi kerak',
                'passwords_not_match': 'Parollar mos kelmadi',
                'email_exists': 'Bu email allaqachon ro\'yxatdan o\'tgan',
                'phone_exists': 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan',
                'registration_success': 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!',
                'reset_link_sent': 'Parolni tiklash havolasi emailingizga yuborildi',
                'email_not_found': 'Bu email bilan ro\'yxatdan o\'tgan foydalanuvchi topilmadi',
                'login_coming_soon': 'orqali kirish tez orada ishga tushadi',
                'password_strength': 'Parol mustahkamligi',
                'strong_password': 'Kuchli parol',
                'good_password': 'Yaxshi parol',
                'weak_password': 'Zaif parol'
            },
            ru: {
                'fill_all_fields': 'Пожалуйста, заполните все поля',
                'welcome_admin': 'Добро пожаловать, Админ!',
                'welcome_back': 'Добро пожаловать!',
                'user_not_found': 'Пользователь не найден',
                'wrong_password': 'Неверный пароль',
                'login_success': 'Вы успешно вошли!',
                'fill_required_fields': 'Пожалуйста, заполните все обязательные поля',
                'accept_terms_error': 'Вы должны принять условия использования',
                'invalid_email': 'Неверный формат email',
                'invalid_phone': 'Неверный формат номера телефона',
                'password_min_length': 'Пароль должен содержать не менее 8 символов',
                'passwords_not_match': 'Пароли не совпадают',
                'email_exists': 'Этот email уже зарегистрирован',
                'phone_exists': 'Этот номер телефона уже зарегистрирован',
                'registration_success': 'Регистрация успешно завершена!',
                'reset_link_sent': 'Ссылка для сброса пароля отправлена на ваш email',
                'email_not_found': 'Пользователь с таким email не найден',
                'login_coming_soon': 'вход через скоро будет доступен',
                'password_strength': 'Надежность пароля',
                'strong_password': 'Сильный пароль',
                'good_password': 'Хороший пароль',
                'weak_password': 'Слабый пароль'
            }
        };
        
        return translations[currentLang]?.[key] || key;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other modules
export { authManager };
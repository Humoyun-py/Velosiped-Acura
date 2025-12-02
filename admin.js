// Modul importlari
import { ProductManager } from './modules/product-manager.js';
import { OrderManager } from './modules/order-manager.js';
import { NotificationManager } from './modules/notification-manager.js';

// Admin Panel ilovasi
class AdminPanelApp {
    constructor() {
        this.productManager = new ProductManager();
        this.orderManager = new OrderManager();
        this.notificationManager = new NotificationManager();
        
        this.currentProduct = null;
        this.orders = [];
        
        this.init();
    }
    
    init() {
        // DOM elementlarini tanlash
        this.elements = {
            loginScreen: document.getElementById('loginScreen'),
            adminDashboard: document.getElementById('adminDashboard'),
            loginForm: document.getElementById('loginForm'),
            logoutBtn: document.getElementById('logoutBtn'),
            usernameInput: document.getElementById('username'),
            passwordInput: document.getElementById('password'),
            
            // Stats
            totalProducts: document.getElementById('totalProducts'),
            totalOrders: document.getElementById('totalOrders'),
            totalCustomers: document.getElementById('totalCustomers'),
            
            // Tabs
            tabButtons: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Products
            productsTable: document.getElementById('productsTable').querySelector('tbody'),
            addProductBtn: document.getElementById('addProductBtn'),
            
            // Orders
            ordersTable: document.getElementById('ordersTable').querySelector('tbody'),
            orderSearch: document.getElementById('orderSearch'),
            
            // Product Modal
            productModal: document.getElementById('productModal'),
            modalTitle: document.getElementById('modalTitle'),
            productForm: document.getElementById('productForm'),
            productId: document.getElementById('productId'),
            productName: document.getElementById('productName'),
            productPrice: document.getElementById('productPrice'),
            productAge: document.getElementById('productAge'),
            productImage: document.getElementById('productImage'),
            productDescription: document.getElementById('productDescription'),
            previewImage: document.getElementById('previewImage'),
            cancelProduct: document.getElementById('cancelProduct'),
            saveProduct: document.getElementById('saveProduct'),
            
            // Close buttons
            closeModalButtons: document.querySelectorAll('.close-modal')
        };
        
        // Auth holatini tekshirish
        this.checkAuth();
        
        // Event listener'lar
        this.setupEventListeners();
        
        // Rasm oldindan ko'rinishi
        this.setupImagePreview();
    }
    
    checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }
    }
    
    showLogin() {
        this.elements.loginScreen.style.display = 'flex';
        this.elements.adminDashboard.style.display = 'none';
    }
    
    showDashboard() {
        this.elements.loginScreen.style.display = 'none';
        this.elements.adminDashboard.style.display = 'block';
    }
    
    async loadDashboardData() {
        // Mahsulotlar
        const products = await this.productManager.loadProducts();
        this.elements.totalProducts.textContent = products.length;
        this.loadProductsTable(products);
        
        // Buyurtmalar
        this.orders = await this.orderManager.getOrders();
        this.elements.totalOrders.textContent = this.orders.length;
        
        // Mijozlar (no-duplicate)
        const uniqueCustomers = [...new Set(this.orders.map(order => order.phoneNumber))];
        this.elements.totalCustomers.textContent = uniqueCustomers.length;
        
        this.loadOrdersTable(this.orders);
    }
    
    loadProductsTable(products) {
        this.elements.productsTable.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/60x60?text=Rasm'">
                </td>
                <td>${product.name}</td>
                <td>${product.price.toLocaleString()} so'm</td>
                <td>${product.age}</td>
                <td>${product.description?.substring(0, 50) || ''}${product.description?.length > 50 ? '...' : ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" data-id="${product.id}" title="Tahrirlash">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${product.id}" title="O'chirish">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            this.elements.productsTable.appendChild(row);
        });
        
        // Edit va delete tugmalari uchun event listener'lar
        this.elements.productsTable.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editProduct(e.target.closest('.btn-edit').dataset.id));
        });
        
        this.elements.productsTable.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteProduct(e.target.closest('.btn-delete').dataset.id));
        });
    }
    
    loadOrdersTable(orders) {
        this.elements.ordersTable.innerHTML = '';
        
        if (orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Hozircha buyurtmalar yo'q</p>
                </td>
            `;
            this.elements.ordersTable.appendChild(row);
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            const date = new Date(order.timestamp);
            
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.productName}</td>
                <td>${order.customerName}</td>
                <td>${order.phoneNumber}</td>
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>
                    <button class="btn-icon btn-delete" data-id="${order.id}" title="O'chirish">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            this.elements.ordersTable.appendChild(row);
        });
        
        // Delete tugmalari uchun event listener'lar
        this.elements.ordersTable.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteOrder(e.target.closest('.btn-delete').dataset.id));
        });
    }
    
    setupEventListeners() {
        // Login
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Tabs
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
        
        // Product modal
        this.elements.addProductBtn.addEventListener('click', () => this.openProductModal());
        this.elements.cancelProduct.addEventListener('click', () => this.closeProductModal());
        
        // Product form
        this.elements.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        
        // Order search
        this.elements.orderSearch.addEventListener('input', (e) => this.searchOrders(e.target.value));
        
        // Close modal buttons
        this.elements.closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        });
        
        // Modal overlay
        this.elements.productModal.addEventListener('click', (e) => {
            if (e.target === this.elements.productModal) {
                this.closeProductModal();
            }
        });
    }
    
    setupImagePreview() {
        this.elements.productImage.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url) {
                this.elements.previewImage.src = url;
                this.elements.previewImage.classList.add('visible');
            } else {
                this.elements.previewImage.classList.remove('visible');
            }
        });
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const username = this.elements.usernameInput.value;
        const password = this.elements.passwordInput.value;
        
        // Oddiy auth (real loyihada bu serverda bo'lishi kerak)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            this.showDashboard();
            this.loadDashboardData();
            this.notificationManager.showSuccess('Admin paneliga muvaffaqiyatli kirdingiz');
        } else {
            this.notificationManager.showError('Login yoki parol noto\'g\'ri');
        }
    }
    
    handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        this.showLogin();
        this.notificationManager.showInfo('Tizimdan chiqdingiz');
    }
    
    switchTab(tabId) {
        // Tab tugmalari
        this.elements.tabButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Tab kontentlari
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }
    
    openProductModal(product = null) {
        this.currentProduct = product;
        
        if (product) {
            this.elements.modalTitle.textContent = 'Mahsulotni Tahrirlash';
            this.elements.productId.value = product.id;
            this.elements.productName.value = product.name;
            this.elements.productPrice.value = product.price;
            this.elements.productAge.value = product.age;
            this.elements.productImage.value = product.image;
            this.elements.productDescription.value = product.description || '';
            
            // Rasm oldindan ko'rinishi
            if (product.image) {
                this.elements.previewImage.src = product.image;
                this.elements.previewImage.classList.add('visible');
            }
        } else {
            this.elements.modalTitle.textContent = 'Yangi Mahsulot';
            this.elements.productForm.reset();
            this.elements.previewImage.classList.remove('visible');
        }
        
        this.elements.productModal.classList.add('active');
    }
    
    closeProductModal() {
        this.elements.productModal.classList.remove('active');
        this.elements.productForm.reset();
        this.currentProduct = null;
        this.elements.previewImage.classList.remove('visible');
    }
    
    async handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            id: this.elements.productId.value || Date.now().toString(),
            name: this.elements.productName.value,
            price: parseInt(this.elements.productPrice.value),
            age: parseInt(this.elements.productAge.value),
            image: this.elements.productImage.value,
            description: this.elements.productDescription.value
        };
        
        try {
            if (this.currentProduct) {
                // Tahrirlash
                await this.productManager.updateProduct(productData);
                this.notificationManager.showSuccess('Mahsulot muvaffaqiyatli yangilandi');
            } else {
                // Qo'shish
                await this.productManager.addProduct(productData);
                this.notificationManager.showSuccess('Mahsulot muvaffaqiyatli qo\'shildi');
            }
            
            this.closeProductModal();
            await this.loadDashboardData(); // Yangilangan ma'lumotlarni yuklash
            
        } catch (error) {
            console.error('Mahsulotni saqlashda xatolik:', error);
            this.notificationManager.showError('Mahsulotni saqlashda xatolik yuz berdi');
        }
    }
    
    async editProduct(productId) {
        const products = await this.productManager.loadProducts();
        const product = products.find(p => p.id == productId);
        
        if (product) {
            this.openProductModal(product);
        }
    }
    
    async deleteProduct(productId) {
        if (confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) {
            try {
                await this.productManager.deleteProduct(productId);
                this.notificationManager.showSuccess('Mahsulot muvaffaqiyatli o\'chirildi');
                await this.loadDashboardData();
            } catch (error) {
                console.error('Mahsulotni o\'chirishda xatolik:', error);
                this.notificationManager.showError('Mahsulotni o\'chirishda xatolik');
            }
        }
    }
    
    async deleteOrder(orderId) {
        if (confirm('Haqiqatan ham bu buyurtmani o\'chirmoqchimisiz?')) {
            try {
                await this.orderManager.deleteOrder(orderId);
                this.notificationManager.showSuccess('Buyurtma muvaffaqiyatli o\'chirildi');
                await this.loadDashboardData();
            } catch (error) {
                console.error('Buyurtmani o\'chirishda xatolik:', error);
                this.notificationManager.showError('Buyurtmani o\'chirishda xatolik');
            }
        }
    }
    
    searchOrders(query) {
        const filteredOrders = this.orders.filter(order => {
            return (
                order.productName.toLowerCase().includes(query.toLowerCase()) ||
                order.customerName.toLowerCase().includes(query.toLowerCase()) ||
                order.phoneNumber.includes(query)
            );
        });
        
        this.loadOrdersTable(filteredOrders);
    }
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanelApp();
});

// Module export
export { AdminPanelApp };
// Modul importlari
import { ProductManager } from './modules/product-manager.js';
import { FilterManager } from './modules/filter-manager.js';
import { OrderManager } from './modules/order-manager.js';
import { NotificationManager } from './modules/notification-manager.js';
import { UIHelper } from './modules/ui-helper.js';

// Asosiy ilova klassi
class ProductCatalogApp {
    constructor() {
        this.productManager = new ProductManager();
        this.filterManager = new FilterManager();
        this.orderManager = new OrderManager();
        this.notificationManager = new NotificationManager();
        this.uiHelper = new UIHelper();
        
        this.currentFilter = { min: 0, max: 999999 };
        this.products = [];
        
        this.init();
    }
    
    async init() {
        // DOM elementlarini tanlash
        this.elements = {
            productsGrid: document.getElementById('products-grid'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            totalCount: document.getElementById('total-count'),
            filteredCount: document.getElementById('filtered-count'),
            modalOverlay: document.getElementById('modalOverlay'),
            closeModal: document.getElementById('closeModal'),
            orderForm: document.getElementById('orderForm'),
            productNameInput: document.getElementById('productName'),
            customerNameInput: document.getElementById('customerName'),
            phoneNumberInput: document.getElementById('phoneNumber'),
            cancelOrder: document.getElementById('cancelOrder')
        };
        
        // Mahsulotlarni yuklash
        await this.loadProducts();
        
        // Event listener'lar
        this.setupEventListeners();
        
        // Filtrlash
        this.applyFilter(this.currentFilter);
    }
    
    async loadProducts() {
        try {
            // Skeleton loading ko'rsatish
            this.uiHelper.showSkeletonLoading(this.elements.productsGrid);
            
            // Mahsulotlarni yuklash
            this.products = await this.productManager.loadProducts();
            
            // Umumiy sonni yangilash
            this.elements.totalCount.textContent = this.products.length;
            
            // Mahsulotlarni ko'rsatish
            this.displayProducts(this.products);
            
        } catch (error) {
            console.error('Mahsulotlarni yuklashda xatolik:', error);
            this.notificationManager.showError('Mahsulotlarni yuklashda xatolik yuz berdi');
        }
    }
    
    displayProducts(products) {
        // Skeleton loadingni yashirish
        this.uiHelper.hideSkeletonLoading();
        
        // Mahsulotlar gridini tozalash
        this.elements.productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            this.elements.productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>Mahsulot topilmadi</h3>
                    <p>Tanlangan filtr bo'yicha mahsulot topilmadi</p>
                </div>
            `;
            return;
        }
        
        // Har bir mahsulot uchun card yaratish
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.productsGrid.appendChild(productCard);
        });
        
        // Filterlangan sonni yangilash
        this.elements.filteredCount.textContent = products.length;
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Mahsulot+Rasmi'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price.toLocaleString()} so'm</div>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-meta">
                    <span class="product-age">Yoshi: ${product.age}</span>
                    <button class="order-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Buyurtma berish
                    </button>
                </div>
            </div>
        `;
        
        // Buyurtma tugmasi uchun event listener
        const orderBtn = card.querySelector('.order-btn');
        orderBtn.addEventListener('click', () => this.openOrderModal(product));
        
        return card;
    }
    
    openOrderModal(product) {
        this.elements.productNameInput.value = product.name;
        this.currentProduct = product;
        this.elements.modalOverlay.classList.add('active');
    }
    
    closeOrderModal() {
        this.elements.modalOverlay.classList.remove('active');
        this.elements.orderForm.reset();
        this.currentProduct = null;
    }
    
    setupEventListeners() {
        // Filter tugmalari
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Faqat bitta filter aktiv bo'lishi
                this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter qiymatlarini olish
                const min = parseInt(e.target.dataset.min);
                const max = parseInt(e.target.dataset.max);
                this.currentFilter = { min, max };
                
                // Filter qo'llash
                this.applyFilter(this.currentFilter);
            });
        });
        
        // Modal yopish
        this.elements.closeModal.addEventListener('click', () => this.closeOrderModal());
        this.elements.cancelOrder.addEventListener('click', () => this.closeOrderModal());
        this.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.closeOrderModal();
            }
        });
        
        // Buyurtma formasi
        this.elements.orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        
        // Telefon raqamini formatlash
        this.elements.phoneNumberInput.addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('998')) {
            value = '+' + value;
        } else if (value.startsWith('9') && value.length <= 9) {
            value = '+998' + value;
        }
        
        input.value = value;
    }
    
    applyFilter(filter) {
        const filteredProducts = this.filterManager.filterProducts(this.products, filter);
        this.displayProducts(filteredProducts);
    }
    
    async handleOrderSubmit(e) {
        e.preventDefault();
        
        const phoneNumber = this.elements.phoneNumberInput.value;
        const customerName = this.elements.customerNameInput.value;
        
        // Telefon raqami validatsiyasi
        if (!this.orderManager.validatePhoneNumber(phoneNumber)) {
            this.notificationManager.showError('Iltimos, to\'g\'ri telefon raqamini kiriting');
            return;
        }
        
        try {
            // Buyurtmani saqlash
            await this.orderManager.saveOrder({
                productId: this.currentProduct.id,
                productName: this.currentProduct.name,
                customerName: customerName || 'Nomalum',
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString()
            });
            
            // Muvaffaqiyatli xabar
            this.notificationManager.showSuccess('Buyurtmangiz qabul qilindi! Tez orada operator aloqaga chiqadi.');
            
            // Modalni yopish
            this.closeOrderModal();
            
        } catch (error) {
            console.error('Buyurtmani saqlashda xatolik:', error);
            this.notificationManager.showError('Buyurtmani saqlashda xatolik yuz berdi');
        }
    }
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new ProductCatalogApp();
});

// Module export
export { ProductCatalogApp };
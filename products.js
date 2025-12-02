import { ProductManager } from './modules/product-manager.js';
import { NotificationManager } from './modules/notification-manager.js';
import { UIHelper } from './modules/ui-helper.js';

class ProductsPage {
    constructor() {
        this.productManager = new ProductManager();
        this.notificationManager = new NotificationManager();
        this.uiHelper = new UIHelper();
        
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        
        this.filters = {
            minPrice: 0,
            maxPrice: 9999999,
            category: '',
            sort: 'newest',
            search: ''
        };
        
        this.init();
    }
    
    async init() {
        // DOM elements
        this.elements = {
            productsGrid: document.getElementById('productsGrid'),
            showingCount: document.getElementById('showingCount'),
            totalCount: document.getElementById('totalCount'),
            noResults: document.getElementById('noResults'),
            pagination: document.getElementById('pagination'),
            
            // Filters
            minPrice: document.getElementById('minPrice'),
            maxPrice: document.getElementById('maxPrice'),
            categoryFilter: document.getElementById('categoryFilter'),
            sortFilter: document.getElementById('sortFilter'),
            searchInput: document.getElementById('searchInput'),
            applyFilters: document.getElementById('applyFilters'),
            clearFilters: document.getElementById('clearFilters'),
            resetSearch: document.getElementById('resetSearch')
        };
        
        // Load products
        await this.loadProducts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Apply initial filters
        this.applyFilters();
    }
    
    async loadProducts() {
        try {
            // Show skeleton loading
            this.uiHelper.showSkeletonLoading(this.elements.productsGrid);
            
            // Load products from product manager
            this.products = await this.productManager.loadProducts();
            
            // Update total count
            this.elements.totalCount.textContent = this.products.length;
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.notificationManager.showError('Mahsulotlarni yuklashda xatolik');
        }
    }
    
    setupEventListeners() {
        // Apply filters button
        this.elements.applyFilters.addEventListener('click', () => this.updateFiltersFromUI());
        
        // Clear filters button
        this.elements.clearFilters.addEventListener('click', () => this.clearFilters());
        
        // Reset search button
        this.elements.resetSearch.addEventListener('click', () => {
            this.elements.searchInput.value = '';
            this.updateFiltersFromUI();
        });
        
        // Search input with debounce
        let searchTimeout;
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 500);
        });
        
        // Sort and category filters
        this.elements.sortFilter.addEventListener('change', () => this.updateFiltersFromUI());
        this.elements.categoryFilter.addEventListener('change', () => this.updateFiltersFromUI());
        
        // Price inputs with debounce
        [this.elements.minPrice, this.elements.maxPrice].forEach(input => {
            input.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.updateFiltersFromUI();
                }, 500);
            });
        });
    }
    
    updateFiltersFromUI() {
        this.filters = {
            minPrice: parseInt(this.elements.minPrice.value) || 0,
            maxPrice: parseInt(this.elements.maxPrice.value) || 9999999,
            category: this.elements.categoryFilter.value,
            sort: this.elements.sortFilter.value,
            search: this.elements.searchInput.value.toLowerCase()
        };
        
        this.applyFilters();
    }
    
    clearFilters() {
        this.elements.minPrice.value = '';
        this.elements.maxPrice.value = '';
        this.elements.categoryFilter.value = '';
        this.elements.sortFilter.value = 'newest';
        this.elements.searchInput.value = '';
        
        this.filters = {
            minPrice: 0,
            maxPrice: 9999999,
            category: '',
            sort: 'newest',
            search: ''
        };
        
        this.applyFilters();
    }
    
    applyFilters() {
        // Filter products
        this.filteredProducts = this.products.filter(product => {
            // Price filter
            if (product.price < this.filters.minPrice || product.price > this.filters.maxPrice) {
                return false;
            }
            
            // Category filter
            if (this.filters.category && product.category !== this.filters.category) {
                return false;
            }
            
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                if (!product.name.toLowerCase().includes(searchTerm) && 
                    !product.description?.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Sort products
        this.sortProducts();
        
        // Update UI
        this.updateProductsDisplay();
        this.updatePagination();
    }
    
    sortProducts() {
        switch (this.filters.sort) {
            case 'price_low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                // Already sorted by ID (which is timestamp based)
                break;
        }
    }
    
    updateProductsDisplay() {
        // Hide skeleton
        this.uiHelper.hideSkeletonLoading();
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        // Update counts
        this.elements.showingCount.textContent = pageProducts.length;
        
        // Clear products grid
        this.elements.productsGrid.innerHTML = '';
        
        // Show/hide no results
        if (this.filteredProducts.length === 0) {
            this.elements.noResults.style.display = 'block';
            return;
        } else {
            this.elements.noResults.style.display = 'none';
        }
        
        // Display products
        pageProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.productsGrid.appendChild(productCard);
        });
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
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
        
        // Add event listener for order button
        const orderBtn = card.querySelector('.order-btn');
        orderBtn.addEventListener('click', () => {
            this.openOrderModal(product);
        });
        
        return card;
    }
    
    openOrderModal(product) {
        // Create modal if doesn't exist
        let modal = document.getElementById('orderModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orderModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-shopping-cart"></i> Buyurtma Berish</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <div class="form-group">
                                <label for="orderProductName">Mahsulot:</label>
                                <input type="text" id="orderProductName" readonly class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="orderCustomerName">Ismingiz:</label>
                                <input type="text" id="orderCustomerName" class="form-control" placeholder="Ismingizni kiriting">
                            </div>
                            <div class="form-group">
                                <label for="orderPhoneNumber">Telefon raqamingiz *</label>
                                <input type="tel" id="orderPhoneNumber" class="form-control" required placeholder="+998XXXXXXXXX">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary close-modal">Bekor qilish</button>
                                <button type="submit" class="btn btn-primary">Buyurtma berish</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for modal
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            
            // Form submission
            modal.querySelector('#orderForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const phone = modal.querySelector('#orderPhoneNumber').value;
                const name = modal.querySelector('#orderCustomerName').value;
                
                // Validate phone
                if (!/^\+998\d{9}$/.test(phone)) {
                    this.notificationManager.showError('Iltimos, to\'g\'ri telefon raqamini kiriting (+998XXXXXXXXX)');
                    return;
                }
                
                // Save order
                const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                orders.push({
                    productId: product.id,
                    productName: product.name,
                    customerName: name,
                    phoneNumber: phone,
                    timestamp: new Date().toISOString()
                });
                
                localStorage.setItem('orders', JSON.stringify(orders));
                
                this.notificationManager.showSuccess('Buyurtmangiz qabul qilindi!');
                modal.classList.remove('active');
            });
        }
        
        // Set product name
        modal.querySelector('#orderProductName').value = product.name;
        
        // Show modal
        modal.classList.add('active');
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        // Clear pagination
        this.elements.pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateProductsDisplay();
                this.updatePagination();
            }
        });
        this.elements.pagination.appendChild(prevBtn);
        
        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn';
            if (i === this.currentPage) pageBtn.classList.add('active');
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.updateProductsDisplay();
                this.updatePagination();
            });
            this.elements.pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateProductsDisplay();
                this.updatePagination();
            }
        });
        this.elements.pagination.appendChild(nextBtn);
    }
}

// Initialize products page
document.addEventListener('DOMContentLoaded', () => {
    new ProductsPage();
});
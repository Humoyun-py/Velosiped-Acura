// Mahsulotlar boshqaruvi
export class ProductManager {
    constructor() {
        this.storageKey = 'premiumshop_products';
    }
    
    async loadProducts() {
        try {
            // Avval localStorage dan tekshirish
            const localProducts = this.getLocalProducts();
            
            if (localProducts && localProducts.length > 0) {
                return localProducts;
            }
            
            // Agar localStorage bo'sh bo'lsa, JSON fayldan yuklash
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('JSON faylni yuklashda xatolik');
            
            const products = await response.json();
            
            // LocalStorage ga saqlash
            this.saveProducts(products);
            
            return products;
            
        } catch (error) {
            console.error('Mahsulotlarni yuklashda xatolik:', error);
            
            // Agar JSON ham yuklanmasa, default mahsulotlar
            const defaultProducts = this.getDefaultProducts();
            this.saveProducts(defaultProducts);
            return defaultProducts;
        }
    }
    
    getLocalProducts() {
        const productsJson = localStorage.getItem(this.storageKey);
        return productsJson ? JSON.parse(productsJson) : null;
    }
    
    saveProducts(products) {
        localStorage.setItem(this.storageKey, JSON.stringify(products));
    }
    
    async addProduct(product) {
        const products = await this.loadProducts();
        product.id = Date.now().toString();
        products.push(product);
        this.saveProducts(products);
        return product;
    }
    
    async updateProduct(updatedProduct) {
        const products = await this.loadProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        
        if (index !== -1) {
            products[index] = updatedProduct;
            this.saveProducts(products);
            return updatedProduct;
        }
        
        throw new Error('Mahsulot topilmadi');
    }
    
    async deleteProduct(productId) {
        const products = await this.loadProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        this.saveProducts(filteredProducts);
    }
    
    getDefaultProducts() {
        return [
            {
                id: "1",
                name: "Smart Watch Series 5",
                price: 850000,
                age: 1,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                description: "Aqlli soat, suvga chidamli, yurak urish tezligi sensori"
            },
            {
                id: "2",
                name: "Wireless Headphones",
                price: 450000,
                age: 0,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-400",
                description: "Shovqinni bartaraf qiluvchi simsiz naushniklar"
            },
            {
                id: "3",
                name: "Gaming Laptop",
                price: 12500000,
                age: 2,
                image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
                description: "Yuqori darajadagi o'yinlar uchun mos laptop"
            },
            {
                id: "4",
                name: "Smartphone Pro",
                price: 6500000,
                age: 1,
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
                description: "Eng yangi smartfon, 4 ta kamera"
            },
            {
                id: "5",
                name: "Digital Camera",
                price: 3200000,
                age: 3,
                image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
                description: "Professional raqamli kamera, 24.2 MP"
            },
            {
                id: "6",
                name: "Tablet Computer",
                price: 2800000,
                age: 1,
                image: "https://images.unsplash.com/photo-1546054450-60ef6a5d123a?w=400",
                description: "10.5 dyuymli planshet, 256 GB xotira"
            },
            {
                id: "7",
                name: "Bluetooth Speaker",
                price: 750000,
                age: 0,
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
                description: "Portativ Bluetooth karnay, 20 soatlik quvvat"
            },
            {
                id: "8",
                name: "Fitness Tracker",
                price: 350000,
                age: 1,
                image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400",
                description: "Fitnes treker, yurak urishi va uyqu monitoringi"
            },
            {
                id: "9",
                name: "External SSD",
                price: 1200000,
                age: 0,
                image: "https://images.unsplash.com/photo-1581344981537-6c6d81b12d8c?w=400",
                description: "1 TB tashqi SSD, 1050 MB/s o'qish tezligi"
            },
            {
                id: "10",
                name: "Gaming Mouse",
                price: 550000,
                age: 2,
                image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400",
                description: "RGB gaming sichqoncha, 16000 DPI"
            },
            {
                id: "11",
                name: "Mechanical Keyboard",
                price: 950000,
                age: 1,
                image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400",
                description: "Mexanik klaviatura, RGB yoritish"
            },
            {
                id: "12",
                name: "Monitor 4K",
                price: 4500000,
                age: 3,
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
                description: "32 dyuymli 4K monitor, 144Hz yangilash chastotasi"
            },
            {
                id: "13",
                name: "Wireless Charger",
                price: 280000,
                age: 0,
                image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400",
                description: "15W tez simsiz zaryadlovchi"
            },
            {
                id: "14",
                name: "Action Camera",
                price: 2200000,
                age: 2,
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
                description: "4K harakat kamera, suvga chidamli"
            },
            {
                id: "15",
                name: "Smart Home Hub",
                price: 850000,
                age: 1,
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                description: "Aqlli uy markazi, ovoz boshqaruvi"
            },
            {
                id: "16",
                name: "E-Reader",
                price: 1500000,
                age: 2,
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                description: "Elektron kitob o'qish qurilmasi, 6 dyuymli ekran"
            },
            {
                id: "17",
                name: "VR Headset",
                price: 3200000,
                age: 3,
                image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400",
                description: "Virtual reallik shlyem, 110 daraja ko'rish maydoni"
            },
            {
                id: "18",
                name: "Portable Projector",
                price: 2800000,
                age: 1,
                image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400",
                description: "Portativ proyektor, 1080p, 3000 lumen"
            },
            {
                id: "19",
                name: "Noise Cancelling Earbuds",
                price: 1800000,
                age: 0,
                image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e5?w=400",
                description: "To'liq simsiz quloqchinlar, shovqinni bartaraf qilish"
            },
            {
                id: "20",
                name: "Smart Light Bulbs",
                price: 450000,
                age: 0,
                image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
                description: "RGB aqlli chiroqlar, ovoz boshqaruvi"
            }
        ];
    }
}
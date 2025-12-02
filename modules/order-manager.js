// Buyurtmalar boshqaruvi
export class OrderManager {
    constructor() {
        this.storageKey = 'premiumshop_orders';
    }
    
    validatePhoneNumber(phone) {
        // +998XXXXXXXXX format
        const internationalRegex = /^\+998\d{9}$/;
        
        // Mahalliy format: 90XXXXXX, 91XXXXXX, 93XXXXXX, 94XXXXXX, 95XXXXXX, 97XXXXXX, 98XXXXXX, 99XXXXXX
        const localRegex = /^[9][0-9]\d{7}$/;
        
        return internationalRegex.test(phone) || localRegex.test(phone);
    }
    
    async saveOrder(orderData) {
        const orders = await this.getOrders();
        
        orderData.id = Date.now().toString();
        orderData.timestamp = new Date().toISOString();
        
        orders.push(orderData);
        localStorage.setItem(this.storageKey, JSON.stringify(orders));
        
        return orderData;
    }
    
    async getOrders() {
        const ordersJson = localStorage.getItem(this.storageKey);
        return ordersJson ? JSON.parse(ordersJson) : [];
    }
    
    async deleteOrder(orderId) {
        const orders = await this.getOrders();
        const filteredOrders = orders.filter(order => order.id !== orderId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredOrders));
    }
    
    async clearOrders() {
        localStorage.removeItem(this.storageKey);
    }
}
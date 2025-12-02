// Filtrlash boshqaruvi
export class FilterManager {
    filterProducts(products, filter) {
        return products.filter(product => {
            return product.price >= filter.min && product.price <= filter.max;
        });
    }
    
    getFilterRanges() {
        return [
            { min: 0, max: 999999, label: 'Barchasi' },
            { min: 450, max: 800, label: '450-800' },
            { min: 900, max: 1200, label: '900-1200' },
            { min: 1300, max: 1500, label: '1300-1500' },
            { min: 1500, max: 2000, label: '1500-2000' },
            { min: 2000, max: 4500, label: '2000-4500' },
            { min: 4500, max: 7000, label: '4500-7000' }
        ];
    }
}
// UI yordamchi funksiyalari
export class UIHelper {
    showSkeletonLoading(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="skeleton-container">
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
            </div>
        `;
    }
    
    hideSkeletonLoading() {
        const skeletonContainers = document.querySelectorAll('.skeleton-container');
        skeletonContainers.forEach(container => {
            container.style.display = 'none';
        });
    }
    
    showLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.body.appendChild(spinner);
        return spinner;
    }
    
    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('uz-UZ').format(price);
    }
}
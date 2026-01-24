// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
});

// Hero Slider
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-slide');
        this.nextBtn = document.querySelector('.next-slide');
        this.currentSlide = 0;
        this.autoSlideInterval = null;

        this.init();
    }

    init() {
        this.showSlide(0);
        this.startAutoSlide();

        // Event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause auto slide on hover
        const hero = document.querySelector('.hero');
        hero.addEventListener('mouseenter', () => this.stopAutoSlide());
        hero.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Initialize hero slider
const heroSlider = new HeroSlider();

// Product Filter
class ProductFilter {
    constructor() {
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.productCards = document.querySelectorAll('.product-card');

        this.init();
    }

    init() {
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                this.filterProducts(category);
                this.updateActiveBtn(btn);
            });
        });
    }

    filterProducts(category) {
        this.productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    }

    updateActiveBtn(activeBtn) {
        this.categoryBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
}

// Initialize product filter
const productFilter = new ProductFilter();

// Shopping Cart
class ShoppingCart {
    constructor() {
        this.cartCount = document.querySelector('.cart-count');
        this.wishlistCount = document.querySelector('.wishlist-count');
        this.cart = [];
        this.wishlist = [];

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.updateCounters();
        this.bindEvents();
    }

    bindEvents() {
        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening product detail modal
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.addToCart(product, productCard);
                this.showNotification(`${product.name} ditambahkan ke keranjang!`, 'success');
            });
        });

        // Wishlist buttons
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening product detail modal
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.toggleWishlist(product, productCard);
            });
        });

        // Buy Now buttons
        const buyNowBtns = document.querySelectorAll('.buy-now');
        buyNowBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening product detail modal
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.handleBuyNow(product);
            });
        });

        // Cart icon click - open cart sidebar
        const cartIcon = document.querySelector('.nav-action[href="#cart"]');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCartSidebar();
            });
        }

        // Wishlist icon click - open wishlist sidebar
        const wishlistIcon = document.querySelector('.nav-action[href="#wishlist"]');
        if (wishlistIcon) {
            wishlistIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWishlistSidebar();
            });
        }
    }

    getProductData(productCard) {
        const name = productCard.querySelector('h3').textContent;
        const price = productCard.querySelector('.current-price').textContent;
        const image = productCard.querySelector('img').src;
        // Quantity will be set in checkout, default to 1
        const quantity = 1;
        
        return {
            name,
            price,
            image,
            quantity,
            id: Date.now() + Math.random()
        };
    }

    addToCart(product, productCard = null) {
        // Check if product already exists in cart (by name)
        const existingIndex = this.cart.findIndex(item => item.name === product.name);
        
        if (existingIndex > -1) {
            // Update quantity if product already exists
            this.cart[existingIndex].quantity += product.quantity;
        } else {
            // Add new product to cart
            this.cart.push(product);
        }
        
        this.saveToStorage();
        this.updateCounters();
        this.animateButton('.cart-count');
        
        // Animate product image flying to cart icon
        if (productCard) {
            this.animateToCart(productCard);
        }
        
        // Refresh cart sidebar if open
        if (document.getElementById('cartSidebar')?.classList.contains('active')) {
            this.displayCartItems();
        }
    }

    animateToCart(productCard) {
        const productImage = productCard.querySelector('img');
        if (!productImage) return;
        
        const cartIcon = document.querySelector('.nav-action[href="#cart"]');
        if (!cartIcon) return;
        
        // Get positions
        const imgRect = productImage.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        
        // Create flying image clone
        const flyingImg = productImage.cloneNode(true);
        flyingImg.style.cssText = `
            position: fixed;
            width: ${imgRect.width}px;
            height: ${imgRect.height}px;
            left: ${imgRect.left}px;
            top: ${imgRect.top}px;
            z-index: 10000;
            pointer-events: none;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        document.body.appendChild(flyingImg);
        
        // Trigger animation
        setTimeout(() => {
            flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingImg.style.width = '30px';
            flyingImg.style.height = '30px';
            flyingImg.style.opacity = '0.5';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (flyingImg.parentNode) {
                flyingImg.parentNode.removeChild(flyingImg);
            }
        }, 600);
    }

    toggleWishlist(product, productCard = null) {
        const existingIndex = this.wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            this.showNotification(`${product.name} dihapus dari wishlist`, 'info');
        } else {
            this.wishlist.push(product);
            this.showNotification(`${product.name} ditambahkan ke wishlist!`, 'success');
            
            // Animate product image flying to wishlist icon
            if (productCard) {
                this.animateToWishlist(productCard);
            }
        }
        
        this.saveToStorage();
        this.updateCounters();
        this.animateButton('.wishlist-count');
        
        // Refresh wishlist sidebar if open
        if (document.getElementById('wishlistSidebar')?.classList.contains('active')) {
            this.displayWishlistItems();
        }
    }

    animateToWishlist(productCard) {
        const productImage = productCard.querySelector('img');
        if (!productImage) return;
        
        const wishlistIcon = document.querySelector('.nav-action[href="#wishlist"]');
        if (!wishlistIcon) return;
        
        // Get positions
        const imgRect = productImage.getBoundingClientRect();
        const wishlistRect = wishlistIcon.getBoundingClientRect();
        
        // Create flying image clone
        const flyingImg = productImage.cloneNode(true);
        flyingImg.style.cssText = `
            position: fixed;
            width: ${imgRect.width}px;
            height: ${imgRect.height}px;
            left: ${imgRect.left}px;
            top: ${imgRect.top}px;
            z-index: 10000;
            pointer-events: none;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        document.body.appendChild(flyingImg);
        
        // Trigger animation
        setTimeout(() => {
            flyingImg.style.left = `${wishlistRect.left + wishlistRect.width / 2}px`;
            flyingImg.style.top = `${wishlistRect.top + wishlistRect.height / 2}px`;
            flyingImg.style.width = '30px';
            flyingImg.style.height = '30px';
            flyingImg.style.opacity = '0.5';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (flyingImg.parentNode) {
                flyingImg.parentNode.removeChild(flyingImg);
            }
        }, 600);
    }

    handleBuyNow(product) {
        // Store product for checkout (only this product, not all cart)
        // This ensures checkout only shows the selected product
        const checkoutItems = [product];
        localStorage.setItem('pendingCheckout', JSON.stringify(checkoutItems));
        
        // Note: We don't add to cart here because user clicked "Beli Sekarang"
        // which means they want to checkout immediately, not add to cart
        
        // Show success message with animation
        this.showBuyNowResponse(product);
    }

    showBuyNowResponse(product) {
        // Create a more prominent notification for buy now
        const notification = document.createElement('div');
        notification.className = 'notification notification-success buy-now-notification';
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(39, 174, 96, 0.4);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">✓</div>
            <h3 style="margin: 0 0 10px 0; font-size: 24px;">Pesanan Diterima!</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">${product.name}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Produk telah ditambahkan ke keranjang Anda</p>
            <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">Silakan langsung <a href="#" class="checkout-link" style="color: white; text-decoration: underline; font-weight: bold; cursor: pointer; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 5px; transition: all 0.3s;">checkout</a></p>
        `;
        
        document.body.appendChild(notification);
        
        // Add click event to checkout link
        const checkoutLink = notification.querySelector('.checkout-link');
        if (checkoutLink) {
            checkoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Close notification
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
                // Show checkout page with only the selected product
                showCheckoutPage('buyNow');
            });
            
            // Add hover effect
            checkoutLink.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,255,255,0.3)';
                this.style.transform = 'scale(1.05)';
            });
            
            checkoutLink.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.2)';
                this.style.transform = 'scale(1)';
            });
        }
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Animate out and remove (extend time to 5 seconds to allow clicking)
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Also show regular notification
        this.showNotification(`Terima kasih! ${product.name} telah ditambahkan ke keranjang. Silakan lanjutkan ke checkout.`, 'success');
    }

    updateCounters() {
        if (this.cartCount) {
            if (this.cart.length > 0) {
                this.cartCount.textContent = this.cart.length;
                this.cartCount.style.display = 'flex';
            } else {
                this.cartCount.style.display = 'none';
            }
        }
        
        if (this.wishlistCount) {
            if (this.wishlist.length > 0) {
                this.wishlistCount.textContent = this.wishlist.length;
                this.wishlistCount.style.display = 'flex';
            } else {
                this.wishlistCount.style.display = 'none';
            }
        }
    }

    animateButton(selector) {
        const element = document.querySelector(selector);
        element.style.transform = 'scale(1.3)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    loadFromStorage() {
        const savedCart = localStorage.getItem('cart');
        const savedWishlist = localStorage.getItem('wishlist');
        
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
        
        if (savedWishlist) {
            this.wishlist = JSON.parse(savedWishlist);
        }
    }

    openCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = cartSidebar?.querySelector('.sidebar-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            if (overlay) {
                overlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
            this.displayCartItems();
        }
    }

    closeCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = cartSidebar?.querySelector('.sidebar-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }

    openWishlistSidebar() {
        const wishlistSidebar = document.getElementById('wishlistSidebar');
        const overlay = wishlistSidebar?.querySelector('.sidebar-overlay');
        
        if (wishlistSidebar) {
            wishlistSidebar.classList.add('active');
            if (overlay) {
                overlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
            this.displayWishlistItems();
        }
    }

    closeWishlistSidebar() {
        const wishlistSidebar = document.getElementById('wishlistSidebar');
        const overlay = wishlistSidebar?.querySelector('.sidebar-overlay');
        
        if (wishlistSidebar) {
            wishlistSidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }

    displayCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems) return;
        
        cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Keranjang Anda kosong</p>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = 'Rp 0';
            return;
        }
        
        let total = 0;
        
        this.cart.forEach((item, index) => {
            const priceStr = item.price.replace(/[^\d]/g, '');
            const price = parseInt(priceStr) || 0;
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price}</div>
                    <div class="cart-item-quantity">
                        <label>Jumlah:</label>
                        <div class="quantity-selector">
                            <button class="quantity-btn minus" type="button">-</button>
                            <input type="number" class="quantity-input" value="${quantity}" min="1" max="99" data-index="${index}">
                            <button class="quantity-btn plus" type="button">+</button>
                        </div>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item-btn" data-index="${index}" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(itemElement);
            
            // Quantity controls
            const quantityInput = itemElement.querySelector('.quantity-input');
            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                    this.updateCartItemQuantity(index, currentValue - 1);
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                const maxValue = parseInt(quantityInput.max) || 99;
                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                    this.updateCartItemQuantity(index, currentValue + 1);
                }
            });
            
            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value) || 1;
                const min = parseInt(quantityInput.min) || 1;
                const max = parseInt(quantityInput.max) || 99;
                if (value < min) value = min;
                if (value > max) value = max;
                quantityInput.value = value;
                this.updateCartItemQuantity(index, value);
            });
            
            // Remove button
            const removeBtn = itemElement.querySelector('.remove-item-btn');
            removeBtn.addEventListener('click', () => {
                this.removeFromCart(index);
            });
        });
        
        if (cartTotal) cartTotal.textContent = formatPrice(total);
    }

    updateCartItemQuantity(index, quantity) {
        if (this.cart[index]) {
            this.cart[index].quantity = quantity;
            this.saveToStorage();
            this.updateCounters();
            this.displayCartItems();
        }
    }

    removeFromCart(index) {
        if (this.cart[index]) {
            const itemName = this.cart[index].name;
            this.cart.splice(index, 1);
            this.saveToStorage();
            this.updateCounters();
            this.displayCartItems();
            this.showNotification(`${itemName} dihapus dari keranjang`, 'info');
        }
    }

    displayWishlistItems() {
        const wishlistItems = document.getElementById('wishlistItems');
        
        if (!wishlistItems) return;
        
        wishlistItems.innerHTML = '';
        
        if (this.wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fas fa-heart"></i>
                    <p>Wishlist Anda kosong</p>
                </div>
            `;
            return;
        }
        
        this.wishlist.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wishlist-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price}</div>
                </div>
                <div class="wishlist-item-actions">
                    <button class="add-to-cart-from-wishlist" data-index="${index}">
                        <i class="fas fa-shopping-cart"></i> Tambah ke Keranjang
                    </button>
                    <button class="remove-item-btn" data-index="${index}" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            wishlistItems.appendChild(itemElement);
            
            // Add to cart button
            const addToCartBtn = itemElement.querySelector('.add-to-cart-from-wishlist');
            addToCartBtn.addEventListener('click', () => {
                const product = this.wishlist[index];
                this.addToCart(product);
                this.showNotification(`${product.name} ditambahkan ke keranjang!`, 'success');
                this.displayCartItems();
            });
            
            // Remove button
            const removeBtn = itemElement.querySelector('.remove-item-btn');
            removeBtn.addEventListener('click', () => {
                this.removeFromWishlist(index);
            });
        });
    }

    removeFromWishlist(index) {
        if (this.wishlist[index]) {
            const itemName = this.wishlist[index].name;
            this.wishlist.splice(index, 1);
            this.saveToStorage();
            this.updateCounters();
            this.displayWishlistItems();
            this.showNotification(`${itemName} dihapus dari wishlist`, 'info');
        }
    }
}

// Initialize shopping cart
const shoppingCart = new ShoppingCart();
window.shoppingCart = shoppingCart; // Make it globally accessible

// Product Detail Modal
class ProductDetailModal {
    constructor() {
        this.modal = document.getElementById('productModal');
        this.closeBtn = document.getElementById('closeModal');
        this.currentProductCard = null;
        
        this.init();
    }

    init() {
        // Add click event to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking on action buttons or add to cart button
                if (e.target.closest('.product-actions') || 
                    e.target.closest('.add-to-cart') ||
                    e.target.closest('.wishlist-btn') ||
                    e.target.closest('.quick-view')) {
                    return;
                }
                
                this.showProductDetail(card);
            });
        });

        // Close modal events
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.modal) {
            const overlay = this.modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal());
            }
        }

        // Add to cart from modal
        const addToCartModal = this.modal?.querySelector('.add-to-cart-modal');
        if (addToCartModal) {
            addToCartModal.addEventListener('click', () => {
                if (this.currentProductCard) {
                    const product = shoppingCart.getProductData(this.currentProductCard);
                    // Quantity will be set in checkout, default to 1
                    product.quantity = 1;
                    shoppingCart.addToCart(product);
                    showNotification(`${product.name} ditambahkan ke keranjang!`, 'success');
                    this.closeModal();
                }
            });
        }

        // Buy now from modal
        const buyNowModal = this.modal?.querySelector('.buy-now-modal');
        if (buyNowModal) {
            buyNowModal.addEventListener('click', () => {
                if (this.currentProductCard) {
                    const product = shoppingCart.getProductData(this.currentProductCard);
                    // Quantity will be set in checkout, default to 1
                    product.quantity = 1;
                    shoppingCart.handleBuyNow(product);
                    this.closeModal();
                }
            });
        }

        // Add to wishlist from modal
        const wishlistModal = this.modal?.querySelector('.wishlist-modal');
        if (wishlistModal) {
            wishlistModal.addEventListener('click', () => {
                if (this.currentProductCard) {
                    const product = shoppingCart.getProductData(this.currentProductCard);
                    shoppingCart.toggleWishlist(product);
                }
            });
        }
    }

    showProductDetail(productCard) {
        if (!this.modal) return;

        // Store reference to current product card
        this.currentProductCard = productCard;

        // Get product data
        const name = productCard.querySelector('h3')?.textContent || '';
        const description = productCard.querySelector('.product-desc')?.textContent || '';
        const image = productCard.querySelector('img')?.src || '';
        const currentPrice = productCard.querySelector('.current-price')?.textContent || '';
        const originalPriceEl = productCard.querySelector('.original-price');
        const originalPrice = originalPriceEl?.textContent || '';
        const category = productCard.getAttribute('data-category') || '';

        // Populate modal
        const modalName = document.getElementById('modalProductName');
        const modalDesc = document.getElementById('modalProductDescription');
        const modalImage = document.getElementById('modalProductImage');
        const modalCurrentPrice = document.getElementById('modalCurrentPrice');
        const modalOriginalPrice = document.getElementById('modalOriginalPrice');
        const modalCategory = document.getElementById('modalProductCategory');

        if (modalName) modalName.textContent = name;
        if (modalDesc) modalDesc.textContent = description;
        if (modalImage) {
            modalImage.src = image;
            modalImage.alt = name;
        }
        if (modalCurrentPrice) modalCurrentPrice.textContent = currentPrice;
        
        if (modalOriginalPrice) {
            if (originalPrice) {
                modalOriginalPrice.textContent = originalPrice;
                modalOriginalPrice.style.display = 'inline';
            } else {
                modalOriginalPrice.style.display = 'none';
            }
        }

        // Set category
        const categoryNames = {
            'bouquet': 'Bouquet',
            'wedding': 'Wedding',
            'funeral': 'Duka Cita',
            'plants': 'Tanaman'
        };
        if (modalCategory) {
            modalCategory.textContent = categoryNames[category] || category;
        }

        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            this.currentProductCard = null;
        }
    }
}

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        const checkoutPage = document.getElementById('checkoutPage');
        if (checkoutPage && checkoutPage.classList.contains('active')) {
            closeCheckoutPage();
        }
    }
});

// Checkout Page Functions
// Store current checkout source
let currentCheckoutSource = 'cart';

function showCheckoutPage(source = 'cart') {
    const checkoutPage = document.getElementById('checkoutPage');
    if (!checkoutPage) return;
    
    // Store current source
    currentCheckoutSource = source;
    
    // Populate checkout - check if from "Beli Sekarang" or regular cart
    populateCheckout(source);
    
    // Show checkout page
    checkoutPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function closeCheckoutPage() {
    const checkoutPage = document.getElementById('checkoutPage');
    if (checkoutPage) {
        checkoutPage.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function populateCheckout(source = 'cart') {
    // Determine which items to show
    let itemsToCheckout = [];
    
    if (source === 'buyNow') {
        // Get only the product from "Beli Sekarang"
        const pendingCheckout = JSON.parse(localStorage.getItem('pendingCheckout')) || [];
        itemsToCheckout = pendingCheckout;
    } else {
        // Get all items from cart
        itemsToCheckout = JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    const checkoutItems = document.getElementById('checkoutItems');
    const itemCount = document.getElementById('itemCount');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const sidebarSubtotal = document.getElementById('sidebarSubtotal');
    const sidebarTotal = document.getElementById('sidebarTotal');
    
    if (!checkoutItems) return;
    
    // Clear existing items
    checkoutItems.innerHTML = '';
    
    if (itemsToCheckout.length === 0) {
        checkoutItems.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Tidak ada item untuk checkout</p>';
        if (itemCount) itemCount.textContent = '0';
        if (checkoutSubtotal) checkoutSubtotal.textContent = 'Rp 0';
        if (checkoutTotal) checkoutTotal.textContent = 'Rp 0';
        if (sidebarSubtotal) sidebarSubtotal.textContent = 'Rp 0';
        if (sidebarTotal) sidebarTotal.textContent = 'Rp 0';
        return;
    }
    
    let total = 0;
    let totalItems = 0;
    
    itemsToCheckout.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.setAttribute('data-item-index', index);
        
        // Extract price number from string like "Rp 150.000"
        const priceStr = item.price.replace(/[^\d]/g, '');
        const price = parseInt(priceStr) || 0;
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        total += itemTotal;
        totalItems += quantity;
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <div class="order-item-quantity">
                    <label>Jumlah:</label>
                    <div class="order-item-quantity-wrapper">
                        <div class="quantity-selector">
                            <button class="quantity-btn minus" type="button" title="Kurangi">-</button>
                            <input type="number" class="quantity-input checkout-quantity" value="${quantity}" min="1" max="99" data-item-index="${index}" placeholder="1" title="Klik untuk mengisi jumlah manual">
                            <button class="quantity-btn plus" type="button" title="Tambah">+</button>
                        </div>
                    </div>
                    <span class="quantity-hint">(Klik input untuk mengisi jumlah manual)</span>
                </div>
            </div>
            <div class="order-item-price">
                <div class="price-per-item">${item.price} x ${quantity}</div>
                <div class="price-total">${formatPrice(itemTotal)}</div>
            </div>
        `;
        
        checkoutItems.appendChild(itemElement);
        
        // Add quantity change listeners
        const quantityInput = itemElement.querySelector('.checkout-quantity');
        const minusBtn = itemElement.querySelector('.minus');
        const plusBtn = itemElement.querySelector('.plus');
        
        if (quantityInput && minusBtn && plusBtn) {
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                    updateCartQuantity(index, currentValue - 1);
                    // Refresh will be handled in updateCartQuantity
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                const maxValue = parseInt(quantityInput.max) || 99;
                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                    updateCartQuantity(index, currentValue + 1);
                    // Refresh will be handled in updateCartQuantity
                }
            });
            
            // Allow manual input
            quantityInput.addEventListener('input', () => {
                // Allow typing, but validate on blur
            });
            
            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value) || 1;
                const min = parseInt(quantityInput.min) || 1;
                const max = parseInt(quantityInput.max) || 99;
                
                if (value < min) value = min;
                if (value > max) value = max;
                
                quantityInput.value = value;
                updateCartQuantity(index, value);
                // Refresh will be handled in updateCartQuantity
            });
            
            // Also update on blur to catch any manual changes
            quantityInput.addEventListener('blur', () => {
                let value = parseInt(quantityInput.value) || 1;
                const min = parseInt(quantityInput.min) || 1;
                const max = parseInt(quantityInput.max) || 99;
                
                if (value < min) value = min;
                if (value > max) value = max;
                
                if (parseInt(quantityInput.value) !== value) {
                    quantityInput.value = value;
                }
                updateCartQuantity(index, value);
                populateCheckout(); // Refresh
            });
        }
    });
    
    // Update totals
    const shipping = 15000;
    const finalTotal = total + shipping;
    
    if (itemCount) itemCount.textContent = totalItems;
    if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(total);
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(finalTotal);
    if (sidebarSubtotal) sidebarSubtotal.textContent = formatPrice(total);
    if (sidebarTotal) sidebarTotal.textContent = formatPrice(finalTotal);
}

function updateCartQuantity(index, quantity) {
    // Check if we're updating from pendingCheckout or regular cart
    const pendingCheckout = JSON.parse(localStorage.getItem('pendingCheckout')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Determine which source to update based on current checkout source
    if (currentCheckoutSource === 'buyNow' && pendingCheckout.length > 0 && index < pendingCheckout.length) {
        // Update pending checkout
        pendingCheckout[index].quantity = quantity;
        localStorage.setItem('pendingCheckout', JSON.stringify(pendingCheckout));
        // Refresh checkout display
        populateCheckout('buyNow');
    } else if (currentCheckoutSource === 'cart' && cart[index]) {
        // Update regular cart
        cart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        // Update cart in shopping cart instance
        if (window.shoppingCart) {
            window.shoppingCart.cart = cart;
            window.shoppingCart.updateCounters();
        }
        // Refresh checkout display
        populateCheckout('cart');
    }
}

function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    // Close checkout button
    const closeCheckoutBtn = document.getElementById('closeCheckout');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckoutPage);
    }
    
    // Close on overlay click
    const checkoutOverlay = document.querySelector('.checkout-overlay');
    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', closeCheckoutPage);
    }

    // Cart sidebar close button
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            shoppingCart.closeCartSidebar();
        });
    }

    // Wishlist sidebar close button
    const closeWishlistBtn = document.getElementById('closeWishlist');
    if (closeWishlistBtn) {
        closeWishlistBtn.addEventListener('click', () => {
            shoppingCart.closeWishlistSidebar();
        });
    }

    // Close sidebar on overlay click
    document.querySelectorAll('.sidebar-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            const cartSidebar = document.getElementById('cartSidebar');
            const wishlistSidebar = document.getElementById('wishlistSidebar');
            
            if (cartSidebar?.classList.contains('active')) {
                shoppingCart.closeCartSidebar();
            }
            if (wishlistSidebar?.classList.contains('active')) {
                shoppingCart.closeWishlistSidebar();
            }
        });
    });

    // Checkout from cart sidebar
    const checkoutFromCartBtn = document.getElementById('checkoutFromCart');
    if (checkoutFromCartBtn) {
        checkoutFromCartBtn.addEventListener('click', () => {
            shoppingCart.closeCartSidebar();
            showCheckoutPage('cart');
        });
    }
    
    // Checkout form submit
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate
            if (!data.name || !data.phone || !data.email || !data.address || !data.city) {
                showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
                return;
            }
            
            // Get items to checkout (from pendingCheckout if exists, otherwise from cart)
            const pendingCheckout = JSON.parse(localStorage.getItem('pendingCheckout')) || [];
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemsToCheckout = pendingCheckout.length > 0 ? pendingCheckout : cart;
            
            if (itemsToCheckout.length === 0) {
                showNotification('Tidak ada item untuk checkout', 'error');
                return;
            }
            
            // Calculate total
            let subtotal = 0;
            itemsToCheckout.forEach(item => {
                const priceStr = item.price.replace(/[^\d]/g, '');
                const quantity = item.quantity || 1;
                subtotal += (parseInt(priceStr) || 0) * quantity;
            });
            const shipping = 15000;
            const total = subtotal + shipping;
            
            // Create order object
            const order = {
                id: Date.now(),
                date: new Date().toISOString(),
                customer: data,
                items: itemsToCheckout,
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                payment: data.payment,
                status: 'pending'
            };
            
            // Save order (in real app, this would be sent to server)
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear items after order is placed
            if (pendingCheckout.length > 0) {
                // Clear pending checkout (cart remains untouched for "Beli Sekarang")
                localStorage.removeItem('pendingCheckout');
            } else {
                // Clear cart only if checkout from regular cart
                localStorage.removeItem('cart');
                shoppingCart.cart = [];
                shoppingCart.updateCounters();
            }
            
            // Show success message
            showNotification('Pesanan Anda berhasil diproses! Kami akan menghubungi Anda segera.', 'success');
            
            // Close checkout page
            setTimeout(() => {
                closeCheckoutPage();
                // Redirect or show order confirmation
                alert(`Terima kasih ${data.name}!\n\nPesanan Anda telah diterima.\nTotal: ${formatPrice(total)}\n\nKami akan menghubungi Anda di ${data.phone} untuk konfirmasi.`);
            }, 1000);
        });
    }
});

// Initialize product detail modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const productDetailModal = new ProductDetailModal();
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-item, .product-card, .service-card, .testimonial-card, .gallery-item').forEach(el => {
    observer.observe(el);
});

// Contact Form
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Pesan Terkirim!';
            submitBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                this.reset();
            }, 2000);
        }, 1500);
        
        showNotification('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
    });
}

// Search Functionality
const searchInput = document.querySelector('.nav-action[href="#search"]');
if (searchInput) {
    searchInput.addEventListener('click', function(e) {
        e.preventDefault();
        const searchTerm = prompt('Cari produk bunga:');
        if (searchTerm) {
            searchProducts(searchTerm);
        }
    });
}

function searchProducts(term) {
    const products = document.querySelectorAll('.product-card');
    let found = false;
    
    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const productDesc = product.querySelector('.product-desc').textContent.toLowerCase();
        const searchTermLower = term.toLowerCase();
        
        if (productName.includes(searchTermLower) || productDesc.includes(searchTermLower)) {
            product.style.display = 'block';
            product.classList.add('fade-in');
            found = true;
        } else {
            product.style.display = 'none';
        }
    });
    
    if (!found) {
        showNotification('Produk tidak ditemukan. Coba kata kunci lain.', 'info');
    } else {
        showNotification(`Ditemukan produk dengan kata kunci "${term}"`, 'success');
    }
}

// Gallery Lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const title = this.querySelector('h3').textContent;
        const description = this.querySelector('p').textContent;
        
        showLightbox(img.src, title, description);
    });
});

function showLightbox(imageSrc, title, description) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imageSrc}" alt="${title}">
            <div class="lightbox-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(lightbox);
    
    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 10);
    
    // Close lightbox
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', () => {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(lightbox);
        }, 300);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    notification.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Lazy Loading for Images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-image img');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to elements
    const animatedElements = document.querySelectorAll('.feature-item, .product-card, .service-card');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Selamat datang di Toko Bunga  Pota', 'success');
    }, 1000);
});

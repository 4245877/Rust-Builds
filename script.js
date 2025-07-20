  // Global state
        let cartItems = [];
        let currentRegion = 'US';
        let currentCurrency = 'USD';

        // Currency conversion rates (example rates)
        const exchangeRates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            CAD: 1.35
        };

        // Preloader
        window.addEventListener('load', function() {
            setTimeout(() => {
                document.getElementById('preloader').classList.add('hidden');
                
                // Animate elements on load
                const elementsToAnimate = document.querySelectorAll('.product-card, .advantage-item');
                elementsToAnimate.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('fade-in-up');
                    }, index * 100);
                });
            }, 1000);
        });

        // Region and Currency Selectors
        document.getElementById('regionBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown('regionDropdown');
        });

        document.getElementById('currencyBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown('currencyDropdown');
        });

        function toggleDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const isOpen = dropdown.classList.contains('show');
            
            // Close all dropdowns
            document.querySelectorAll('.selector-dropdown').forEach(dd => {
                dd.classList.remove('show');
            });
            
            // Open the requested dropdown if it wasn't already open
            if (!isOpen) {
                dropdown.classList.add('show');
            }
        }

        // Region selection
        document.getElementById('regionDropdown').addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                const region = e.target.getAttribute('data-region');
                currentRegion = region;
                document.getElementById('regionBtn').innerHTML = `<i class="fas fa-globe"></i> ${region}`;
                this.classList.remove('show');
                
                // Save to localStorage (note: this is for demonstration - in real Shopify, use cookies)
                localStorage.setItem('selectedRegion', region);
            }
        });

        // Currency selection
        document.getElementById('currencyDropdown').addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                const currency = e.target.getAttribute('data-currency');
                currentCurrency = currency;
                document.getElementById('currencyBtn').textContent = currency;
                this.classList.remove('show');
                
                // Update all prices on the page
                updatePrices();
                
                // Save to localStorage
                localStorage.setItem('selectedCurrency', currency);
            }
        });

        // Update prices based on currency
        // Обновляет цены в зависимости от валюты
function updatePrices() {
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(el => {
        const originalPrice = parseFloat(el.getAttribute('data-price'));
        const convertedPrice = (originalPrice * exchangeRates[currentCurrency]).toFixed(2);
        
        // Исправлено: символ по умолчанию '$'
        let currencySymbol = '$'; 
        switch(currentCurrency) {
            case 'EUR': currencySymbol = '€'; break;
            case 'GBP': currencySymbol = '£'; break;
            // Исправлено: символ для CAD также '$'
            case 'CAD': currencySymbol = '$'; break; 
        }
        
        el.textContent = `${currencySymbol}${convertedPrice}`;
    });
    
    // Обновляет также старые цены
    document.querySelectorAll('.old-price').forEach(el => {
        if (el.textContent.includes('$12.99')) {
            const convertedPrice = (12.99 * exchangeRates[currentCurrency]).toFixed(2);
            // Исправлено: символ по умолчанию '$'
            let currencySymbol = '$'; 
            switch(currentCurrency) {
                case 'EUR': currencySymbol = '€'; break;
                case 'GBP': currencySymbol = '£'; break;
                // Исправлено: символ для CAD также '$'
                case 'CAD': currencySymbol = '$'; break;
            }
            el.textContent = `${currencySymbol}${convertedPrice}`;
        } else if (el.textContent.includes('$16.99')) {
            const convertedPrice = (16.99 * exchangeRates[currentCurrency]).toFixed(2);
            // Исправлено: символ по умолчанию '$'
            let currencySymbol = '$'; 
            switch(currentCurrency) {
                case 'EUR': currencySymbol = '€'; break;
                case 'GBP': currencySymbol = '£'; break;
                // Исправлено: символ для CAD также '$'
                case 'CAD': currencySymbol = '$'; break;
            }
            el.textContent = `${currencySymbol}${convertedPrice}`;
        }
    });
}

        // Add data-price attributes to current prices
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('[data-product="solo-fortress"] .current-price').setAttribute('data-price', '8.99');
            document.querySelector('[data-product="clan-citadel"] .current-price').setAttribute('data-price', '12.99');
            document.querySelector('[data-product="farm-bunker"] .current-price').setAttribute('data-price', '6.99');
        });

        // Add to Cart functionality
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productName = this.getAttribute('data-product-name');
                const price = this.getAttribute('data-price');
                
                // Add to cart array
                cartItems.push({
                    name: productName,
                    price: parseFloat(price),
                    currency: currentCurrency
                });
                
                // Update cart count
                updateCartCount();
                
                // Show notification
                showCartNotification(productName);
                
                // Store in localStorage for persistence
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
            });
        });

        function updateCartCount() {
            const cartCount = document.getElementById('cartCount');
            cartCount.textContent = cartItems.length;
            
            if (cartItems.length > 0) {
                cartCount.classList.add('show');
            } else {
                cartCount.classList.remove('show');
            }
        }

        function showCartNotification(productName) {
            const notification = document.getElementById('cartNotification');
            const notificationText = document.getElementById('cartNotificationText');
            
            notificationText.textContent = `${productName} has been added to your cart.`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Newsletter form
        document.getElementById('newsletterForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate newsletter subscription
            alert(`Thank you! We've subscribed ${email} to our newsletter.`);
            this.reset();
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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

        // Lightbox functionality
        document.querySelectorAll('.product-image img').forEach(img => {
            img.addEventListener('click', function() {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightboxImg');
                
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt;
                lightbox.style.display = 'flex';
            });
        });

        document.getElementById('lightboxClose').addEventListener('click', function() {
            document.getElementById('lightbox').style.display = 'none';
        });

        document.getElementById('lightbox').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function() {
            document.querySelectorAll('.selector-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        });

        // Header scroll effect
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.site-header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });

        // Load saved preferences
        window.addEventListener('load', function() {
            const savedRegion = localStorage.getItem('selectedRegion');
            const savedCurrency = localStorage.getItem('selectedCurrency');
            const savedCartItems = localStorage.getItem('cartItems');
            
            if (savedRegion) {
                currentRegion = savedRegion;
                document.getElementById('regionBtn').innerHTML = `<i class="fas fa-globe"></i> ${savedRegion}`;
            }
            
            if (savedCurrency) {
                currentCurrency = savedCurrency;
                document.getElementById('currencyBtn').textContent = savedCurrency;
                updatePrices();
            }
            
            if (savedCartItems) {
                cartItems = JSON.parse(savedCartItems);
                updateCartCount();
            }
        });

        // Enhanced product card interactions
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.advantage-item, .product-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Keyboard accessibility
        document.querySelectorAll('.product-button, .cta-button, .newsletter-button').forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Add ARIA labels for accessibility
        document.getElementById('cartIcon').setAttribute('aria-label', `Shopping cart with ${cartItems.length} items`);
        
        // Update ARIA label when cart changes
        function updateCartAccessibility() {
            document.getElementById('cartIcon').setAttribute('aria-label', `Shopping cart with ${cartItems.length} items`);
        }

        // Call updateCartAccessibility when cart changes
        const originalUpdateCartCount = updateCartCount;
        updateCartCount = function() {
            originalUpdateCartCount();
            updateCartAccessibility();
        };
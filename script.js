document.addEventListener('DOMContentLoaded', function() {
    // --- Глобальное состояние и константы ---
    const state = {
        cartItems: [],
        currentRegion: 'US',
        currentCurrency: 'USD',
    };

    const exchangeRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.35
    };
    
    const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        CAD: '$'
    };

    // --- Элементы DOM ---
    // (без изменений, ваш подход к кэшированию элементов отличный)
    const regionBtn = document.getElementById('regionBtn');
    const currencyBtn = document.getElementById('currencyBtn');
    const regionDropdown = document.getElementById('regionDropdown');
    const currencyDropdown = document.getElementById('currencyDropdown');
    const preloader = document.getElementById('preloader');
    const header = document.querySelector('.site-header');
    const cartCountEl = document.getElementById('cartCount');
    const cartIcon = document.getElementById('cartIcon');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const newsletterForm = document.getElementById('newsletterForm');
    const productGrid = document.querySelector('.product-grid'); // УЛУЧШЕНО: Родительский контейнер для товаров

    // --- Вспомогательные функции ---

    /**
     * Конвертирует цену и форматирует ее с символом валюты.
     * @param {number} originalPrice - Исходная цена в USD.
     * @returns {string} - Отформатированная строка с ценой.
     */
    function formatPrice(originalPrice) {
        const rate = exchangeRates[state.currentCurrency] || 1;
        const symbol = currencySymbols[state.currentCurrency] || '$';
        const convertedPrice = (originalPrice * rate).toFixed(2);
        return `${symbol}${convertedPrice}`;
    }

    /**
     * Обновляет все цены на странице.
     */
    function updateAllPrices() {
        document.querySelectorAll('[data-price]').forEach(el => {
            const originalPrice = parseFloat(el.getAttribute('data-price'));
            el.textContent = formatPrice(originalPrice);
        });
    }

    /**
     * Обновляет счетчик товаров в корзине и ARIA-атрибут.
     */
    function updateCartUI() {
        const itemCount = state.cartItems.length;
        cartCountEl.textContent = itemCount;
        cartIcon.setAttribute('aria-label', `Shopping cart with ${itemCount} items`);
        cartCountEl.classList.toggle('show', itemCount > 0); // УЛУЧШЕНО: Используем toggle с условием
    }
    
    /**
     * Показывает уведомление о добавлении товара в корзину.
     * @param {string} productName - Название добавленного товара.
     */
    function showCartNotification(productName) {
        const notification = document.getElementById('cartNotification');
        const notificationText = document.getElementById('cartNotificationText');
        
        notificationText.textContent = `${productName} has been added to your cart.`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Переключает видимость выпадающих списков.
     * @param {HTMLElement} dropdown - Элемент выпадающего списка.
     */
    function toggleDropdown(dropdown) {
        // УЛУЧШЕНО: Более простой способ переключения
        // Сначала закрываем все выпадающие списки, кроме текущего
        document.querySelectorAll('.selector-dropdown.show').forEach(dd => {
            if (dd !== dropdown) {
                dd.classList.remove('show');
            }
        });
        // Затем переключаем класс для текущего списка
        dropdown.classList.toggle('show');
    }

    /**
     * ИСПРАВЛЕНО: Безопасное обновление текста кнопки региона.
     * @param {string} region - Код региона (например, 'US').
     */
    function updateRegionButton(region) {
        // Очищаем кнопку
        regionBtn.innerHTML = '';
        // Создаем иконку
        const icon = document.createElement('i');
        icon.className = 'fas fa-globe';
        // Создаем текстовый узел
        const text = document.createTextNode(` ${region}`);
        // Добавляем их в кнопку
        regionBtn.appendChild(icon);
        regionBtn.appendChild(text);
    }

    // --- Инициализация и загрузка данных ---

    function initializeApp() {
        if (preloader) {
            setTimeout(() => preloader.classList.add('hidden'), 500);
        }

        const savedRegion = localStorage.getItem('selectedRegion');
        const savedCurrency = localStorage.getItem('selectedCurrency');
        const savedCart = localStorage.getItem('cartItems');

        if (savedRegion) {
            state.currentRegion = savedRegion;
            updateRegionButton(savedRegion); // ИСПРАВЛЕНО: Безопасное обновление
        }

        if (savedCurrency) {
            state.currentCurrency = savedCurrency;
            currencyBtn.textContent = savedCurrency;
        }

        if (savedCart) {
            try {
                // ИСПРАВЛЕНО: Безопасный парсинг JSON из localStorage
                state.cartItems = JSON.parse(savedCart) || [];
            } catch (error) {
                console.error("Error parsing cart items from localStorage:", error);
                state.cartItems = []; // В случае ошибки сбрасываем корзину
            }
        }
        
        updateAllPrices();
        updateCartUI();
        setupScrollAnimations();
    }
    
    // --- Слушатели событий ---

    // Переключение выпадающих списков (без изменений)
    regionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(regionDropdown);
    });

    currencyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(currencyDropdown);
    });

    // УЛУЧШЕНО: Универсальный обработчик для выбора опции в выпадающем списке
    function handleDropdownSelection(e, type) {
        const target = e.target.closest('.dropdown-item');
        if (!target) return;

        if (type === 'region') {
            const region = target.getAttribute('data-region');
            state.currentRegion = region;
            updateRegionButton(region); // ИСПРАВЛЕНО: Безопасное обновление
            localStorage.setItem('selectedRegion', region);
            regionDropdown.classList.remove('show');
        } else if (type === 'currency') {
            const currency = target.getAttribute('data-currency');
            state.currentCurrency = currency;
            currencyBtn.textContent = currency;
            localStorage.setItem('selectedCurrency', currency);
            updateAllPrices();
            currencyDropdown.classList.remove('show');
        }
    }

    regionDropdown.addEventListener('click', (e) => handleDropdownSelection(e, 'region'));
    currencyDropdown.addEventListener('click', (e) => handleDropdownSelection(e, 'currency'));

    document.addEventListener('click', () => {
        document.querySelectorAll('.selector-dropdown.show').forEach(dd => dd.classList.remove('show'));
    });

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // УЛУЧШЕНО: Делегирование событий для добавления в корзину и открытия Lightbox
    if (productGrid) {
        productGrid.addEventListener('click', function(e) {
            // 1. Добавление в корзину
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                const productName = addToCartBtn.getAttribute('data-product-name');
                const price = addToCartBtn.getAttribute('data-price');
                
                state.cartItems.push({ name: productName, price: parseFloat(price) });
                
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                updateCartUI();
                showCartNotification(productName);
                return; // Выходим, чтобы не сработал код для lightbox
            }

            // 2. Открытие Lightbox
            const productImage = e.target.closest('.product-image img');
            if (productImage) {
                lightboxImg.src = productImage.src;
                lightboxImg.alt = productImage.alt;
                lightbox.classList.add('show');
            }
        });
    }

    // Форма подписки (без изменений)
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        alert(`Thank you! We've subscribed ${emailInput.value} to our newsletter.`);
        this.reset();
    });

    // Плавный скролл по якорям (без изменений)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // ИСПРАВЛЕНО: Проверка, что селектор валидный и не просто "#"
            if (targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Lightbox Close (без изменений)
    function closeLightbox() {
        lightbox.classList.remove('show');
    }
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeLightbox();
        }
    });
    
    // --- Анимации ---
    
    // Анимации при прокрутке (ваш код отличный, без изменений)
    function setupScrollAnimations() {
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        if (!('IntersectionObserver' in window)) {
            elementsToAnimate.forEach(el => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elementsToAnimate.forEach(el => observer.observe(el));
    }


    // --- Запуск приложения ---
    initializeApp();
});
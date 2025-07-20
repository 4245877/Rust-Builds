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
     * УЛУЧШЕНО: Использует data-атрибуты для всех цен, включая старые.
     */
    function updateAllPrices() {
        document.querySelectorAll('[data-price]').forEach(el => {
            const originalPrice = parseFloat(el.getAttribute('data-price'));
            el.textContent = formatPrice(originalPrice);
        });
    }

    /**
     * Обновляет счетчик товаров в корзине и ARIA-атрибут.
     * УЛУЧШЕНО: Объединяет обновление UI и доступности.
     */
    function updateCartUI() {
        const itemCount = state.cartItems.length;
        cartCountEl.textContent = itemCount;
        cartIcon.setAttribute('aria-label', `Shopping cart with ${itemCount} items`);

        if (itemCount > 0) {
            cartCountEl.classList.add('show');
        } else {
            cartCountEl.classList.remove('show');
        }
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
        const allDropdowns = document.querySelectorAll('.selector-dropdown');
        const isOpen = dropdown.classList.contains('show');

        // Сначала закрываем все списки
        allDropdowns.forEach(dd => dd.classList.remove('show'));

        // Открываем нужный, если он был закрыт
        if (!isOpen) {
            dropdown.classList.add('show');
        }
    }

    // --- Инициализация и загрузка данных ---

    function initializeApp() {
        // Скрытие прелоадера
        setTimeout(() => {
            if (preloader) preloader.classList.add('hidden');
        }, 500); // Небольшая задержка для плавности

        // Загрузка сохраненных настроек и корзины
        const savedRegion = localStorage.getItem('selectedRegion');
        const savedCurrency = localStorage.getItem('selectedCurrency');
        const savedCart = localStorage.getItem('cartItems');

        if (savedRegion) {
            state.currentRegion = savedRegion;
            regionBtn.innerHTML = `<i class="fas fa-globe"></i> ${savedRegion}`;
        }

        if (savedCurrency) {
            state.currentCurrency = savedCurrency;
            currencyBtn.textContent = savedCurrency;
        }

        if (savedCart) {
            state.cartItems = JSON.parse(savedCart);
        }
        
        // Первоначальное обновление UI
        updateAllPrices();
        updateCartUI();

        // Инициализация анимаций при прокрутке
        setupScrollAnimations();
    }
    
    // --- Слушатели событий ---

    // Переключение выпадающих списков
    regionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(regionDropdown);
    });

    currencyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(currencyDropdown);
    });

    // Выбор региона
    regionDropdown.addEventListener('click', (e) => {
        const target = e.target.closest('.dropdown-item');
        if (target) {
            const region = target.getAttribute('data-region');
            state.currentRegion = region;
            regionBtn.innerHTML = `<i class="fas fa-globe"></i> ${region}`;
            localStorage.setItem('selectedRegion', region);
            regionDropdown.classList.remove('show');
        }
    });

    // Выбор валюты
    currencyDropdown.addEventListener('click', (e) => {
        const target = e.target.closest('.dropdown-item');
        if (target) {
            const currency = target.getAttribute('data-currency');
            state.currentCurrency = currency;
            currencyBtn.textContent = currency;
            localStorage.setItem('selectedCurrency', currency);
            updateAllPrices();
            currencyDropdown.classList.remove('show');
        }
    });

    // Закрытие выпадающих списков при клике вне их
    document.addEventListener('click', () => {
        document.querySelectorAll('.selector-dropdown.show').forEach(dd => dd.classList.remove('show'));
    });

    // Эффект "прилипания" хедера при прокрутке
    // ИСПРАВЛЕНО: Один слушатель события scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const price = this.getAttribute('data-price');
            
            state.cartItems.push({
                name: productName,
                price: parseFloat(price),
            });
            
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            updateCartUI();
            showCartNotification(productName);
        });
    });

    // Форма подписки
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        alert(`Thank you! We've subscribed ${emailInput.value} to our newsletter.`);
        this.reset();
    });

    // Плавный скролл по якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Lightbox (всплывающее изображение)
    document.querySelectorAll('.product-image img').forEach(img => {
        img.addEventListener('click', function() {
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightbox.classList.add('show');
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('show');
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // --- Анимации ---
    
    // ИСПРАВЛЕНО: Для ховер-эффектов используются классы CSS
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.classList.add('hover-effect'));
        card.addEventListener('mouseleave', () => card.classList.remove('hover-effect'));
    });
    /*
      В твоем CSS нужно добавить:
      .product-card.hover-effect {
          transform: translateY(-8px) scale(1.02);
      }
    */
    
    // ИСПРАВЛЕНО: Одна система анимации при прокрутке
    function setupScrollAnimations() {
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        
        if (!('IntersectionObserver' in window)) {
            // Если браузер не поддерживает IntersectionObserver, просто показываем элементы
            elementsToAnimate.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Отключаем наблюдение после анимации
                }
            });
        }, { threshold: 0.1 });

        elementsToAnimate.forEach(el => observer.observe(el));
    }
    /*
      В HTML добавь класс .animate-on-scroll к нужным элементам.
      В CSS добавь:
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
    */

    // --- Запуск приложения ---
    initializeApp();
});
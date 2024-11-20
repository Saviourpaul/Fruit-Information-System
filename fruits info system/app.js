// Data
const categories = [
    { icon: "🍎", name: "Apples" },
    { icon: "🍌", name: "Bananas" },
    { icon: "🍊", name: "Citrus" },
    { icon: "🍇", name: "Berries" },
    { icon: "🥭", name: "Tropical" },
    { icon: "🍐", name: "Others" },
];

const allFruits = [
    {
        id: 1,
        name: "Fresh Apple",
        price: 5.59,
        image: "placeholder.svg",
        discount: 15,
        rating: 5,
        category: "Apples"
    },
    {
        id: 2,
        name: "Organic Banana",
        price: 5.59,
        image: "placeholder.svg",
        discount: 15,
        rating: 5,
        category: "Bananas"
    },
    {
        id: 3,
        name: "Sweet Orange",
        price: 5.59,
        image: "placeholder.svg",
        discount: 15,
        rating: 4,
        category: "Citrus"
    },
    {
        id: 4,
        name: "Mixed Berries",
        price: 5.59,
        image: "placeholder.svg",
        rating: 5,
        category: "Berries"
    },
    {
        id: 5,
        name: "Mango Pack",
        price: 5.59,
        image: "placeholder.svg",
        rating: 5,
        category: "Tropical"
    },
    {
        id: 6,
        name: "Fresh Grapes",
        price: 5.59,
        image: "placeholder.svg",
        rating: 5,
        category: "Others"
    },
];

// State
let balance = 12000;
let cartItems = [];
let favorites = [];
let orders = [];
let selectedCategory = null;

// DOM Elements
const categoriesGrid = document.querySelector('.categories-grid');
const fruitsGrid = document.querySelector('.fruits-grid');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalAmount = document.querySelector('.total-amount');
const checkoutBtn = document.querySelector('.checkout-btn');
const balanceAmount = document.querySelector('.balance-amount');
const topUpBtn = document.querySelector('.top-up-btn');
const transferBtn = document.querySelector('.transfer-btn');
const successModal = document.getElementById('success-modal');
const orderConfirmationModal = document.getElementById('order-confirmation-modal');
const orderDetailsModal = document.getElementById('order-details-modal');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const navLinks = document.querySelectorAll('.nav-links a');
const tabContents = document.querySelectorAll('.tab-content');
const categorySelect = document.getElementById('category-select');
const darkModeToggle = document.getElementById('dark-mode');
const notificationsToggle = document.getElementById('notifications');
const languageSelect = document.getElementById('language');
const saveSettingsBtn = document.querySelector('.save-settings-btn');

// Functions
function initializeApp() {
    renderCategories();
    renderFruits();
    renderCart();
    updateBalance();
    setupEventListeners();
}

function renderCategories() {
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="card category-card" data-category="${category.name}">
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
        </div>
    `).join('');

    categorySelect.innerHTML = `
        <option value="">All</option>
        ${categories.map(category => `
            <option value="${category.name}">${category.name}</option>
        `).join('')}
    `;
}

function renderFruits(fruits = allFruits) {
    fruitsGrid.innerHTML = fruits.map(fruit => `
        <div class="card fruit-card" data-id="${fruit.id}">
            <img src="${fruit.image}" alt="${fruit.name}" class="fruit-image">
            <h3>${fruit.name}</h3>
            <p class="fruit-price">$${fruit.price.toFixed(2)}</p>
            ${fruit.discount ? `<span class="discount-badge">${fruit.discount}% Off</span>` : ''}
            <div class="fruit-rating">
                ${'★'.repeat(fruit.rating)}${'☆'.repeat(5 - fruit.rating)}
            </div>
            <button class="btn add-to-cart-btn">Add to Cart</button>
            <button class="btn favorite-btn">${favorites.some(f => f.id === fruit.id) ? '❤️' : '🤍'}</button>
        </div>
    `).join('');
}

function renderCart() {
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="btn decrease-quantity">-</button>
                <span>${item.quantity}</span>
                <button class="btn increase-quantity">+</button>
            </div>
            <button class="btn remove-from-cart">×</button>
        </div>
    `).join('');

    updateCartTotal();
}

function updateCartTotal() {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalAmount.textContent = `$${total.toFixed(2)}`;
}

function updateBalance() {
    balanceAmount.textContent = `$${balance.toFixed(2)}`;
}

function addToCart(fruit) {
    const existingItem = cartItems.find(item => item.id === fruit.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ ...fruit, quantity: 1 });
    }
    renderCart();
}

function removeFromCart(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    renderCart();
}

function updateCartItemQuantity(id, change) {
    const item = cartItems.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            renderCart();
        }
    }
}

function toggleFavorite(fruit) {
    const index = favorites.findIndex(f => f.id === fruit.id);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(fruit);
    }
    renderFruits();
}

function checkout() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (balance < total) {
        showNotification('Insufficient balance');
        return;
    }

    balance -= total;
    const order = {
        id: `ORD-${Math.random().toString(36).substr(2, 9)}`,
        items: [...cartItems],
        total: total,
        date: new Date().toISOString(),
        status: 'pending'
    };
    orders.push(order);
    cartItems = [];

    updateBalance();
    renderCart();
    showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
        <h3>Order ${order.id}</h3>
        <p>Date: ${new Date(order.date).toLocaleString()}</p>
        <ul>
            ${order.items.map(item => `
                <li>${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
        </ul>
        <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
    `;
    orderConfirmationModal.style.display = 'block';
}

function showNotification(message) {
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;
    successModal.style.display = 'block';
}

function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.target.closest('a').getAttribute('data-tab');
            activateTab(targetTab);
        });
    });

    // Category selection
    categoriesGrid.addEventListener('click', (e) => {
        const categoryCard = e.target.closest('.category-card');
        if (categoryCard) {
            selectedCategory = categoryCard.getAttribute('data-category');
            renderFruits(allFruits.filter(fruit => fruit.category === selectedCategory));
            activateTab('food-order');
        }
    });

    // Fruit interactions
    fruitsGrid.addEventListener('click', (e) => {
        const fruitCard = e.target.closest('.fruit-card');
        if (fruitCard) {
            const fruitId = parseInt(fruitCard.getAttribute('data-id'));
            const fruit = allFruits.find(f => f.id === fruitId);

            if (e.target.classList.contains('add-to-cart-btn')) {
                addToCart(fruit);
            } else if (e.target.classList.contains('favorite-btn')) {
                toggleFavorite(fruit);
            }
        }
    });

    // Cart interactions
    cartItemsContainer.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (cartItem) {
            const itemId = parseInt(cartItem.getAttribute('data-id'));

            if (e.target.classList.contains('decrease-quantity')) {
                updateCartItemQuantity(itemId, -1);
            } else if (e.target.classList.contains('increase-quantity')) {
                updateCartItemQuantity(itemId, 1);
            } else if (e.target.classList.contains('remove-from-cart')) {
                removeFromCart(itemId);
            }
        }
    });

    // Checkout
    checkoutBtn.addEventListener('click', checkout);

    // Balance actions
    topUpBtn.addEventListener('click', () => {
        const amount = parseFloat(prompt('Enter top-up amount:'));
        if (!isNaN(amount) && amount > 0) {
            balance += amount;
            updateBalance();
            showNotification(`$${amount.toFixed(2)} has been added to your balance.`);
        }
    });

    transferBtn.addEventListener('click', () => {
        const amount = parseFloat(prompt('Enter transfer amount:'));
        if (!isNaN(amount) && amount > 0) {
            if (balance >= amount) {
                balance -= amount;
                updateBalance();
                showNotification(`$${amount.toFixed(2)} has been transferred from your balance.`);
            } else {
                showNotification('Insufficient balance');
            }
        }
    });

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            successModal.style.display = 'none';
            orderConfirmationModal.style.display = 'none';
            orderDetailsModal.style.display = 'none';
        });
    });

    // Settings
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });

    notificationsToggle.addEventListener('change', () => {
        // Implement notification settings logic here
    });

    languageSelect.addEventListener('change', () => {
        // Implement language change logic here
    });

    saveSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Settings saved successfully');
    });

    // Category filter in Food Order tab
    categorySelect.addEventListener('change', () => {
        selectedCategory = categorySelect.value;
        renderFruits(selectedCategory ? allFruits.filter(fruit => fruit.category === selectedCategory) : allFruits);
    });
}

function activateTab(tabId) {
    navLinks.forEach(link => link.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Initialize the app
initializeApp();
// Sample data
const fruits = [
    { id: 1, name: "Fresh Apple", price: 5.59, image: "/placeholder.svg?height=200&width=200", rating: 5, category: "Apples" },
    { id: 2, name: "Organic Banana", price: 5.59, image: "/placeholder.svg?height=200&width=200", rating: 5, category: "Bananas" },
    { id: 3, name: "Sweet Orange", price: 5.59, image: "/placeholder.svg?height=200&width=200", rating: 4, category: "Citrus" },
    { id: 4, name: "Mixed Berries", price: 5.59, image: "/placeholder.svg?height=100&width=100", rating: 5, category: "Berries" },
    { id: 5, name: "Mango Pack", price: 5.59, image: "/placeholder.svg?height=100&width=100", rating: 5, category: "Tropical" },
    { id: 6, name: "Fresh Grapes", price: 5.59, image: "/placeholder.svg?height=100&width=100", rating: 5, category: "Others" },
];

const categories = [
    { icon: "🍎", name: "Apples" },
    { icon: "🍌", name: "Bananas" },
    { icon: "🍊", name: "Citrus" },
    { icon: "🍇", name: "Berries" },
    { icon: "🥭", name: "Tropical" },
    { icon: "🍐", name: "Others" },
];

// State
let balance = 12000;
let cartItems = [];
let activeTab = "dashboard";
let selectedCategory = null;

// DOM Elements
const tabContent = document.getElementById('tabContent');
const searchInput = document.getElementById('searchInput');
const balanceAmount = document.getElementById('balanceAmount');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalClose = document.getElementById('modalClose');
const sidebar = document.getElementById('sidebar');
const openSidebarButton = document.getElementById('openSidebar');
const closeSidebarButton = document.getElementById('closeSidebar');

// Event Listeners

searchInput.addEventListener('input', renderFruits);
checkoutButton.addEventListener('click', handleCheckout);
modalClose.addEventListener('click', () => modal.style.display = 'none');
openSidebarButton.addEventListener('click', () => sidebar.classList.add('open'));
closeSidebarButton.addEventListener('click', () => sidebar.classList.remove('open'));

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveTab(e.target.dataset.tab);
    });
});

// Functions
function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    renderTabContent();
}

function renderTabContent() {
    switch (activeTab) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'foodOrder':
            renderFoodOrder();
            break;
        case 'message':
            renderMessage();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}

function renderDashboard() {
    tabContent.innerHTML = `
        <h2>Dashboard</h2>
        <div class="categories">
            ${categories.map(category => `
                <div class="category" onclick="setSelectedCategory('${category.name}')">
                    <span>${category.icon}</span>
                    <span>${category.name}</span>
                </div>
            `).join('')}
        </div>
        <h3>Popular Fruits</h3>
        <div class="fruits">
            ${renderFruitCards(fruits.slice(0, 3))}
        </div>
    `;
}

function renderFoodOrder() {
    tabContent.innerHTML = `
        <h2>Food Order</h2>
        <select onchange="setSelectedCategory(this.value)">
            <option value="">All Categories</option>
            ${categories.map(category => `
                <option value="${category.name}">${category.name}</option>
            `).join('')}
        </select>
        <div class="fruits">
            ${renderFruitCards(getFilteredFruits())}
        </div>
    `;
}

function renderMessage() {
    tabContent.innerHTML = `
        <h2>Messages</h2>
        <div id="messageContainer"></div>
        <textarea id="messageInput" placeholder="Type your message..."></textarea>
        <button onclick="sendMessage()">Send</button>
    `;
}

function renderSettings() {
    tabContent.innerHTML = `
        <h2>Settings</h2>
        <form>
            <label for="name">Name</label>
            <input type="text" id="name" placeholder="Your Name">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="your.email@example.com">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="••••••••">
            <button type="button" onclick="saveSettings()">Save Changes</button>
        </form>
    `;
}

function renderFruitCards(fruits) {
    return fruits.map(fruit => `
        <div class="fruit-card">
            <img src="${fruit.image}" alt="${fruit.name}">
            <h3>${fruit.name}</h3>
            <div class="rating">${'★'.repeat(fruit.rating)}${'☆'.repeat(5 - fruit.rating)}</div>
            <p>$${fruit.price}</p>
            <button onclick="addToCart(${fruit.id})">Add to Cart</button>
        </div>
    `).join('');
}

function getFilteredFruits() {
    return fruits.filter(fruit => 
        fruit.name.toLowerCase().includes(searchInput.value.toLowerCase()) &&
        (!selectedCategory || fruit.category === selectedCategory)
    );
}

function setSelectedCategory(category) {
    selectedCategory = category;
    renderFruits();
}

function renderFruits() {
    const fruitContainer = document.querySelector('.fruits');
    if (fruitContainer) {
        fruitContainer.innerHTML = renderFruitCards(getFilteredFruits());
    }
}

function addToCart(fruitId) {
    const fruit = fruits.find(f => f.id === fruitId);
    if (fruit) {
        cartItems.push(fruit);
        updateCart();
    }
}

function updateCart() {
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <span>${item.name}</span>
            <span>$${item.price}</span>
        </div>
    `).join('');

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    checkoutButton.style.display = cartItems.length > 0 ? 'block' : 'none';
}

function handleCheckout() {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    if (balance >= total) {
        balance -= total;
        balanceAmount.textContent = `$${balance.toFixed(2)}`;
        cartItems = [];
        updateCart();
        showModal('Checkout Successful', `Total: $${total.toFixed(2)}`);
    } else {
        showModal('Checkout Failed', 'Insufficient balance');
    }
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageContainer = document.getElementById('messageContainer');
    if (messageInput.value.trim()) {
        messageContainer.innerHTML += `<p><strong>You:</strong> ${messageInput.value}</p>`;
        messageInput.value = '';
        // Simulate AI response
        setTimeout(() => {
            messageContainer.innerHTML += `<p><strong>AI:</strong> Thank you for your message. How can I assist you today?</p>`;
        }, 1000);
    }
}

function saveSettings() {
    showModal('Settings Saved', 'Your changes have been saved successfully.');
}

// Initial render
setActiveTab('dashboard');
updateCart();
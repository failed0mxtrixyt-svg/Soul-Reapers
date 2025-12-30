// Mobile Navigation Toggle - Browser Compatible
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link - Browser Compatible
const navLinks = document.querySelectorAll('.nav-link');
for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function() {
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Navbar scroll effect - Browser Compatible
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.pageYOffset > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            navbar.style.height = '70px';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.height = '80px';
        }
    }
});

// Smooth scrolling for navigation links - Browser Compatible
const anchorLinks = document.querySelectorAll('a[href^="#"]');
for (let i = 0; i < anchorLinks.length; i++) {
    anchorLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.player-card, .achievement-card, .product-card, .stat');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroVideo = document.querySelector('.hero-video');
    
    if (heroContent && heroVideo) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroVideo.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add to cart functionality
let cart = [];
let cartCount = 0;

document.querySelectorAll('.btn-primary').forEach(button => {
    if (button.textContent === 'Add to Cart') {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // Add to cart
            cart.push({
                name: productName,
                price: productPrice
            });
            
            cartCount++;
            
            // Update button state
            this.textContent = 'Added!';
            this.style.background = '#4CAF50';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.background = '';
            }, 2000);
            
            // Show notification
            showNotification(`${productName} added to cart!`);
        });
    }
});

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #dc2626, #ef4444);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
        }
    }
    
    updateCounter();
}

// Initialize counter animations when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const statValue = entry.target.querySelector('h3');
            const text = statValue.textContent;
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            
            if (!isNaN(number)) {
                animateCounter(statValue, number);
                entry.target.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

// Observe all stat elements
document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Add hover sound effect (optional - requires audio files)
function playHoverSound() {
    // You can add hover sound effects here if you have audio files
    // const audio = new Audio('hover.mp3');
    // audio.volume = 0.3;
    // audio.play();
}

// Add hover effects to interactive elements
document.querySelectorAll('.btn, .nav-link, .player-card, .product-card').forEach(element => {
    element.addEventListener('mouseenter', playHoverSound);
});

// Loading screen
window.addEventListener('load', () => {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    const loaderContent = document.createElement('div');
    loaderContent.innerHTML = `
        <div style="text-align: center;">
            <h1 style="font-family: 'Oswald', sans-serif; font-size: 3rem; background: linear-gradient(45deg, #dc2626, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px;">SOUL REAPERS ESPORTS</h1>
            <div style="width: 60px; height: 4px; background: linear-gradient(45deg, #dc2626, #ef4444); margin: 0 auto; animation: pulse 1s infinite;"></div>
        </div>
    `;
    
    loader.appendChild(loaderContent);
    document.body.appendChild(loader);
    
    // Add pulse animation
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(pulseStyle);
    
    // Remove loader after page is fully loaded
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 500);
    }, 1500);
});

// Add particle effect to hero section (optional enhancement)
function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        pointer-events: none;
        opacity: 0;
        z-index: 1;
    `;
    
    const size = Math.random() * 5 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = '#dc2626';
    particle.style.borderRadius = '50%';
    
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    document.body.appendChild(particle);
    
    const duration = Math.random() * 3000 + 2000;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = startY - Math.random() * 200;
    
    particle.animate([
        { 
            opacity: 0,
            transform: `translate(0, 0) scale(0)`
        },
        {
            opacity: 1,
            transform: `translate(0, 0) scale(1)`
        },
        {
            opacity: 0,
            transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0)`
        }
    ], {
        duration: duration,
        easing: 'ease-out'
    }).onfinish = () => {
        document.body.removeChild(particle);
    };
}

// Create particles periodically
setInterval(createParticle, 300);

// Authentication System
let currentUser = null;

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Simple validation (in real app, this would connect to backend)
    if (email && password) {
        currentUser = { email: email };
        
        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('soulReapersUser', JSON.stringify(currentUser));
        }
        
        // Load user's cart and update UI
        loadCartFromStorage();
        updateAuthUI();
        closeModal('loginModal');
        showNotification('Welcome back to Soul Reapers!');
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('rememberMe').checked = false;
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (username && email && password) {
        currentUser = { username: username, email: email };
        
        // Load user's cart and update UI
        loadCartFromStorage();
        updateAuthUI();
        closeModal('registerModal');
        showNotification(`Welcome to Soul Reapers, ${username}!`);
        
        // Clear form
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="user-welcome">Welcome, ${currentUser.username || currentUser.email}</span>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showLoginModal()">Login</button>
            <button class="btn btn-primary" onclick="showRegisterModal()">Register</button>
        `;
    }
}

function logout() {
    // Save current user's cart before logging out
    saveCartToStorage();
    
    currentUser = null;
    localStorage.removeItem('soulReapersUser');
    
    // Load guest cart and update UI
    loadCartFromStorage();
    updateAuthUI();
    showNotification('You have been logged out');
}

// Check for saved user session on page load
function checkSavedSession() {
    const savedUser = localStorage.getItem('soulReapersUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            loadCartFromStorage(); // Load user's cart
            updateAuthUI();
            showNotification('Welcome back to Soul Reapers!');
        } catch (e) {
            console.error('Error parsing saved user data:', e);
            localStorage.removeItem('soulReapersUser');
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Initialize auth UI and check for saved session
document.addEventListener('DOMContentLoaded', function() {
    checkSavedSession();
    loadCartFromStorage();
    updateAuthUI();
});

// Shopping Cart Functionality
let shoppingCart = [];
let cartOpen = false;

// Load cart from localStorage on page load
function loadCartFromStorage() {
    const cartKey = getCurrentUserCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
        try {
            shoppingCart = JSON.parse(savedCart);
            updateCartUI();
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            shoppingCart = [];
        }
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    const cartKey = getCurrentUserCartKey();
    localStorage.setItem(cartKey, JSON.stringify(shoppingCart));
}

// Get user-specific cart key
function getCurrentUserCartKey() {
    if (currentUser && currentUser.email) {
        return `soulReapersCart_${currentUser.email}`;
    }
    return 'soulReapersCart_guest';
}

function addToCart(name, price, image, url) {
    const existingItem = shoppingCart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            name: name,
            price: price,
            image: image,
            url: url,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${name} added to cart!`);
}

function removeFromCart(name) {
    shoppingCart = shoppingCart.filter(item => item.name !== name);
    saveCartToStorage();
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = shoppingCart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartDropdown = document.getElementById('cartDropdown');
    
    // Update cart count
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart dropdown
    if (shoppingCart.length === 0) {
        cartDropdown.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    } else {
        let cartHTML = '';
        let total = 0;
        
        shoppingCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="cart-quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="cart-quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
            `;
        });
        
        cartHTML += `
            <div class="cart-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div class="cart-checkout-options">
                ${shoppingCart.map(item => `
                    <button class="cart-item-checkout" onclick="checkoutItem('${item.name}', '${item.url}')">
                        Checkout ${item.name}
                    </button>
                `).join('')}
                <button class="cart-checkout-btn" onclick="checkoutAll()">Checkout All Items</button>
            </div>
        `;
        
        cartDropdown.innerHTML = cartHTML;
    }
}

function checkoutItem(name, url) {
    window.open(url, '_blank');
    showNotification(`Opening checkout for ${name}...`);
}

function checkoutAll() {
    if (shoppingCart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Open all product URLs in new tabs
    shoppingCart.forEach(item => {
        if (item.url) {
            window.open(item.url, '_blank');
        }
    });
    
    showNotification('Opening all checkouts...');
}

function toggleCart(event) {
    event.preventDefault();
    const cartDropdown = document.getElementById('cartDropdown');
    cartOpen = !cartOpen;
    
    if (cartOpen) {
        cartDropdown.classList.add('active');
    } else {
        cartDropdown.classList.remove('active');
    }
}

function checkout() {
    if (shoppingCart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Build Exclaim.gg URL with cart items
    const baseUrl = 'https://exclaim.gg/builder/?saved=gm5hzn7h';
    
    // Open checkout in new tab
    window.open(baseUrl, '_blank');
    
    showNotification('Redirecting to checkout...');
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    const cartDropdown = document.getElementById('cartDropdown');
    const navCart = document.querySelector('.nav-cart');
    
    if (!navCart.contains(event.target) && !cartDropdown.contains(event.target)) {
        cartDropdown.classList.remove('active');
        cartOpen = false;
    }
});

// Initialize cart UI
updateCartUI();

// R6 Stats API Integration with Backup System
class R6StatsAPI {
    constructor() {
        this.primaryURL = 'https://r6.tracker.network';
        this.backupURL = 'https://stats.cc/siege';
        this.cache = new Map();
        this.cacheTimeout = 0; // No cache - instant refresh
        this.useBackup = false;
    }

    // Fetch player general stats with backup system
    async getPlayerStats(platform, playerName) {
        const cacheKey = `${platform}-${playerName}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        // Try primary source first
        let stats = await this.fetchFromPrimary(platform, playerName);
        
        // If primary fails, try backup
        if (!stats) {
            console.log(`Primary source failed for ${playerName}, trying backup...`);
            stats = await this.fetchFromBackup(platform, playerName);
            this.useBackup = true;
        } else {
            this.useBackup = false;
        }
        
        if (stats) {
            // Cache the results
            this.cache.set(cacheKey, {
                data: stats,
                timestamp: Date.now()
            });
        }

        return stats;
    }

    // Fetch from primary source (R6 Tracker Network)
    async fetchFromPrimary(platform, playerName) {
        try {
            const proxyURL = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(`${proxyURL}https://r6.tracker.network/profile/${platform}/${encodeURIComponent(playerName)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            return this.parseStatsFromHTML(html);
        } catch (error) {
            console.error('Primary source error:', error);
            return null;
        }
    }

    // Fetch from backup source (stats.cc/siege)
    async fetchFromBackup(platform, playerName) {
        try {
            const proxyURL = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(`${proxyURL}https://stats.cc/siege/player/${encodeURIComponent(playerName)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            return this.parseBackupStatsFromHTML(html);
        } catch (error) {
            console.error('Backup source error:', error);
            return null;
        }
    }

    // Parse stats from HTML (since we're scraping the website)
    parseStatsFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const stats = {
            kd: '0.0',
            winRate: '0%',
            headshot: '0%',
            matches: '0',
            level: '0',
            kills: '0',
            deaths: '0',
            wins: '0',
            losses: '0'
        };

        try {
            // Extract KD ratio
            const kdElement = doc.querySelector('[data-stat="kd"]');
            if (kdElement) stats.kd = kdElement.textContent.trim();

            // Extract win rate
            const winRateElement = doc.querySelector('[data-stat="win_"]');
            if (winRateElement) stats.winRate = winRateElement.textContent.trim();

            // Extract headshot percentage
            const headshotElement = doc.querySelector('[data-stat="headshot_"]');
            if (headshotElement) stats.headshot = headshotElement.textContent.trim();

            // Extract matches played
            const matchesElement = doc.querySelector('[data-stat="matches_played"]');
            if (matchesElement) stats.matches = matchesElement.textContent.trim();

            // Extract level
            const levelElement = doc.querySelector('[data-stat="level"]');
            if (levelElement) stats.level = levelElement.textContent.trim();

            // Extract kills
            const killsElement = doc.querySelector('[data-stat="kills"]');
            if (killsElement) stats.kills = killsElement.textContent.trim();

            // Extract deaths
            const deathsElement = doc.querySelector('[data-stat="deaths"]');
            if (deathsElement) stats.deaths = deathsElement.textContent.trim();

            // Extract wins
            const winsElement = doc.querySelector('[data-stat="wins"]');
            if (winsElement) stats.wins = winsElement.textContent.trim();

            // Extract losses
            const lossesElement = doc.querySelector('[data-stat="losses"]');
            if (lossesElement) stats.losses = lossesElement.textContent.trim();

        } catch (error) {
            console.error('Error parsing stats:', error);
        }

        return stats;
    }

    // Parse stats from backup source (stats.cc/siege)
    parseBackupStatsFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const stats = {
            kd: '0.0',
            winRate: '0%',
            headshot: '0%',
            matches: '0',
            level: '0',
            kills: '0',
            deaths: '0',
            wins: '0',
            losses: '0',
            source: 'backup' // Mark as backup source
        };

        try {
            // Look for common stat patterns in stats.cc/siege
            // This is a generic parser that looks for common stat displays
            
            // Try to find KD ratio
            const kdSelectors = [
                '[data-stat="kd"]',
                '.stat-kd',
                '.kd',
                'span:contains("K/D")',
                'div:contains("K/D")'
            ];
            
            for (const selector of kdSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    stats.kd = element.textContent.trim();
                    break;
                }
            }
            
            // Try to find win rate
            const winRateSelectors = [
                '[data-stat="win_"]',
                '.stat-winrate',
                '.win-rate',
                'span:contains("Win")',
                'div:contains("Win")'
            ];
            
            for (const selector of winRateSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    stats.winRate = element.textContent.trim();
                    break;
                }
            }
            
            // Try to find headshot percentage
            const headshotSelectors = [
                '[data-stat="headshot_"]',
                '.stat-headshot',
                '.headshot',
                'span:contains("Headshot")',
                'div:contains("Headshot")'
            ];
            
            for (const selector of headshotSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    stats.headshot = element.textContent.trim();
                    break;
                }
            }
            
            // Try to find matches
            const matchesSelectors = [
                '[data-stat="matches_played"]',
                '.stat-matches',
                '.matches',
                'span:contains("Matches")',
                'div:contains("Matches")'
            ];
            
            for (const selector of matchesSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    stats.matches = element.textContent.trim();
                    break;
                }
            }
            
            // If no specific elements found, try to extract from text content
            if (stats.kd === '0.0' || stats.winRate === '0%') {
                const textContent = doc.body.textContent || '';
                
                // Look for patterns like "K/D: 1.23" or "Win Rate: 54%"
                const kdMatch = textContent.match(/K\/D\s*[:\-]?\s*([\d.]+)/i);
                if (kdMatch) stats.kd = kdMatch[1];
                
                const winMatch = textContent.match(/Win\s*Rate\s*[:\-]?\s*([\d.]+%?)/i);
                if (winMatch) stats.winRate = winMatch[1].includes('%') ? winMatch[1] : winMatch[1] + '%';
                
                const headshotMatch = textContent.match(/Headshot\s*[:\-]?\s*([\d.]+%?)/i);
                if (headshotMatch) stats.headshot = headshotMatch[1].includes('%') ? headshotMatch[1] : headshotMatch[1] + '%';
                
                const matchesMatch = textContent.match(/Matches?\s*[:\-]?\s*([\d,]+)/i);
                if (matchesMatch) stats.matches = matchesMatch[1];
            }
            
        } catch (error) {
            console.error('Error parsing backup stats:', error);
        }

        return stats;
    }

    // Update player bio with live stats
    async updatePlayerStats(playerName, platform = 'pc') {
        const stats = await this.getPlayerStats(platform, playerName);
        
        if (stats && playerBios[playerName]) {
            // Update the player bio data
            playerBios[playerName].kd = stats.kd;
            playerBios[playerName].winRate = stats.winRate;
            playerBios[playerName].headshot = stats.headshot;
            
            // If modal is currently open for this player, update it
            const modal = document.getElementById('playerBioModal');
            if (modal.classList.contains('active') && 
                document.getElementById('playerBioName').textContent === playerName) {
                this.updateModalDisplay(playerBios[playerName]);
            }
            
            return true;
        }
        
        return false;
    }

    // Update modal display with new stats
    updateModalDisplay(player) {
        const isAcademy = academyPlayers.includes(player.name);
        document.getElementById('playerBioKD').textContent = player.kd;
        document.getElementById('playerBioWR').textContent = player.winRate;
        document.getElementById('playerBioHS').textContent = player.headshot || '0%';
        document.getElementById('playerBioRole').textContent = player.role + (isAcademy ? ' (Academy)' : '');
        
        // Show backup indicator if using backup source
        if (player.source === 'backup') {
            const kdElement = document.getElementById('playerBioKD');
            kdElement.style.color = '#f59e0b'; // Orange color for backup data
            kdElement.title = 'Using backup stats source';
        } else {
            const kdElement = document.getElementById('playerBioKD');
            kdElement.style.color = '#dc2626'; // Normal red color
            kdElement.title = '';
        }
    }

    // Batch update all player stats
    async updateAllPlayerStats() {
        const playerMappings = {
            // Main Roster
            'SquilIz': 'SquilIz',
            'ColdeQx.': 'ColdeQx.',
            'Inno': 'Inno',
            'Fiina.': 'Fiina.',
            'PhartyMarty': 'PhartyMarty',
            'Vclxqz7.SR': 'ThgiS',
            
            // Academy Roster
            'Neb343': 'Neb343',
            'Oisthebest91': 'Oisthebest91',
            'Ooglif': 'Ooglif',
            'PuffyTube': 'PuffyTube',
            'Ducky': 'Ducky',
            'ggmoney_74': 'ggmoney_74',
            'tt.selfmiserey': 'tt.selfmiserey'
        };

        const updatePromises = Object.entries(playerMappings).map(async ([displayName, trackerName]) => {
            try {
                await this.updatePlayerStats(displayName, 'pc');
                console.log(`Updated stats for ${displayName}`);
            } catch (error) {
                console.error(`Failed to update stats for ${displayName}:`, error);
            }
        });

        await Promise.all(updatePromises);
        console.log('All player stats updated');
    }

    // Update only academy roster stats
    async updateAcademyStats() {
        const academyMappings = {
            'Neb343': 'Neb343',
            'Oisthebest91': 'Oisthebest91',
            'Ooglif': 'Ooglif',
            'PuffyTube': 'PuffyTube',
            'Ducky': 'Ducky',
            'ggmoney_74': 'ggmoney_74',
            'tt.selfmiserey': 'tt.selfmiserey'
        };

        const updatePromises = Object.entries(academyMappings).map(async ([displayName, trackerName]) => {
            try {
                await this.updatePlayerStats(displayName, 'pc');
                console.log(`Updated academy stats for ${displayName}`);
            } catch (error) {
                console.error(`Failed to update academy stats for ${displayName}:`, error);
            }
        });

        await Promise.all(updatePromises);
        console.log('Academy roster stats updated');
    }

    // Update only main roster stats
    async updateMainRosterStats() {
        const mainMappings = {
            'SquilIz': 'SquilIz',
            'ColdeQx.': 'ColdeQx.',
            'Inno': 'Inno',
            'Fiina.': 'Fiina.',
            'PhartyMarty': 'PhartyMarty',
            'Vclxqz7.SR': 'ThgiS'
        };

        const updatePromises = Object.entries(mainMappings).map(async ([displayName, trackerName]) => {
            try {
                await this.updatePlayerStats(displayName, 'pc');
                console.log(`Updated main roster stats for ${displayName}`);
            } catch (error) {
                console.error(`Failed to update main roster stats for ${displayName}:`, error);
            }
        });

        await Promise.all(updatePromises);
        console.log('Main roster stats updated');
    }
}

// Initialize the API
const r6API = new R6StatsAPI();

// Academy roster players list
const academyPlayers = ['Neb343', 'Oisthebest91', 'Ooglif', 'PuffyTube', 'Ducky', 'ggmoney_74', 'tt.selfmiserey'];

// Auto-update stats every 5 minutes
setInterval(() => {
    r6API.updateAllPlayerStats();
}, 300000);

// Update academy roster stats every 5 minutes
setInterval(() => {
    r6API.updateAcademyStats();
}, 300000);

// Update main roster stats every 5 minutes
setInterval(() => {
    r6API.updateMainRosterStats();
}, 300000);

// Update stats when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        r6API.updateAllPlayerStats();
    }, 2000); // Wait 2 seconds after page load
});

// Player Bio Data - Easily Customizable
const playerBios = {
    'SquilIz': {
        name: 'SquilIz',
        role: 'IGL/Support',
        kd: '1.12',
        winRate: '51.3%',
        headshot: '38.2%',
        matches: '5,247',
        image: 'logos/FrisbeeHeadband_Face.png',
        description: 'The strategic mastermind behind Soul Reapers Esports. SquilIz has been leading the team since its founding in 2024, known for exceptional game sense and clutch decision-making under pressure.',
        achievements: [
            'Inaugural League Champions 2025',
            'Best IGL Award - Season 1',
            '100+ Matches Captained',
            'Highest Support K/D in League'
        ],
        social: {
            twitter: 'https://twitter.com/squiliz',
            twitch: 'https://twitch.tv/squiliz',
            youtube: 'https://youtube.com/squiliz',
            tiktok: 'https://tiktok.com/@squiliz'
        }
    },
    'ColdeQx.': {
        name: 'ColdeQx.',
        role: 'Support',
        kd: '1.15',
        winRate: '50.2%',
        headshot: '36.8%',
        matches: '3,389',
        image: 'logos/IMG_1108.png',
        description: 'A versatile support player with exceptional crosshair placement and game awareness. ColdeQx. is known for his consistent performance and ability to secure crucial rounds.',
        achievements: [
            'Inaugural League Champions 2025',
            'Most Consistent Player Award',
            '50+ Clutch Plays',
            'Top 5 Support Players'
        ],
        social: {
            twitter: 'https://twitter.com/coldeqx',
            twitch: 'https://twitch.tv/coldeqx',
            youtube: 'https://youtube.com/coldeqx',
            tiktok: 'https://tiktok.com/@coldeqx'
        }
    },
    'Inno': {
        name: 'Inno',
        role: 'Entry Fragger',
        kd: '1.58',
        winRate: '53.1%',
        headshot: '42.5%',
        matches: '1,423',
        image: 'logos/694f4cab78d0aed08b6cc852.png',
        description: 'The aggressive entry fragger who opens up sites for the team. Inno is known for his fearless playstyle and ability to secure first picks in crucial situations.',
        achievements: [
            'Inaugural League Champions 2025',
            'Highest K/D Ratio Season 1',
            'Entry Fragging Master',
            '100+ Opening Kills'
        ],
        social: {
            twitter: 'https://twitter.com/inno',
            twitch: 'https://twitch.tv/inno',
            youtube: 'https://youtube.com/inno',
            tiktok: 'https://tiktok.com/@inno'
        }
    },
    'Fiina.': {
        name: 'Fiina.',
        role: 'Entry/Soft Support',
        kd: '1.31',
        winRate: '51.2%',
        headshot: '38.9%',
        matches: '756',
        image: 'logos/126b11847c35e423e5ec7fbb2e4be985.png',
        description: 'A flexible player who excels at both entry and support roles. Fiina. brings versatility to the team composition and adapts to different strategies seamlessly.',
        achievements: [
            'Inaugural League Champions 2025',
            'Most Versatile Player',
            'Clutch Specialist',
            'Team MVP Quarter Finals'
        ],
        social: {
            twitter: 'https://twitter.com/fiina',
            twitch: 'https://twitch.tv/fiina',
            youtube: 'https://youtube.com/fiina',
            tiktok: 'https://tiktok.com/@fiina'
        }
    },
    'PhartyMarty': {
        name: 'PhartyMarty',
        role: 'Entry',
        kd: '1.43',
        winRate: '49.7%',
        headshot: '43.2%',
        matches: '2,967',
        image: 'logos/IMG_4428.webp',
        description: 'The team\'s primary Entry with incredible accuracy and game-changing potential. ThunderBolt can single-handedly win rounds with his exceptional sniping skills.',
        achievements: [
            'Best Entry Player in League',
            'Highest K/D Overall',
        ],
        social: {
            twitter: 'https://twitter.com/thunderbolt',
            twitch: 'https://twitch.tv/thunderbolt',
            youtube: 'https://youtube.com/thunderbolt',
            tiktok: 'https://tiktok.com/@phartymarty'
        }
    },
    'Vclxqz7': {
        name: 'Vclxqz7',
        role: 'First Entry/support',
        kd: '1.13',
        winRate: '53.2%',
        headshot: '58.9%',
        matches: '812',
        image: 'logos/69482ae04429ee02c3febe37.png',
        description: 'A reliable first entry player who creates space for the team. Vclxqz7 is known for his consistent performance and ability to adapt to different playstyles.',
        achievements: [
            'Inaugural League Champions 2025',
            'Most Improved Player',
            'Entry Specialist',
            'Team Player Award'
        ],
        social: {
            twitter: 'https://twitter.com/vclxqz7',
            youtube: 'https://youtube.com/vclxqz7',
            tiktok: 'https://tiktok.com/@vclxqz7'
        }
    },
    'Neb343': {
        name: 'Neb343',
        role: 'Entry frag',
        kd: '1.14',
        winRate: '50.1%',
        headshot: '29.8%',
        matches: '189',
        image: 'logos/player1.png',
        description: 'Academy team\'s aggressive entry fragger. Neb343 shows great potential and is developing into a future main roster player.',
        achievements: [
            'Academy League MVP',
            'Rising Star Award',
            'Most Aggressive Player',
            'Academy Champions 2025'
        ],
        social: {
            twitter: 'https://twitter.com/neb343',
            twitch: 'https://twitch.tv/neb343',
            youtube: 'https://youtube.com/neb343',
            tiktok: 'https://tiktok.com/@neb343'
        }
    },
    'Oisthebest91': {
        name: 'Oisthebest91',
        role: 'IGL',
        kd: '0.93',
        winRate: '43.8%',
        headshot: '32.5%',
        matches: '201',
        image: 'logos/player2.png',
        description: 'Academy team\'s in-game leader. Oisthebest91 focuses on developing strategies and mentoring younger players.',
        achievements: [
            'Academy League Finalist',
            'Best IGL Academy',
            'Mentorship Award',
            'Tactical Genius'
        ],
        social: {
            twitter: 'https://twitter.com/oisthebest91',
            twitch: 'https://twitch.tv/oisthebest91',
            youtube: 'https://youtube.com/oisthebest91',
            tiktok: 'https://tiktok.com/@oisthebest91'
        }
    },
    'Ooglif': {
        name: 'Ooglif',
        role: 'Flex',
        kd: '1.16',
        winRate: '47.9%',
        headshot: '37.2%',
        matches: '224',
        image: 'logos/IMG_5350.jpg',
        description: 'A flexible academy player who can fill multiple roles. Ooglif is known for adaptability and solid mechanical skills.',
        achievements: [
            'Academy League Finalist',
            'Most Flexible Player',
            'Mechanical Skills Award',
            'Team Player Academy'
        ],
        social: {
            twitter: 'https://twitter.com/ooglif',
            twitch: 'https://twitch.tv/ooglif',
            youtube: 'https://youtube.com/ooglif',
            tiktok: 'https://tiktok.com/@ooglif'
        }
    },
    'PuffyTube': {
        name: 'PuffyTube',
        role: 'Soft Support',
        kd: '1.06',
        winRate: '43.5%',
        headshot: '30.1%',
        matches: '167',
        image: 'logos/crackhead.jpg',
        description: 'Academy team\'s soft support player. PuffyTube excels at gathering information and supporting the team.',
        achievements: [
            'Academy League Finalist',
            'Best Support Academy',
            'Information Gathering',
            'Support Specialist'
        ],
        social: {
            twitter: 'https://twitter.com/puffytube',
            twitch: 'https://twitch.tv/puffytube',
            youtube: 'https://youtube.com/puffytube',
            tiktok: 'https://tiktok.com/@puffytube'
        }
    },
    'Ducky': {
        name: 'Ducky',
        role: 'Hard Support',
        kd: '0.95',
        winRate: '45.7%',
        headshot: '28.3%',
        matches: '189',
        image: 'logos/FA079097-ABA3-495C-937B-06164C144616.jpg',
        description: 'Academy team\'s hard support player. Ducky provides essential utility and support for the team\'s strategies.',
        achievements: [
            'Academy League Finalist',
            'Utility Master',
            'Support Excellence',
            'Team Foundation'
        ],
        social: {
            twitter: 'https://twitter.com/ducky',
            twitch: 'https://twitch.tv/ducky',
            youtube: 'https://youtube.com/ducky',
            tiktok: 'https://tiktok.com/@ducky'
        }
    },
    'ggmoney_74': {
        name: 'ggmoney_74',
        role: 'soft support',
        kd: '0.82',
        winRate: '49.5%',
        headshot: '26.8%',
        matches: '156',
        image: 'logos/meme-mem.png',
        description: 'Academy team\'s soft support player. ggmoney_74 focuses on team coordination and support roles.',
        achievements: [
            'Academy League Finalist',
            'Team Coordination',
            'Support Development',
            'Rising Talent'
        ],
        social: {
            twitter: 'https://twitter.com/ggmoney_74',
            twitch: 'https://twitch.tv/ggmoney_74',
            youtube: 'https://youtube.com/ggmoney_74',
            tiktok: 'https://tiktok.com/@ggmoney_74'
        }
    },
    'tt.selfmiserey': {
        name: 'tt.selfmiserey',
        role: 'soft support',
        kd: '1.34',
        winRate: '54.9%',
        headshot: '40.2%',
        matches: '213',
        image: 'logos/IMG_5104.png',
        description: 'selfmiserey is a Tier 3 professional Rainbow Six Siege player specializing in the flex/support role, known for his intelligent positioning, utility efficiency, and clutch awareness. At just 15 years old, he competes confidently against seasoned players, earning recognition as one of the scene’s most promising young prodigies.',
        achievements: [
            'Academy League Finalist',
            'Best K/D Academy',
            'Promotion Candidate',
            'Future Star'
        ],
        social: {
            twitter: 'https://x.com/selfmiserey', 
            tiktok: 'https://tiktok.com/@selfmiserey'
        }
    }
};

// Player Bio Functions
async function showPlayerBio(playerName) {
    const player = playerBios[playerName];
    if (!player) return;
    
    // Check if player is from academy
    const isAcademy = academyPlayers.includes(playerName);
    
    // Update modal content with current data
    document.getElementById('playerBioName').textContent = player.name;
    document.getElementById('playerBioRole').textContent = player.role + (isAcademy ? ' (Academy)' : '');
    document.getElementById('playerBioKD').textContent = player.kd;
    document.getElementById('playerBioWR').textContent = player.winRate;
    document.getElementById('playerBioHS').textContent = player.headshot || '0%';
    document.getElementById('playerBioImage').src = player.image;
    document.getElementById('playerBioDescription').textContent = player.description;
    
    // Update achievements
    const achievementsList = document.getElementById('playerBioAchievements');
    achievementsList.innerHTML = player.achievements.map(achievement => 
        `<li>${achievement}</li>`
    ).join('');
    
    // Update social links
    const socialLinks = document.getElementById('playerBioSocial');
    socialLinks.innerHTML = `
        ${player.social.twitter ? `<a href="${player.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
        ${player.social.twitch ? `<a href="${player.social.twitch}" target="_blank"><i class="fab fa-twitch"></i></a>` : ''}
        ${player.social.youtube ? `<a href="${player.social.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
        ${player.social.tiktok ? `<a href="${player.social.tiktok}" target="_blank"><i class="fab fa-tiktok"></i></a>` : ''}
    `;
    
    // Show modal
    document.getElementById('playerBioModal').classList.add('active');
    
    // Fetch live stats and update display
    try {
        const updated = await r6API.updatePlayerStats(playerName, 'pc');
        if (updated) {
            // Show live update indicator
            const kdElement = document.getElementById('playerBioKD');
            kdElement.style.color = '#4ade80';
            setTimeout(() => {
                kdElement.style.color = '#dc2626';
            }, 2000);
        }
    } catch (error) {
        console.log('Could not fetch live stats, using cached data');
    }
}

function closePlayerBio() {
    document.getElementById('playerBioModal').classList.remove('active');
}

// Add click event listeners to player cards
document.addEventListener('DOMContentLoaded', function() {
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', async function() {
            const playerName = this.querySelector('.player-name').textContent;
            await showPlayerBio(playerName);
        });
    });

    // Initialize the data manager when the page loads
    // R6DataManager removed since leagues section is no longer present
});

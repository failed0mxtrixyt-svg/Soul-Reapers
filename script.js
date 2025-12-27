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

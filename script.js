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

// Console Easter egg
console.log('%c Soul Reapers Esports ', 'background: linear-gradient(45deg, #dc2626, #ef4444); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Esports Team ', 'color: #ff6b35; font-size: 14px;');

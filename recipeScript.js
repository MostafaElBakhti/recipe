let cart = [];
let recipes = [];
let appliedCoupon = null;

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Hero Section Animation
gsap.from('.hero-content h1', {
    duration: 1,
    y: 100,
    opacity: 0,
    ease: 'power4.out'
});

gsap.from('.hero-content p', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.3
});

gsap.from('.hero-search', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.5
});

gsap.from('.hero-stats .stat-item', {
    duration: 0.8,
    y: 30,
    opacity: 0,
    ease: 'power4.out',
    stagger: 0.2,
    delay: 0.7
});

// Available coupons
const coupons = {
    'SAVE20': 0.20,
    'SAVE30': 0.30,
    'WELCOME50': 0.50
};

function generatePrice(recipe) {
    return (recipe.cookTimeMinutes * 0.1 + recipe.rating * 2).toFixed(2);
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if(modal.style.display === 'flex') {
        gsap.to(modal, {
            duration: 0.3,
            opacity: 0,
            x: 100,
            ease: 'power2.inOut',
            onComplete: () => {
                modal.style.display = 'none';
            }
        });
    } else {
        modal.style.display = 'flex';
        modal.style.opacity = 0;
        gsap.to(modal, {
            duration: 0.3,
            opacity: 1,
            x: 0,
            ease: 'power2.out'
        });
        updateCartDisplay();
    }
}

function updateCartCount() {
    document.querySelector('.cart-count').textContent = cart.length;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    let subtotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                Your cart is empty
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => {
            const recipe = recipes.find(r => r.id === item.id);
            const itemTotal = parseFloat(item.price);
            subtotal += itemTotal;

            return `
                <div class="cart-item">
                    <img src="${recipe.image}" alt="${recipe.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${recipe.name}</span>
                        <span class="cart-item-price">$${item.price}</span>
                    </div>
                    <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id}, event)"></i>
                </div>
            `;
        }).join('');
    }

    // Update totals
    const discount = appliedCoupon ? subtotal * coupons[appliedCoupon] : 0;
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discountRow').style.display = appliedCoupon ? 'flex' : 'none';
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function addToCart(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!cart.find(item => item.id === recipeId)) {
        cart.push({ 
            id: recipe.id, 
            name: recipe.name,
            price: generatePrice(recipe),
            image: recipe.image
        });
        
        updateCartCount();
        updateCartDisplay();

        const button = document.querySelector(`button[data-id="${recipeId}"]`);
        button.classList.add('added');
        button.innerHTML = '<i class="fas fa-check"></i> Added';
    }
}

function removeFromCart(recipeId, event) {
    event.stopPropagation();
    
    cart = cart.filter(item => item.id !== recipeId);
    updateCartCount();
    updateCartDisplay();
    
    const button = document.querySelector(`button[data-id="${recipeId}"]`);
    if (button) {
        button.classList.remove('added');
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    }
}

function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponCode = couponInput.value.trim().toUpperCase();

    if (cart.length === 0) {
        alert('Add items to your cart before applying a coupon');
        couponInput.value = '';
        return;
    }

    if (coupons.hasOwnProperty(couponCode)) {
        appliedCoupon = couponCode;
        updateCartDisplay();
        alert(`Coupon applied! ${coupons[couponCode] * 100}% discount`);
    } else {
        alert('Invalid coupon code');
    }
    couponInput.value = '';
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = document.getElementById('total').textContent;
    alert(`Thank you for your order! Total: ${total}`);
    cart = [];
    appliedCoupon = null;
    updateCartCount();
    updateCartDisplay();
    toggleCart();
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipeContainer');
    container.innerHTML = recipes.map(recipe => {
        const price = generatePrice(recipe);
        return `
            <div class="recipe-card">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                    <div class="recipe-overlay">
                        <div class="recipe-details">
                            <div class="detail-item">
                                <i class="fas fa-utensils"></i>
                                <span>${recipe.cuisine} Cuisine</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-clock"></i>
                                <span>${recipe.cookTimeMinutes} mins</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-user-friends"></i>
                                <span>Serves ${recipe.servings || '2-4'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-fire"></i>
                                <span>${recipe.difficulty || 'Medium'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="rating-stars">${'★'.repeat(Math.round(recipe.rating))}</span>
                        <span class="recipe-time">
                            <i class="fas fa-clock"></i> ${recipe.cookTimeMinutes} mins
                        </span>
                    </div>
                    <div class="recipe-description">
                        ${recipe.ingredients.slice(0, 3).join(', ')}...
                    </div>
                    <div class="recipe-bottom">
                        <div class="price-tag">
                            $${price}
                        </div>
                        <button 
                            class="add-to-cart" 
                            data-id="${recipe.id}"
                            onclick="addToCart(${recipe.id})"
                        >
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Search functionality
document.querySelector('.search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.cuisine.toLowerCase().includes(searchTerm)
    );
    displayRecipes(filteredRecipes);
});

// Close cart modal when clicking outside
document.addEventListener('click', (e) => {
    const cartModal = document.getElementById('cartModal');
    const cartIcon = document.querySelector('.cart-icon');
    const isClickInsideCart = cartModal.contains(e.target);
    const isClickOnCartIcon = cartIcon.contains(e.target);
    const isClickOnRemoveButton = e.target.classList.contains('remove-item');

    if (!isClickInsideCart && !isClickOnCartIcon && !isClickOnRemoveButton) {
        cartModal.style.display = 'none';
    }
});

// Header scroll animation
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        gsap.to(header, {
            duration: 0.3,
            y: '-100%',
            ease: 'power3.inOut'
        });
    } else {
        gsap.to(header, {
            duration: 0.3,
            y: '0%',
            ease: 'power3.inOut'
        });
    }

    lastScroll = currentScroll;
});

// Fetch recipes
fetch('https://dummyjson.com/recipes')
    .then(res => res.json())
    .then(data => {
        recipes = data.recipes;
        displayRecipes(recipes);
    })
    .catch(error => {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipeContainer').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <h2>Error loading recipes</h2>
                <p>Please try again later</p>
            </div>
        `;
    });

// Optional: Add keyboard support for closing cart modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
    }
});

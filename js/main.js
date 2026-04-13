/**
 * @file main.js
 * @description VASTRA Storefront Core Logic.
 * Features: Dynamic Touch Slider, Real-time Search, Wishlist, Orders, and Kids Category.
 */

let allProducts = [];
let currentSlide = 0;
let sliderTimer;

// ==========================================
// 🌟 DYNAMIC HERO SLIDER LOGIC (With Touch & Text)
// ==========================================
async function fetchBanners() {
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/banners');
        const banners = await res.json();
        
        if (banners.length > 0) {
            const container = document.getElementById('dynamic-slider-container');
            const track = document.getElementById('slider-track');
            const nav = document.getElementById('slider-nav');
            
            track.innerHTML = banners.map((b, index) => {
                // Determine text position class based on database value
                const posClass = b.text_position === 'left' ? 'text-pos-left' : 
                                 b.text_position === 'right' ? 'text-pos-right' : 'text-pos-center';

                return `
                <div class="slide ${index === 0 ? 'active' : ''}" 
                     style="background-image: url('${b.image_url}');"
                     onclick="window.open('${b.target_link}', '_blank')">
                     
                     ${b.text_content ? `
                     <div class="slide-text-container ${posClass}">
                        <div class="slide-text text-xl md:text-3xl">${b.text_content}</div>
                     </div>
                     ` : ''}
                </div>
            `}).join('');

            if (banners.length > 1) {
                nav.innerHTML = banners.map((b, index) => `
                    <div class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
                `).join('');
            }

            container.classList.remove('hidden');
            if (banners.length > 1) initSlider();
        }
    } catch (err) { console.error("Banner fetch failed", err); }
}

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    const container = document.getElementById('dynamic-slider-container');
    
    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() { showSlide((currentSlide + 1) % slides.length); }
    function prevSlide() { showSlide((currentSlide - 1 + slides.length) % slides.length); }
    
    window.goToSlide = (index) => { 
        showSlide(index); 
        resetTimer(); 
    };
    
    function resetTimer() {
        clearInterval(sliderTimer);
        sliderTimer = setInterval(nextSlide, 5000); // 5 seconds auto-slide
    }
    
    resetTimer();

    // 🌟 Mobile Touch Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;

    if(container) {
        container.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(sliderTimer); // Pause auto-slide on touch
        }, {passive: true});

        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            resetTimer(); // Resume auto-slide
        }, {passive: true});
    }

    function handleSwipe() {
        const threshold = 50; // Minimum pixel distance for swipe
        if (touchEndX < touchStartX - threshold) nextSlide(); // Swipe Left -> Next
        if (touchEndX > touchStartX + threshold) prevSlide(); // Swipe Right -> Prev
    }
}

// ==========================================
// 🌟 INVENTORY & CATEGORY RENDERING
// ==========================================
async function initStorefront() {
    fetchBanners();
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/products');
        allProducts = await res.json();
        displayInventory(allProducts);
        const statusText = document.getElementById('status-text');
        if(statusText) statusText.innerText = "System Sync: Connected";
    } catch (err) { console.error("VASTRA: Backend Connection Failed.", err); }
}

function displayInventory(products) {
    const featuredItems = products.filter(p => (p.category || "").toLowerCase().includes('featured'));
    const menItems = products.filter(p => (p.category || "").toLowerCase().trim() === 'men');
    const womenItems = products.filter(p => (p.category || "").toLowerCase().trim() === 'women');
    
    // 🌟 FIX: Added Kids Category Logic
    const kidsItems = products.filter(p => (p.category || "").toLowerCase().trim() === 'kids');

    renderProductGrid('featured-grid', featuredItems);
    renderProductGrid('men-grid', menItems);
    renderProductGrid('women-grid', womenItems);
    renderProductGrid('kids-grid', kidsItems); // Render Kids
}

function renderProductGrid(id, products) {
    const grid = document.getElementById(id);
    if (!grid) return; 

    if (products.length === 0) {
        grid.innerHTML = `<p class="text-xs text-gray-400 col-span-full pb-8">New collection dropping soon...</p>`;
        return;
    }

    // 🌟 FIX: Added 'event' parameter in saveToWishlist to change icon on click
    grid.innerHTML = products.map(p => `
        <div class="group border border-transparent hover:border-gray-100 p-2 transition-all">
            <div class="aspect-[3/4] bg-gray-50 mb-3 overflow-hidden relative border border-gray-100 cursor-pointer" onclick="handlePurchase('${p.purchase_link}', ${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.image_url}')">
                <img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/300x400?text=VASTRA'"
                     class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
            </div>
            <h3 class="text-[10px] font-bold uppercase truncate mb-1 text-gray-800">${p.name}</h3>
            <p class="font-bold text-xs mb-3">₹${p.price} <span class="text-[9px] text-gray-400 line-through ml-1">₹${p.mrp || 0}</span></p>
            
            <div class="flex gap-2">
                <button onclick="saveToWishlist(${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.image_url}', '${p.price}', event)" title="Save to Wishlist"
                        class="w-1/4 py-2 bg-white text-black border border-black text-sm flex justify-center items-center hover:bg-gray-100 transition-all rounded-sm shadow-sm">
                    <i class="ri-bookmark-line"></i>
                </button>
                <button onclick="handlePurchase('${p.purchase_link}', ${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.image_url}')" 
                        class="w-3/4 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm shadow-md">
                    Buy Now
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 🌟 SEARCH, WISHLIST & ORDERS
// ==========================================
window.handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    const storefront = document.getElementById('storefront-content');
    const searchArea = document.getElementById('search-info');
    
    if (query.length > 0) {
        const results = allProducts.filter(p => (p.name && p.name.toLowerCase().includes(query)) || (p.category && p.category.toLowerCase().includes(query)));
        storefront.classList.add('hidden'); searchArea.classList.remove('hidden'); renderProductGrid('search-results-grid', results);
    } else { clearSearch(); }
};

window.clearSearch = () => { document.getElementById('searchInput').value = ""; document.getElementById('storefront-content').classList.remove('hidden'); document.getElementById('search-info').classList.add('hidden'); };

// 🌟 FIX: Use Custom Alert instead of standard browser alert()
window.saveToWishlist = (id, name, image, price, event) => {
    const user = localStorage.getItem('vastra_user');
    if (!user) { window.location.href = 'login.html'; return; }
    
    let wishlist = JSON.parse(localStorage.getItem('vastra_wishlist')) || [];
    const exists = wishlist.find(item => item.id === id);
    
    if (!exists) {
        wishlist.push({ id, name, image, price });
        localStorage.setItem('vastra_wishlist', JSON.stringify(wishlist));
        
        // Show Pro-Alert
        if (window.vastraAlert) vastraAlert('Product saved to your Wishlist!', 'success');
        else alert('Product added to Wishlist!');
        
        // Change icon to filled
        if (event && event.currentTarget) {
            event.currentTarget.innerHTML = `<i class="ri-bookmark-fill text-black"></i>`;
        }
    } else {
        if (window.vastraAlert) vastraAlert('Product is already in your Wishlist!', 'info');
        else alert('Product is already in your Wishlist!');
    }
};

window.handlePurchase = (link, id, name, image) => {
    const user = localStorage.getItem('vastra_user');
    if (user) {
        let orders = JSON.parse(localStorage.getItem('vastra_orders')) || [];
        const date = new Date().toLocaleDateString('en-GB');
        orders.push({ id, name, image, date });
        localStorage.setItem('vastra_orders', JSON.stringify(orders));
        
        window.open(link, '_blank');
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', initStorefront);
/**
 * @file main.js
 * @description VSTRA Store Logic. (Updated for Precise Category Filtering)
 */

let allProducts = [];

/**
 * Initializes the storefront and fetches global inventory.
 */
async function initStorefront() {
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/products');
        allProducts = await res.json();
        
        // Render all sections
        displayInventory(allProducts);
        
        const statusText = document.getElementById('status-text');
        if(statusText) statusText.innerText = "System Sync: Connected";
    } catch (err) {
        console.error("VSTRA: Backend Connection Failed.", err);
    }
}

/**
 * Maps database items to the corresponding HTML grids.
 */
function displayInventory(products) {
    // 🌟 FIX: Using strict comparison (===) to prevent 'men' inside 'women' mismatch
    
    // Featured के लिए अभी भी includes रख रहे हैं क्योंकि ये एक टैग जैसा है
    const featuredItems = products.filter(p => 
        (p.category || "").toLowerCase().includes('featured')
    );

    // Men के लिए Exact Match: ताकि wo'men' वाले इसमें न आएं
    const menItems = products.filter(p => 
        (p.category || "").toLowerCase().trim() === 'men'
    );

    // Women के लिए Exact Match
    const womenItems = products.filter(p => 
        (p.category || "").toLowerCase().trim() === 'women'
    );

    renderProductGrid('featured-grid', featuredItems);
    renderProductGrid('men-grid', menItems);
    renderProductGrid('women-grid', womenItems);
}

/**
 * Helper to render cards into a target container.
 */
function renderProductGrid(id, products) {
    const grid = document.getElementById(id);
    if (!grid) return; 

    grid.innerHTML = products.map(p => `
        <div class="group border border-transparent hover:border-gray-100 p-2 transition-all">
            <div class="aspect-[3/4] bg-gray-50 mb-3 overflow-hidden relative border border-gray-100">
                <img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/300x400?text=VSTRA'"
                     class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
            </div>
            <h3 class="text-[10px] font-bold uppercase truncate mb-1 text-gray-800">${p.name}</h3>
            <p class="font-bold text-xs mb-3">₹${p.price} <span class="text-[9px] text-gray-400 line-through ml-1">₹${p.mrp || 0}</span></p>
            <button onclick="handlePurchase('${p.purchase_link}')" 
                    class="w-full py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                Buy Now
            </button>
        </div>
    `).join('');
}

// Global Search
window.handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    const storefront = document.getElementById('storefront-content');
    const searchArea = document.getElementById('search-info');
    
    if (query.length > 0) {
        const results = allProducts.filter(p => 
            (p.name && p.name.toLowerCase().includes(query)) || 
            (p.category && p.category.toLowerCase().includes(query))
        );
        storefront.classList.add('hidden');
        searchArea.classList.remove('hidden');
        renderProductGrid('search-results-grid', results);
    } else {
        clearSearch();
    }
};

window.clearSearch = () => {
    document.getElementById('searchInput').value = "";
    document.getElementById('storefront-content').classList.remove('hidden');
    document.getElementById('search-info').classList.add('hidden');
};

function handlePurchase(link) {
    const user = localStorage.getItem('vastra_user');
    if (user) {
        window.open(link, '_blank');
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', initStorefront);
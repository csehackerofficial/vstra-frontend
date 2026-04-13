/**
 * @file admin_dashboard.js
 * @description Updated Administrative Logic for VASTRA.
 */

let allAdminUsers = [];
let allAdminProducts = []; 
let allAdminSales = [];
let editingProductId = null;

const API_BASE = "https://vstra-backend.onrender.com/api";

// ==========================================
// 🌟 TAB & MODAL LOGIC
// ==========================================

function switchTab(tab) {
    const sections = ['sec-users', 'sec-store', 'sec-sales', 'sec-banners'];
    const buttons = ['btn-users', 'btn-store', 'btn-sales', 'btn-banners'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.classList.remove('active', 'text-black', 'bg-blue-50');
    });

    const activeSec = document.getElementById(`sec-${tab}`);
    if(activeSec) activeSec.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`btn-${tab}`);
    if(activeBtn) {
        activeBtn.classList.add('active', 'text-black');
        if(tab === 'banners') activeBtn.classList.add('bg-blue-50');
    }

    // Load Data based on Tab
    if (tab === 'users') loadUsers();
    else if (tab === 'store') loadInventory(); 
    else if (tab === 'sales') loadSales();
    else if (tab === 'banners') loadBanners();
}

window.toggleModal = (modalId, show) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (!show && modalId === 'productModal') {
            document.getElementById('admin-form').reset();
            editingProductId = null;
        }
    }
};

// ==========================================
// 🌟 USER REGISTRY LOGIC
// ==========================================

async function loadUsers() {
    const container = document.getElementById("user-list");
    container.innerHTML = "<p class='text-center py-10 animate-pulse text-xs text-gray-400 uppercase tracking-widest'>Connecting to Database...</p>";

    try {
        const response = await fetch(`${API_BASE}/users`);
        allAdminUsers = await response.json();
        renderUserTable(allAdminUsers);
    } catch (err) { 
        container.innerHTML = `<p class='text-center py-10 text-red-500 text-xs font-bold'>OFFLINE: Failed to fetch users.</p>`;
    }
}

function renderUserTable(users) {
    const container = document.getElementById("user-list");
    if (users.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase tracking-widest">No Registered Users Yet.</div>`;
        return;
    }

    const rows = users.map(user => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4 font-mono text-[10px] text-gray-400">#${user.id}</td>
            <td class="py-4 font-black uppercase tracking-tight text-gray-900">${user.name}</td>
            <td class="py-4 text-xs font-semibold text-gray-700">${user.email}</td>
            <td class="py-4 text-[10px] font-bold text-gray-500">${user.phone_number || 'NO PHONE'}</td>
            <td class="py-4"><span class="bg-black text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">${user.role}</span></td>
        </tr>
    `).join('');

    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

// ==========================================
// 🌟 STORE INVENTORY LOGIC
// ==========================================

async function loadInventory() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = "<p class='text-center py-10 animate-pulse text-xs text-gray-400'>Fetching Products...</p>";

    try {
        const res = await fetch(`${API_BASE}/products`);
        allAdminProducts = await res.json();
        renderInventoryTable(allAdminProducts);
    } catch (err) { 
        container.innerHTML = `<p class='text-center py-10 text-red-500 text-xs font-bold'>Error loading catalog.</p>`;
    }
}

function renderInventoryTable(products) {
    const container = document.getElementById('inventory-list');
    if (products.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">Master Inventory Empty.</div>`;
        return;
    }

    const rows = products.map(p => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors text-xs">
            <td class="py-4 px-4 w-16"><img src="${p.image_url}" class="w-10 h-10 object-cover rounded shadow-sm border border-gray-100"></td>
            <td class="py-4 font-bold text-gray-900 truncate max-w-[150px]">${p.name}</td>
            <td class="py-4 uppercase text-gray-400 font-bold text-[9px] tracking-widest">${p.category}</td>
            <td class="py-4 font-black">₹${p.price}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700"><i class="ri-delete-bin-line text-lg"></i></button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `<table class="w-full text-left"><tbody>${rows}</tbody></table>`;
}

// ==========================================
// 🌟 SAVE PRODUCT API CALL
// ==========================================
window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "SAVING..."; btn.disabled = true;

    const payload = {
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        mrp: document.getElementById('p-mrp').value || 0,
        category: document.getElementById('p-cat').value,
        image_url: document.getElementById('p-img').value,
        purchase_link: document.getElementById('p-link').value
    };

    try {
        const res = await fetch(`${API_BASE}/add-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Success: Product added to Catalog!");
            toggleModal('productModal', false);
            loadInventory();
        } else {
            alert("Error: Check if Product URL is correct.");
        }
    } catch (err) {
        alert("CRITICAL: Server Not Responding.");
    } finally {
        btn.innerText = "PUBLISH TO STORE";
        btn.disabled = false;
    }
};

// ==========================================
// 🌟 BANNER LOGIC
// ==========================================
async function loadBanners() {
    const list = document.getElementById('banner-list');
    try {
        const res = await fetch(`${API_BASE}/banners`);
        const banners = await res.json();
        if (banners.length === 0) {
            list.innerHTML = `<div class="col-span-full text-center py-10 text-[10px] font-bold text-gray-300 uppercase">Banners Gallery is Empty.</div>`;
            return;
        }
        list.innerHTML = banners.map(b => `
            <div class="relative rounded-lg overflow-hidden border border-gray-100 shadow-sm h-32">
                <img src="${b.image_url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/30 p-3 flex justify-between items-start">
                    <span class="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PRIORITY: ${b.priority_number}</span>
                    <button onclick="deleteBanner(${b.id})" class="bg-white text-red-600 w-6 h-6 rounded flex items-center justify-center shadow"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

window.saveBanner = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "PUBLISHING..."; btn.disabled = true;

    const payload = {
        image_url: document.getElementById('b-image').value,
        target_link: document.getElementById('b-link').value,
        text_content: document.getElementById('b-text').value,
        text_position: document.getElementById('b-text-pos').value,
        priority_number: document.getElementById('b-priority').value || 0
    };

    try {
        const res = await fetch(`${API_BASE}/banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            toggleModal('bannerModal', false);
            loadBanners();
        } else { alert("Failed to save banner."); }
    } catch (err) { alert("Server Error."); }
    finally { btn.innerText = "PUBLISH BANNER"; btn.disabled = false; }
};

window.deleteProduct = async (id) => {
    if(confirm("Delete Product?")) {
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
};

window.deleteBanner = async (id) => {
    if(confirm("Remove Banner?")) {
        await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
        loadBanners();
    }
};

async function loadSales() {
    const container = document.getElementById('sales-list');
    try {
        const res = await fetch(`${API_BASE}/admin/sales`);
        const sales = await res.json();
        if (sales.length === 0) {
            container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">Sales History Empty.</div>`;
            return;
        }
        const rows = sales.map(s => `
            <tr class="border-b border-gray-50 text-[11px]">
                <td class="py-4 px-4">#${s.order_id}</td>
                <td class="py-4 font-bold text-gray-900">${s.product_name}</td>
                <td class="py-4 uppercase font-bold text-gray-500">${s.customer_name}</td>
                <td class="py-4 font-black">₹${s.price}</td>
            </tr>
        `).join('');
        container.innerHTML = `<table class="w-full text-left"><tbody>${rows}</tbody></table>`;
    } catch (err) { console.error(err); }
}

// BOOT
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
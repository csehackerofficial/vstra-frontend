/**
 * @file admin_dashboard.js
 * @description Master Administrative Logic for VASTRA.
 * Features: User Registry, Product CRUD, Banner Management, and Sales Tracking.
 */

let allAdminUsers = [];
let allAdminProducts = []; 
let allAdminBanners = [];
let allAdminSales = [];
let editingProductId = null;
let editingBannerId = null;

const API_BASE = "https://vstra-backend.onrender.com/api";

// ==========================================
// 🌟 TAB & MODAL LOGIC
// ==========================================

function switchTab(tab) {
    const sections = ['sec-users', 'sec-store', 'sec-sales', 'sec-banners'];
    const buttons = ['btn-users', 'btn-store', 'btn-sales', 'btn-banners'];

    // Hide all sections and reset button styles
    sections.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.classList.remove('active', 'text-black', 'bg-blue-50');
    });

    // Show active section
    const activeSec = document.getElementById(`sec-${tab}`);
    if(activeSec) activeSec.classList.remove('hidden');
    
    // Highlight active button
    const activeBtn = document.getElementById(`btn-${tab}`);
    if(activeBtn) {
        activeBtn.classList.add('active', 'text-black');
    }

    // Load data based on tab
    if (tab === 'users') loadUsers();
    else if (tab === 'store') loadInventory(); 
    else if (tab === 'sales') loadSales();
    else if (tab === 'banners') loadBanners();
}

window.toggleModal = (modalId, show) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (!show) {
            // Reset forms and IDs on close
            if(modalId === 'productModal') {
                document.getElementById('admin-form').reset();
                editingProductId = null;
                document.querySelector('#productModal h3').innerText = "List New Product";
            } else if (modalId === 'bannerModal') {
                document.getElementById('banner-form').reset();
                editingBannerId = null;
                document.querySelector('#bannerModal h3').innerText = "Add Homepage Banner";
            }
        }
    }
};

// ==========================================
// 🌟 USER REGISTRY (Read Only)
// ==========================================

async function loadUsers() {
    const container = document.getElementById("user-list");
    container.innerHTML = `<p class="p-10 text-center text-xs text-gray-400 animate-pulse">Fetching Secure User Data...</p>`;
    try {
        const response = await fetch(`${API_BASE}/users`);
        allAdminUsers = await response.json();
        renderUserTable(allAdminUsers);
    } catch (err) { 
        console.error(err);
        container.innerHTML = `<p class="p-10 text-center text-red-500">Database Connection Failed.</p>`;
    }
}

function renderUserTable(users) {
    const container = document.getElementById("user-list");
    if (!users || users.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">No Users Found.</div>`;
        return;
    }
    const rows = users.map(user => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-6 font-mono text-[10px] text-gray-400">#${user.id}</td>
            <td class="py-4 font-black uppercase tracking-tight text-gray-900">${user.name}</td>
            <td class="py-4 text-xs font-semibold text-gray-700">${user.email}</td>
            <td class="py-4 text-[10px] font-bold text-gray-500">${user.phone_number || 'N/A'}</td>
            <td class="py-4 px-6"><span class="bg-black text-white text-[9px] font-bold px-2 py-1 rounded uppercase">${user.role}</span></td>
        </tr>`).join('');
    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

// ==========================================
// 🌟 STORE CATALOG (CRUD & Discount Logic)
// ==========================================

async function loadInventory() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        allAdminProducts = await res.json();
        renderInventoryTable(allAdminProducts);
    } catch (err) { console.error(err); }
}

function renderInventoryTable(products) {
    const container = document.getElementById('inventory-list');
    if (!products || products.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase tracking-widest">Store Inventory Empty.</div>`;
        return;
    }

    const rows = products.map(p => {
        // Calculate percentage off
        const discount = (p.mrp > p.price) ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        
        return `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors text-xs">
            <td class="py-4 px-6 w-16"><img src="${p.image_url}" class="w-10 h-10 object-cover rounded shadow-sm border border-gray-100"></td>
            <td class="py-4">
                <div class="font-bold text-gray-900 truncate max-w-[180px]">${p.name}</div>
                <div class="text-[8px] text-blue-500 font-bold uppercase tracking-tighter">${p.category}</div>
            </td>
            <td class="py-4 uppercase text-gray-400 font-bold text-[9px] tracking-widest">${p.category}</td>
            <td class="py-4">
                <div class="font-black text-gray-900">₹${p.price}</div>
                <div class="text-[9px] text-gray-400 line-through">₹${p.mrp}</div>
                ${discount > 0 ? `<div class="text-[9px] text-green-600 font-bold">-${discount}% OFF</div>` : ''}
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex justify-end gap-3">
                    <button onclick="editProduct(${p.id})" class="text-blue-500 hover:text-blue-700" title="Edit Item"><i class="ri-edit-box-line text-lg"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700" title="Delete Item"><i class="ri-delete-bin-line text-lg"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

window.editProduct = (id) => {
    const p = allAdminProducts.find(item => item.id === id);
    if (!p) return;
    editingProductId = id;
    
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-mrp').value = p.mrp;
    document.getElementById('p-cat').value = p.category;
    document.getElementById('p-img').value = p.image_url;
    document.getElementById('p-link').value = p.purchase_link;
    
    document.querySelector('#productModal h3').innerText = "Update Product Info";
    toggleModal('productModal', true);
};

window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
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
        const url = editingProductId ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/add-product`;
        const method = editingProductId ? 'PUT' : 'POST';
        
        const res = await fetch(url, { 
            method: method, 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(payload) 
        });

        if (res.ok) { 
            toggleModal('productModal', false); 
            loadInventory(); 
            alert(editingProductId ? "Success: Product Updated!" : "Success: New Product Added!");
        }
    } catch (err) { alert("Server connectivity error."); }
    finally { btn.innerText = originalText; btn.disabled = false; }
};

// ==========================================
// 🌟 BANNER MANAGEMENT
// ==========================================

async function loadBanners() {
    const list = document.getElementById('banner-list');
    try {
        const res = await fetch(`${API_BASE}/banners`);
        allAdminBanners = await res.json();
        if (allAdminBanners.length === 0) { 
            list.innerHTML = `<div class="col-span-full text-center py-10 text-gray-300 uppercase text-[10px] font-bold">No Active Banners Found.</div>`; 
            return; 
        }
        list.innerHTML = allAdminBanners.map(b => `
            <div class="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm h-36 group bg-gray-50">
                <img src="${b.image_url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onclick="editBanner(${b.id})" class="bg-white text-blue-600 p-2 rounded-full shadow hover:scale-110 transition-transform"><i class="ri-edit-box-line text-xl"></i></button>
                    <button onclick="deleteBanner(${b.id})" class="bg-white text-red-600 p-2 rounded-full shadow hover:scale-110 transition-transform"><i class="ri-delete-bin-line text-xl"></i></button>
                </div>
                <div class="absolute top-2 left-2 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black">PRIORITY: ${b.priority_number}</div>
            </div>`).join('');
    } catch (err) { console.error(err); }
}

window.editBanner = (id) => {
    const b = allAdminBanners.find(item => item.id === id);
    if (!b) return;
    editingBannerId = id;
    document.getElementById('b-image').value = b.image_url;
    document.getElementById('b-link').value = b.target_link;
    document.getElementById('b-text').value = b.text_content || '';
    document.getElementById('b-text-pos').value = b.text_position || 'center';
    document.getElementById('b-priority').value = b.priority_number || 0;
    
    document.querySelector('#bannerModal h3').innerText = "Update Homepage Banner";
    toggleModal('bannerModal', true);
};

window.saveBanner = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "PUBLISHING..."; btn.disabled = true;

    const payload = {
        image_url: document.getElementById('b-image').value,
        target_link: document.getElementById('b-link').value,
        text_content: document.getElementById('b-text').value,
        text_position: document.getElementById('b-text-pos').value,
        priority_number: document.getElementById('b-priority').value || 0
    };

    try {
        const url = editingBannerId ? `${API_BASE}/banners/${editingBannerId}` : `${API_BASE}/banners`;
        const method = editingBannerId ? 'PUT' : 'POST';
        
        const res = await fetch(url, { 
            method: method, 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(payload) 
        });

        if (res.ok) { 
            toggleModal('bannerModal', false); 
            loadBanners(); 
            alert("Banner Config Updated!");
        }
    } catch (err) { alert("Error saving banner settings."); }
    finally { btn.innerText = originalText; btn.disabled = false; }
};

// ==========================================
// 🌟 DELETION & SALES ANALYTICS
// ==========================================

window.deleteProduct = async (id) => { 
    if(confirm("Are you sure? This product will be permanently removed from the catalog.")) { 
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }); 
        loadInventory(); 
    } 
};

window.deleteBanner = async (id) => { 
    if(confirm("Remove this promotion from the homepage?")) { 
        await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' }); 
        loadBanners(); 
    } 
};

async function loadSales() {
    const container = document.getElementById('sales-list');
    container.innerHTML = `<p class="p-10 text-center text-[10px] uppercase font-bold text-gray-400">Loading Order History...</p>`;
    try {
        const res = await fetch(`${API_BASE}/admin/sales`);
        allAdminSales = await res.json();
        if (allAdminSales.length === 0) { 
            container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">Sales Registry is Empty.</div>`; 
            return; 
        }
        const rows = allAdminSales.map(s => `
            <tr class="border-b border-gray-50 text-[11px]">
                <td class="py-4 px-6 font-mono text-gray-400">#${s.order_id}</td>
                <td class="py-4 font-bold text-gray-900">${s.product_name}</td>
                <td class="py-4 uppercase font-bold text-gray-500">${s.customer_name}</td>
                <td class="py-4 font-black text-gray-900">₹${s.price}</td>
            </tr>`).join('');
        container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
    } catch (err) { console.error(err); }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => { 
    switchTab('users'); 
});
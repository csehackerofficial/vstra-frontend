/**
 * @file admin.js
 * @description Administrative Logic for VSTRA Team.
 * Optimized for Clean UI, Edit functionality, and Text Truncation.
 */

let allAdminProducts = []; // 🌟 नई चीज़: प्रॉडक्ट्स का डेटा यहाँ सेव होगा ताकि एडिट कर सकें
let editingProductId = null; // पता लगाने के लिए कि 'Add' हो रहा है या 'Edit'

// --- 1. Modal Control ---
window.toggleModal = (show) => {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (!show) {
            document.getElementById('admin-form').reset();
            editingProductId = null; // एडिट मोड बंद करें
            document.querySelector('#productModal h3').innerText = "List New Product"; // फॉर्म का टाइटल वापस बदलें
        }
    }
};

// --- 2. Load Inventory (Read Operation) ---
async function loadInventory() {
    const list = document.getElementById('admin-list');
    const emptyMsg = document.getElementById('empty-msg');

    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/products');
        const data = await res.json();

        if (!data || data.length === 0) {
            list.innerHTML = "";
            if (emptyMsg) emptyMsg.classList.remove('hidden');
            return;
        }

        if (emptyMsg) emptyMsg.classList.add('hidden');
        allAdminProducts = data; // डेटा सेव करें
        
        // 🌟 YELLOW BOX & BLUE BOX FIX: Name truncate and Edit button added
        list.innerHTML = data.map(p => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 rounded-l-lg">
                    <img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/100?text=Error'" class="w-12 h-12 object-cover rounded shadow-sm border border-gray-100">
                </td>
                <td class="py-3 px-2">
                    <div class="text-sm font-semibold text-gray-900 max-w-[150px] md:max-w-[300px] truncate cursor-pointer" title="${p.name}">${p.name}</div>
                </td>
                <td class="py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">${p.category}</td>
                <td class="py-3 px-2 font-semibold text-sm text-gray-900">
                    ₹${p.price} <span class="text-[10px] text-gray-400 line-through ml-1 font-normal">₹${p.mrp || 0}</span>
                </td>
                <td class="py-3 px-4 text-right rounded-r-lg">
                    <div class="flex justify-end gap-4">
                        <button onclick="editProduct(${p.id})" class="text-blue-500 hover:text-blue-700 transition-colors text-lg" title="Edit Product">
                            <i class="ri-edit-box-line"></i>
                        </button>
                        <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 transition-colors text-lg" title="Delete Product">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Critical Sync Error:", err);
    }
}

// --- 3. Edit Product (Setup Form) ---
window.editProduct = (id) => {
    const product = allAdminProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id; // सिस्टम को बताएं कि एडिट चल रहा है

    // फॉर्म में पुराना डेटा भरें
    document.getElementById('p-title').value = product.name;
    document.getElementById('p-image').value = product.image_url;
    document.getElementById('p-link').value = product.purchase_link;
    document.getElementById('p-mrp').value = product.mrp;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-category').value = product.category;

    // फॉर्म का टाइटल बदलें
    document.querySelector('#productModal h3').innerText = "Edit Product";
    
    toggleModal(true); // फॉर्म खोलें
};

// --- 4. Save/Update Product ---
window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalBtnText = btn.innerText;
    
    btn.innerText = "SYNCHRONIZING...";
    btn.disabled = true;

    const product = {
        name: document.getElementById('p-title').value,
        image_url: document.getElementById('p-image').value, 
        purchase_link: document.getElementById('p-link').value, 
        mrp: document.getElementById('p-mrp').value,
        price: document.getElementById('p-price').value,
        category: document.getElementById('p-category').value
    };

    try {
        // 🌟 अगर एडिट हो रहा है तो PUT रूट, वरना नया ऐड करने के लिए POST रूट
        let url = 'https://vstra-backend.onrender.com/api/add-product';
        let method = 'POST';

        if (editingProductId) {
            url = `https://vstra-backend.onrender.com/api/products/${editingProductId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            toggleModal(false); 
            await loadInventory(); 
        } else {
            const errData = await res.json();
            alert("Error: " + errData.message);
        }
    } catch (err) {
        alert("VSTRA Engine Offline. Please check your Node.js server.");
    } finally {
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
};

// --- 5. Delete Product ---
window.deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const res = await fetch(`https://vstra-backend.onrender.com/api/products/${id}`, { 
                method: 'DELETE' 
            });
            if (res.ok) {
                await loadInventory();
            }
        } catch (err) {
            alert("Wipe operation failed.");
        }
    }
};

// Initial Load on Page Startup
document.addEventListener('DOMContentLoaded', loadInventory);
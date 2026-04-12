/**
 * @file admin.js
 * @description Administrative Logic for VSTRA Team.
 * Optimized for MySQL synchronization and B&W UI.
 */

// --- 1. Modal Control ---
window.toggleModal = (show) => {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        // Reset form when closing to keep it clean
        if (!show) document.getElementById('admin-form').reset();
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
        
        // 🌟 FIX: p.title को p.name किया गया है क्योंकि डेटाबेस में 'name' कॉलम है
        list.innerHTML = data.map(p => `
            <tr class="group hover:bg-gray-50 transition-colors">
                <td class="py-4 px-2">
                    <img src="${p.image_url}" 
                         onerror="this.src='https://via.placeholder.com/100?text=Error'"
                         class="w-12 h-12 object-cover border border-black grayscale group-hover:grayscale-0 transition-all">
                </td>
                <td class="py-4 font-bold text-xs uppercase tracking-tight">${p.name}</td>
                <td class="py-4 font-bold text-[10px] text-gray-400 uppercase">${p.category}</td>
                <td class="py-4 font-bold text-xs italic">
                    ₹${p.price} 
                    <span class="text-[9px] text-gray-300 line-through ml-1">₹${p.mrp || 0}</span>
                </td>
                <td class="py-4 text-right pr-4">
                    <button onclick="deleteProduct(${p.id})" class="text-gray-300 hover:text-black transition-colors text-xl">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Critical Sync Error:", err);
    }
}

// --- 3. Save Product (Create Operation) ---
window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalBtnText = btn.innerText;
    
    btn.innerText = "SYNCHRONIZING...";
    btn.disabled = true;

    // 🌟 FIX: Data keys updated to match backend server.js and MySQL columns perfectly
    const product = {
        name: document.getElementById('p-title').value,
        image_url: document.getElementById('p-image').value, 
        purchase_link: document.getElementById('p-link').value, 
        mrp: document.getElementById('p-mrp').value,
        price: document.getElementById('p-price').value,
        category: document.getElementById('p-category').value
    };

    try {
        // 🌟 FIX: Fetch URL updated to hit the correct POST route
        const res = await fetch('https://vstra-backend.onrender.com/api/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            toggleModal(false); // Close form
            await loadInventory();   // Refresh table with new data
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

// --- 4. Delete Product (Delete Operation) ---
window.deleteProduct = async (id) => {
    if (confirm("Action: Permanent Wipe. This cannot be undone. Continue?")) {
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
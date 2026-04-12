function checkAuthState() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const userStr = localStorage.getItem('vastra_user');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        const isAdmin = user.role === 'admin' || user.email === "kumaraayush7501@gmail.com";

        authSection.innerHTML = `
            <div class="flex items-center gap-4">
                ${isAdmin ? '<a href="admin.html" class="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-2 rounded">Admin</a>' : ''}
                <div class="text-right leading-none hidden sm:block">
                    <p class="text-[10px] font-black uppercase">${user.name}</p>
                    <button onclick="handleLogout()" class="text-[9px] font-bold text-red-500 uppercase mt-1">Logout</button>
                </div>
                <div class="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-black text-sm uppercase">${user.name.charAt(0)}</div>
            </div>
        `;
    } else {
        // Simple and clean Login button
        authSection.innerHTML = `<a href="login.html" class="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Login</a>`;
    }
}

window.handleLogout = () => {
    localStorage.removeItem('vastra_user');
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', checkAuthState);
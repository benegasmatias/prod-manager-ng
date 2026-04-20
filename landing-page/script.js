document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Navbar Scroll Effect
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('bg-white/80', 'backdrop-blur-xl', 'shadow-sm', 'border-b', 'border-zinc-100');
        } else {
            nav.classList.remove('bg-white/80', 'backdrop-blur-xl', 'shadow-sm', 'border-b', 'border-zinc-100');
        }
    });

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            menuIcon.setAttribute('data-lucide', isHidden ? 'menu' : 'x');
            lucide.createIcons();
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // Intersection Observer for Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.setAttribute('data-visible', 'true');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Pricing Logic
    const FALLBACK_PLANS = [
        { name: 'Prueba Gratis', price: 0, desc: '1 Mes de regalo', items: ['15 pedidos / mes', '1 negocio', '1 usuario'], recommended: false },
        { name: 'Pro', price: 10990, desc: 'Para crecer', items: ['50 pedidos / mes', '1 negocio', '3 usuarios'], recommended: true },
        { name: 'Business', price: 29900, desc: 'Para escalar', items: ['500 pedidos / mes', '1 negocio', '7 usuarios', 'Soporte prioritario'], recommended: false }
    ];

    function renderPlans(plans) {
        const grid = document.getElementById('pricing-grid');
        if (!grid) return;

        grid.innerHTML = plans.map(plan => `
            <div class="fade-in p-8 rounded-3xl border ${plan.recommended ? 'border-violet-600 bg-zinc-900 shadow-xl' : 'border-zinc-800 bg-zinc-900/50'}" data-visible="false">
                <h3 class="text-xl font-black mb-2 text-white">${plan.name}</h3>
                <p class="text-4xl font-black mb-1 text-white">$${plan.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span class="text-sm text-zinc-500"> /mes</span></p>
                <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Por negocio</p>
                <ul class="space-y-4 mb-8">
                    ${plan.items.map(item => `
                        <li class="flex items-center gap-2 text-sm text-zinc-400">
                            <i data-lucide="check" class="h-4 w-4 text-violet-600"></i> ${item}
                        </li>
                    `).join('')}
                </ul>
                <a href="https://app.prodmanager.com.ar/register" class="block text-center py-3 rounded-xl ${plan.recommended ? 'bg-violet-600 text-white' : 'border border-zinc-700 text-white'} font-bold">
                    Comenzar
                </a>
            </div>
        `).join('');

        lucide.createIcons();
        // Observe newly created elements
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    // Forzado a usar planes locales para que coincidan con la Landing
    renderPlans(FALLBACK_PLANS);

    /* 
    const API_URL = window.location.hostname.includes('prodmanager.com.ar')
        ? 'https://api.prodmanager.com.ar'
        : 'http://localhost:3030';
    fetch(`${API_URL}/plans`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                renderPlans(data.map(p => ({
                    name: p.name,
                    price: p.price,
                    desc: p.description,
                    items: p.features,
                    recommended: p.isRecommended
                })));
            } else {
                renderPlans(FALLBACK_PLANS);
            }
        })
        .catch(() => renderPlans(FALLBACK_PLANS));
    */
});

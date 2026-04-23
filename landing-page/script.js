document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Navbar Scroll Effect
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('bg-surface/80', 'backdrop-blur-2xl', 'shadow-2xl', 'shadow-black/5', 'h-16');
            nav.classList.remove('h-20');
        } else {
            nav.classList.remove('bg-surface/80', 'backdrop-blur-2xl', 'shadow-2xl', 'shadow-black/5', 'h-16');
            nav.classList.add('h-20');
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
            <div class="fade-in group p-12 rounded-[3rem] transition-all duration-500 ${plan.recommended ? 'bg-primary shadow-[0_32px_64px_-16px_rgba(116,47,229,0.3)] scale-105 z-10' : 'bg-white/5 shadow-xl border border-white/5'}" data-visible="false">
                <h3 class="text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${plan.recommended ? 'text-white/60' : 'text-primary'}">${plan.name}</h3>
                <p class="text-5xl font-black mb-2 font-display ${plan.recommended ? 'text-white' : 'text-white'}">$${plan.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span class="text-sm opacity-40 font-sans"> /mes</span></p>
                <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-12 opacity-40">${plan.desc}</p>
                
                <ul class="space-y-6 mb-12">
                    ${plan.items.map(item => `
                        <li class="flex items-center gap-4 text-xs font-bold uppercase tracking-widest ${plan.recommended ? 'text-white' : 'text-white/70'}">
                            <i data-lucide="check" class="h-4 w-4 ${plan.recommended ? 'text-white' : 'text-primary'}"></i> ${item}
                        </li>
                    `).join('')}
                </ul>
                
                <a href="https://app.prodmanager.com.ar/register" class="block text-center py-5 rounded-2xl ${plan.recommended ? 'bg-white text-primary' : 'bg-white/10 text-white hover:bg-white/20'} text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                    Comenzar ahora
                </a>
            </div>
        `).join('');

        lucide.createIcons();
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    renderPlans(FALLBACK_PLANS);
});

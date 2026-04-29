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
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://api.prodmanager.com.ar';

    async function loadPlans() {
        try {
            // Buscamos planes de la categoría IMPRESION_3D
            const response = await fetch(`${API_URL}/plans?category=IMPRESION_3D`);
            if (!response.ok) throw new Error('Failed to fetch plans');
            
            const plans = await response.json();
            
            if (plans && plans.length > 0) {
                // Mapeamos los planes del back al formato de la UI
                const mappedPlans = plans
                    .sort((a, b) => a.price - b.price)
                    .map(plan => ({
                const mappedPlans = plans
                    .sort((a, b) => a.price - b.price)
                    .map(plan => ({
                        name: plan.name,
                        price: plan.price,
                        promoPrice: plan.promoPrice,
                        promoLabel: plan.promoLabel,
                        promoDuration: plan.promoDurationMonths,
                        desc: plan.description || (plan.price === 0 ? '1 Mes de regalo' : 'Para crecer'),
                        items: [
                            `${plan.maxOrdersPerMonth === -1 || plan.maxOrdersPerMonth === 0 ? 'Pedidos ilimitados' : plan.maxOrdersPerMonth + ' pedidos / mes'}`,
                            `${plan.maxMachines} impresoras`,
                            `${plan.maxUsers} usuarios`,
                            ...(plan.metadata?.features || [])
                        ],
                        recommended: plan.isRecommended || plan.metadata?.recommended || false
                    }));
                
                renderPlans(mappedPlans);
            } else {
                renderFallback();
            }
        } catch (error) {
            console.error('Error loading plans from API:', error);
            renderFallback();
        }
    }

    function renderFallback() {
        const FALLBACK_PLANS = [
            { name: 'FREE POR SIEMPRE', price: 0, desc: 'Ideal para hobbistas y makers solitarios.', items: ['30 pedidos / mes', '1 impresora', '1 usuario'], recommended: false },
            { name: 'TALLER INICIAL', price: 12000, promoPrice: 7000, promoLabel: 'OFERTA LANZAMIENTO', promoDuration: 6, desc: 'Para pequeños talleres que empiezan a crecer.', items: ['60 pedidos / mes', '2 impresoras', '2 usuarios'], recommended: true },
            { name: 'GRANJA PRODUCCION', price: 34500, promoPrice: 20000, promoLabel: 'OFERTA LANZAMIENTO', promoDuration: 6, desc: 'Para granjas con alto volumen de produccion.', items: ['120 pedidos', '5 impresoras', '5 usuarios'], recommended: false }
        ];
        renderPlans(FALLBACK_PLANS);
    }

    function renderPlans(plans) {
        const grid = document.getElementById('pricing-grid');
        if (!grid) return;

        grid.innerHTML = plans.map(plan => `
            <div class="fade-in group p-12 rounded-[3.5rem] transition-all duration-500 ${plan.recommended ? 'bg-zinc-900 ring-4 ring-primary/20 shadow-[0_32px_64px_-16px_rgba(116,47,229,0.3)] scale-105 z-10' : 'bg-zinc-900 shadow-xl border border-white/5'}" data-visible="false">
                <div class="flex justify-between items-start mb-8">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.4em] ${plan.recommended ? 'text-primary' : 'text-white/40'}">${plan.name}</h3>
                    ${plan.recommended ? '<span class="bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</span>' : ''}
                </div>

                <div class="mb-10">
                    <div class="flex items-baseline gap-2">
                        <p class="text-5xl font-black font-display text-white tracking-tighter">
                            $${(plan.promoPrice || plan.price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <span class="text-xs opacity-40 font-sans text-white">/ mes</span>
                    </div>
                    
                    ${plan.promoPrice ? `
                        <div class="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                            <div>
                                <p class="text-[8px] font-black text-primary uppercase tracking-widest mb-1">${plan.promoLabel || 'PRECIO ESPECIAL'}</p>
                                <p class="text-lg font-black text-white">$${plan.promoPrice.toLocaleString('es-AR')} <span class="text-[9px] opacity-40 uppercase tracking-tighter">PRECIO PROMO</span></p>
                            </div>
                            <span class="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/20">${plan.promoDuration || 6} MESES</span>
                        </div>
                        <p class="text-[10px] font-bold text-white/20 line-through mt-2">Precio regular: $${plan.price.toLocaleString('es-AR')}</p>
                    ` : ''}
                </div>

                <p class="text-[10px] font-bold text-white/50 uppercase tracking-tight mb-12 h-8 leading-tight">${plan.desc}</p>
                
                <ul class="space-y-6 mb-12">
                    ${plan.items.map(item => `
                        <li class="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-white/70">
                            <i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-500"></i> ${item}
                        </li>
                    `).join('')}
                </ul>
                
                <a href="https://app.prodmanager.com.ar/register" class="block text-center py-5 rounded-2xl ${plan.recommended ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'} text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                    Comenzar ahora
                </a>
            </div>
        `).join('');

        lucide.createIcons();
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    loadPlans();
});

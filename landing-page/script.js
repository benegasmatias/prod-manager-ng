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
            <div class="fade-in group p-12 sm:p-16 rounded-[4rem] transition-all duration-700 relative overflow-hidden flex flex-col ${plan.recommended ? 'bg-text shadow-[0_80px_160px_-40px_rgba(0,0,0,0.5)] scale-100 lg:scale-105 z-10' : 'bg-surface-container-low/50 border border-border/5'}" data-visible="false">
                
                ${plan.recommended ? `
                <div class="absolute top-0 right-0 p-12">
                    <div class="h-4 w-4 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]"></div>
                </div>
                ` : ''}

                <div class="flex justify-between items-start mb-12">
                    <div class="space-y-3">
                        <h3 class="text-[11px] font-black uppercase tracking-[0.4em] italic ${plan.recommended ? 'text-primary' : 'text-text-muted/40'}">${plan.name}</h3>
                        ${plan.recommended ? '<p class="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">Protocolo Recomendado</p>' : ''}
                    </div>
                </div>

                <div class="mb-14">
                    @if (plan.promoPrice) {
                        <div class="flex flex-col gap-2">
                             <div class="flex items-baseline gap-4">
                                <span class="text-6xl sm:text-7xl font-black font-display tracking-tighter ${plan.recommended ? 'text-white' : 'text-text'} italic">
                                    $${plan.promoPrice.toLocaleString('es-AR')}
                                </span>
                                <span class="text-[10px] font-black uppercase tracking-widest ${plan.recommended ? 'text-white/40' : 'text-text-muted/40'} italic">/ Mes</span>
                             </div>
                             <div class="flex items-center gap-4 mt-2">
                                <span class="text-2xl font-black text-rose-500 line-through opacity-50 italic">$${plan.price.toLocaleString('es-AR')}</span>
                                <span class="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest italic border border-emerald-500/20">Ahorro Activo</span>
                             </div>
                        </div>
                    } @else {
                        <div class="flex items-baseline gap-4">
                            <span class="text-6xl sm:text-7xl font-black font-display tracking-tighter ${plan.recommended ? 'text-white' : 'text-text'} italic">
                                $${plan.price.toLocaleString('es-AR')}
                            </span>
                            <span class="text-[10px] font-black uppercase tracking-widest ${plan.recommended ? 'text-white/40' : 'text-text-muted/40'} italic">/ Mes</span>
                        </div>
                    }
                </div>

                <p class="text-[11px] font-bold uppercase tracking-tight mb-14 leading-relaxed italic ${plan.recommended ? 'text-white/60' : 'text-text-muted/60'}">${plan.desc}</p>
                
                <div class="space-y-8 mb-16 flex-1">
                    <h4 class="text-[9px] font-black uppercase tracking-[0.4em] ${plan.recommended ? 'text-white/20' : 'text-text-muted/20'} italic">Capacidades del Sistema</h4>
                    <ul class="space-y-6">
                        ${plan.items.map(item => `
                            <li class="flex items-start gap-6 text-[11px] font-black uppercase tracking-[0.15em] italic ${plan.recommended ? 'text-white' : 'text-text'}">
                                <div class="h-5 w-5 rounded-lg flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-text-muted/40'}">
                                    <i data-lucide="check" class="h-3 w-3"></i> 
                                </div>
                                <span class="pt-0.5">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <a href="https://app.prodmanager.com.ar/register" 
                   class="flex h-20 items-center justify-center rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic ${plan.recommended ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.03]' : 'bg-surface-container-high text-text hover:bg-surface-container-highest border border-border/5 shadow-xl shadow-text/5 hover:translate-y-[-4px]'}">
                    Sincronizar Plan
                </a>
            </div>
        `).join('');

        lucide.createIcons();
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    loadPlans();
});

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


    function renderFallback() {
        const FALLBACK_PLANS = [
            { 
                name: 'PROTOCOLO_FREE', 
                price: 0, 
                desc: 'Hobby y experimentación inicial sin costo operativo.', 
                items: ['30 pedidos / mes', '1 impresora activa', '1 usuario root', 'Gestión de materiales', 'Dashboard básico'], 
                recommended: false 
            },
            { 
                name: 'SISTEMA_TALLER', 
                price: 12000, 
                promoPrice: 7000, 
                promoLabel: 'OFERTA LANZAMIENTO', 
                promoDuration: 6, 
                desc: 'Estructura profesional para talleres en fase de expansión.', 
                items: ['60 pedidos / mes', '3 impresoras activas', '3 usuarios nexo', 'Calendario de producción', 'Reportes de eficiencia'], 
                recommended: true 
            },
            { 
                name: 'NEXO_GRANJA', 
                price: 34500, 
                promoPrice: 20000, 
                promoLabel: 'OFERTA LANZAMIENTO', 
                promoDuration: 6, 
                desc: 'Control absoluto para granjas de alto rendimiento industrial.', 
                items: ['Pedidos ilimitados', '10 impresoras activas', 'Usuarios ilimitados', 'Analítica avanzada', 'Prioridad de soporte'], 
                recommended: false 
            }
        ];
        renderPlans(FALLBACK_PLANS);
    }

    function renderPlans(plans) {
        const grid = document.getElementById('pricing-grid');
        if (!grid) return;

        grid.innerHTML = plans.map(plan => `
            <div class="fade-in group p-12 sm:p-16 rounded-[3.5rem] transition-all duration-700 relative overflow-hidden flex flex-col ${plan.recommended ? 'bg-white shadow-[0_40px_80px_-20px_rgba(25,51,87,0.1)] scale-100 lg:scale-105 z-10 border-2 border-primary/20' : 'bg-white/80 backdrop-blur-xl border border-border/10 shadow-[0_20px_40px_-10px_rgba(25,51,87,0.05)]'}" data-visible="false">
                
                ${plan.recommended ? `
                <div class="absolute top-0 right-0 p-12">
                    <div class="h-5 w-5 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"></div>
                </div>
                ` : ''}

                <div class="flex justify-between items-start mb-12">
                    <div class="space-y-3">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.4em] italic text-primary">${plan.name}</h3>
                        ${plan.recommended ? '<p class="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] italic">Protocolo Sugerido</p>' : ''}
                    </div>
                </div>

                <div class="mb-14">
                    ${plan.promoPrice ? `
                        <div class="flex flex-col gap-2">
                             <div class="flex items-baseline gap-4">
                                <span class="text-6xl sm:text-7xl font-black font-display tracking-tighter text-text italic tabular-nums">
                                    $${plan.promoPrice.toLocaleString('es-AR')}
                                </span>
                                <span class="text-[10px] font-black uppercase tracking-widest text-text-muted/40 italic">/ Mes</span>
                             </div>
                             <div class="flex items-center gap-4 mt-2">
                                <span class="text-2xl font-black text-rose-500/30 line-through italic">$${plan.price.toLocaleString('es-AR')}</span>
                                <span class="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest italic border border-primary/20 shadow-sm">Oferta Lanzamiento</span>
                             </div>
                        </div>
                    ` : `
                        <div class="flex items-baseline gap-4">
                            <span class="text-6xl sm:text-7xl font-black font-display tracking-tighter text-text italic tabular-nums">
                                $${plan.price.toLocaleString('es-AR')}
                            </span>
                            <span class="text-[10px] font-black uppercase tracking-widest text-text-muted/40 italic">/ Mes</span>
                        </div>
                    `}
                </div>

                <p class="text-[12px] font-bold uppercase tracking-tight mb-14 leading-relaxed italic text-text-muted/60">${plan.desc}</p>
                
                <div class="space-y-8 mb-16 flex-1">
                    <h4 class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/20 italic">Capacidades del Sistema</h4>
                    <ul class="space-y-6">
                        ${plan.items.map(item => `
                            <li class="flex items-start gap-6 text-[11px] font-black uppercase tracking-[0.15em] italic text-text">
                                <div class="h-5 w-5 rounded-lg flex items-center justify-center shrink-0 bg-primary/5 text-primary">
                                    <i data-lucide="check" class="h-3 w-3"></i> 
                                </div>
                                <span class="pt-0.5">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <a href="https://app.prodmanager.com.ar/register" 
                   class="flex h-20 items-center justify-center rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic bg-gradient-to-br from-primary to-primary-container text-white shadow-2xl shadow-primary/20 hover:scale-[1.03] hover:shadow-primary/40">
                    Sincronizar Plan
                </a>
            </div>
        `).join('');

        lucide.createIcons();
        grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    renderFallback();
});

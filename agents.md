Actúa como un Arquitecto Frontend Senior experto en Angular 21.

Estoy migrando una app de gestión de negocios a Angular 21. Maneja rubros como metalúrgica, impresión 3D y carpintería, y quiero que sea escalable.

No quiero microfrontends por ahora. Quiero una arquitectura modular limpia con:

* una sola app principal
* separación en core, shared, features y business
* lazy loading
* configuración por tipo de negocio
* código mantenible y escalable

Regla obligatoria: respetá siempre la separación clásica de Angular:

* `.ts`
* `.html`
* `.css` o `.scss`

No uses templates inline ni estilos inline dentro del componente, salvo que yo lo pida.

Quiero que me propongas:

* estructura de carpetas
* módulos o libs recomendadas
* organización por dominio
* rutas
* lazy loading
* estrategia para separar lo común de lo específico por rubro
* ejemplos base de implementación


No hagas cambios masivos innecesarios. Priorizá soluciones incrementales, seguras y fáciles de integrar sin romper otras pantallas.
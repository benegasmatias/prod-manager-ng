# Frontend Architectural Rules (Senior Level)

## 1. Domain Separation
- **`libs/shared/ui`**: Atomic components (Button, Input, Card). Agnostic to business logic. **Must not inject services.**
- **`libs/features/*`**: Generic business workflows (Orders, Clients, Billing).
- **`libs/business/<rubro>/*`**: Specialized rubric-specific implementations (e.g., 3D printing STL logic).

## 2. Component Logic Rules
- **Rule of No-Rubric-Leaks**: Business components in `features` must not contain `if (rubro === '...')` logic.
- **Plug-and-Play Architecture**: Use composition/strategy patterns to inject rubric-specific logic into generic feature containers.
- **Signals First**: Use Angular Signals (`signal`, `computed`, `effect`) for all reactivity. Avoid `Subject`/`BehaviorSubject` unless necessary for interop with RXJS streams.

## 3. UI Consistency
- **PageShell**: Every new page MUST wrap its content in `<app-page-shell>`.
- **Mobile-First**: Always develop for mobile breakpoints first. Use Tailwind's utility-first approach.
- **Theming**: Use semantic tokens (e.g., `text-muted`, `bg-background`). Do not hardcode HEX/RGB/HSL colors in components.

## 4. Non-Hardcoding Rules
- **Zero-String Policy**: User-facing labels must be resolved from `SIDEBAR_CONFIG`, `DASHBOARD_CONFIG`, or a localization service.
- **Action Naming**: Buttons should reflect the domain action (e.g., "Guardar Pedido") and resolved labels.

## 5. Directory Structure
- `components/`: Purely presentational or orchestration components.
- `services/`: Business logic facades.
- `models/`: Strong typing, no interfaces in component files.

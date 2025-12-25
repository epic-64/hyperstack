We are building *hyperstack*, a stack-based todolist application.
It has a simple, opinionated workflow.

It is a PWA that works fully offline.
Data is stored in IndexedDB using Dexie.js.
The UI is built from scratch with raw TypeScript, HTML and CSS (no frameworks).

Main goals:
- mega cross-platform (desktop, mobile, tablet). All you need is a modern browser.
- 100% local data storage, no cloud sync, no accounts, no tracking.
- super fast and responsive.
- safe from data loss (auto-save, versioning, export/import).
- no bloat, no nonsense.

Additional considerations:
- Code should be modular and maintainable.
- Use modern TypeScript features and best practices.
- Ensure accessibility (a11y) best practices are followed.
- Optimize for performance and low resource usage.
- Write pure functions as much as possible. (Functional Core, Imperative Shell)
- Instead of comments, write clear and self-explanatory code and unit tests.

Let's go!!!

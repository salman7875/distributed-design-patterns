# Sidecar Pattern

In simple terms, a **sidecar** is used to extend or enhance an application's functionality without modifying the core application code itself.

## When to Use It

- **Legacy System:** Update or wrap legacy applications when changing the core codebase is costly, risky or outright impossible.
- **Standardized Utilities:** Create utility services that handle concerns like (Logging, Monitoring, or Rate Limiting) consistently across multiple applications.

In this folder, I built a simple proxy server sidecar that intercepts incoming requests, logs the metadata, and forwards the payload to the main application. It's the simplest practical use case to demonstrate how a sidecar sits in the request path.

---

## Best Practices Learned

- **High Reusability:** The sidecar API should be generic and parameterized so it can be plugged into many different downstream applications.
- **Strict API Contracts:** Because the sidecar decouples functionality, its API contract must be well documented and versioned so maintainers don’t accidentally introduce breaking changes that disrupt the main application.

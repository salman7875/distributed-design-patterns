## Ambassadar Pattern

We can consider **Ambassadar Pattern** a specialized form of Sidecar Pattern. Located in the same pod or environment sharing the same namespace.

#### When to Use It

Use this pattern when you want to completely decouple your core application from hardcoded database locations, making it easy to shift environments without changing connection strings. It acts as a sidecar proxy that offloads service discovery and dynamic traffic routing away from your main codebase.

#### What this Repo contains

This prototype implements the Ambassador Pattern combined with a dynamic Service Broker to decouple a backend application from its database infrastructure. Instead of hardcoding database locations or relying on static environment variables within the main service, traffic is routed and discovered dynamically at runtime.

The Request Flow
Local Application Request: When the main service needs to query the database, it initiates a connection targeting localhost:3307 rather than connecting directly to PostgreSQL.

Ambassador Interception: An ambassador container running in the same network namespace shares that local stack and listens on port 3307, instantly intercepting the incoming TCP connection.

Service Discovery (The Control Plane): Before forwarding any traffic, the ambassador queries the service broker over an internal HTTP API (http://broker:4000/locate?q=postgres) to fetch the active configuration and target address for the database.

Transparent TCP Tunneling: Armed with the database's actual host and port returned by the broker, the ambassador establishes a secondary TCP connection to the PostgreSQL container and pipes the raw data streams bidirectionally between the main application and the database.

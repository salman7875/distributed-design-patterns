This chapter is just an introduction to micro service architecture and patterns.

Flow: Request --> Nginx (2 replicas) --> Varnish (http caching - 2 replicas) --> Nodejs Server (3 replicas).

The end goal was to get comfortable deploying stateless replicated service using k8.

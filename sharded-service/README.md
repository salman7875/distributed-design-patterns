# Sharded MemCache Proxy

This repo contains a main application that interacts with memCache Sharded into 3 services.

The Main Application makes a local repo on PORT "7777" and the proxy container running in the same network space intercept the request apply consistent hashing alogorithm and connect with the cache service.

We use consistent hashing algorithm to solve data ownership problem with minimum set of node changes when new node gets introduced or existing nodes get deleted.

## To test it locally

from root folder:

```bash
docker compose up -d
```

make request to http://localhost:3000/data/:random_id

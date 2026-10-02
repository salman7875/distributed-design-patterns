## Adapter Pattern

**Adapter Pattern** is also a single node pattern that is used to standarized the output interface of an application.

#### When to Use It

Use this pattern when you have many services providing metrics in different format and you want 1 unified structure, or when you need to validate, or transform the application's output without modifying the main application container.

#### What this Repo contains

This repository contains **3 services**, each logging data in a different format:

#### 1. Service 1 (Text Format)

```text
[2026-10-02T19:47:01.303Z] SERVICE=auth-service STATUS=OK CPU_LOAD=1.24 ACTIVE_USERS=42
```

#### Service 2 (Prometheus Format)

```
http_requests_total{method="POST",handler="/login"} 1027
http_requests_total{method="GET",handler="/health"} 5431
node_cpu_usage_ratio{core="0"} 0.34
node_cpu_usage_ratio{core="1"} 0.62
```

#### Service 3 (JSON Format)

```
{"service_name":"payment-service","timestamp":1790970388109,"status":"healthy","metrics":{"transactions_processed_count":894,"average_latency_ms":124.5,"error_rate_pct":0.02},"tags":{"environment":"production","region":"us-west-2"}}
```

#### Normalized format

```
{
 "service":"payment-service","metric":"transactions_processed_count",
 "value":894,"timestamp":1790969299894,
 "status":"healthy",
 "tags":{"environment":"production","region":"us-west-2"}
}
```

### How to Test Locally

1. Start the individual services and the adapter service.
2. Make a test call to each service endpoint:
   - `http://localhost:3000/metrics`
   - `http://localhost:3001/metrics`
   - `http://localhost:3002/metrics`

> **Note:** The adapter service watches the log folder recursively, detects changes, normalizes the state, and stores the output in a centralized log file.

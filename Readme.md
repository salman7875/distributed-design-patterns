# Scatter Gatter Pattern
This pattern runs in two phase (i.e, scatter phase and gatter phase). 

In scatter phase the cordinator server broadcast requests to multiple receipent servers. The receipent server sends the response to the cordinator server.

In gatter phase the cordinator server combines the response received from the receipents and returns the unified response

## diagram
```mermaid
flowchart TD
    Client(["Client"]) -->|"1. Sends Request"| Ingress["Receive Client Request"]

    subgraph OurServer["Our Server"]
        Ingress --> Dispatch["Dispatch Requests"]

        subgraph ScatterProcess["Scatter"]
            Dispatch -->|"Call"| Ext1["Recipient Server 1"]
            Dispatch -->|"Call"| Ext2["Recipient Server 2"]
            Dispatch -->|"Call"| Ext3["Recipient Server 3"]
            Dispatch -->|"Call"| Ext4["Recipient Server 4"]
            Dispatch -->|"Call"| Ext5["Recipient Server 5"]
        end

        subgraph GatherProcess["Gather"]
            Ext1 -->|"Response 1"| Collector["Collect Responses"]
            Ext2 -->|"Response 2"| Collector
            Ext3 -->|"Response 3"| Collector
            Ext4 -->|"Response 4"| Collector
            Ext5 -->|"Response 5"| Collector
            Collector --> Aggregator["Aggregate into Single Unified Response"]
        end
    end

    Aggregator -->|"2. Send Unified Response"| Client
```

## To run this
```
npm run dev:server  // For running main server
npm run dev:mock-server  // For running mock server
```

## Testing endpoint
```
# Main server - q = product_name, cat = product_category
curl http://localhost:3000/products?q=iphone&cat=Electronics

# Mock server -
# Main server sends the requests to mock server with this url
# q = product_name, cat = product_category, platform = products_platform, delay = miliseconds and fr = failure rate range (0 -> 0.10)
curl http://localhost:4000/products?q=iphone&cat=Electronics&platform=flipkart&delay=500&fr=0.2
```

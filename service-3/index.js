const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (req, res) => {
  if (req.url === "/metrics" || req.url === "/") {
    const jsonMetrics = {
      service_name: "payment-service",
      timestamp: Date.now(),
      status: "healthy",
      metrics: {
        transactions_processed_count: 894,
        average_latency_ms: 124.5,
        error_rate_pct: 0.02,
      },
      tags: {
        environment: "production",
        region: "us-west-2",
      },
    };

    await fs.appendFile(
      path.join(__dirname, "..", "/logs/service3-log.txt"),
      JSON.stringify(jsonMetrics) + "\n",
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonMetrics, null, 2));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = process.env.PORT ?? 3002;
server.listen(PORT, () => {
  console.log(`Service 3 (JSON Style) running on PORT: ${PORT}`);
});

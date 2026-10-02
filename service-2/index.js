const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (req, res) => {
  if (req.url === "/metrics" || req.url === "/") {
    const promMetrics = [
      'http_requests_total{method="POST",handler="/login"} 1027',
      'http_requests_total{method="GET",handler="/health"} 5431',
      'node_cpu_usage_ratio{core="0"} 0.34',
      'node_cpu_usage_ratio{core="1"} 0.62',
    ].join("\n");

    await fs.appendFile(
      path.join(__dirname, "..", "/logs/service2-log.txt"),
      promMetrics + "\n",
    );

    res.writeHead(200, {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    });
    res.end(promMetrics + "\n");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const PORT = process.env.PORT ?? 3001;
server.listen(PORT, () => {
  console.log(`Service 2 (Prometheus Style) running on PORT: ${PORT}`);
});

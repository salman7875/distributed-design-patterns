const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (req, res) => {
  if (req.url === "/metrics" || req.url === "/") {
    const timestamp = new Date().toISOString();
    const plainTextLog = `[${timestamp}] SERVICE=auth-service STATUS=OK CPU_LOAD=1.24 ACTIVE_USERS=42\n`;
    await fs.appendFile(
      path.join(__dirname, "..", "/logs/service1-log.txt"),
      plainTextLog,
    );

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(plainTextLog);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});
const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Service 1 running on PORT: ${PORT}`);
});

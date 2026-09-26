const http = require("node:http");
const url = require("node:url");

const CONFIG = {
  postgres: {
    host: "postgres",
    port: 5432,
  },
};

const httpResponse = (res, status, data) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const pathname = parseUrl.pathname;
  const method = req.method;

  if (pathname === "/health" && method === "GET") {
    return httpResponse(res, 200, { success: true, data: "Healthy!!!" });
  }

  if (pathname === "/locate" && method === "GET") {
    const serviceName = parseUrl.query.q;
    const info = CONFIG[serviceName];
    console.log(info);

    return httpResponse(res, 200, { success: true, data: info });
  }

  httpResponse(res, 404, "Route Not Found!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

const http = require("http");
const url = require("url");

const httpResponse = (res, status, data) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  if (pathname === "/health" && method === "GET") {
    return httpResponse(res, 200, { success: true, message: "Healthy!" });
  }
  if (pathname.startsWith("/data/") && method === "GET") {
    const cacheKey = pathname.replace("/data/", "");

    try {
      const cacheRes = await fetch(`http://localhost:7777/${cacheKey}`);
      const cacheData = await cacheRes.json();

      if (!cacheData || cacheData.error === "Key not found") {
        const idMatch = cacheKey.match(/\d+/);
        const id = idMatch ? parseInt(idMatch[0]) : 999;

        const dynamicData = { id: id, username: `User_${id}!!` };

        await fetch(`http://localhost:7777/${cacheKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dynamicData),
        });

        return httpResponse(res, 200, {
          success: true,
          data: dynamicData,
          source: "generated",
        });
      }

      return httpResponse(res, 200, {
        success: true,
        data: cacheData,
        source: "cache",
      });
    } catch (err) {
      console.error("Proxy communication error:", err.message);
      return httpResponse(res, 500, { success: false, message: "Cache error" });
    }
  }

  httpResponse(res, 404, { success: false, message: "Route Not found!" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

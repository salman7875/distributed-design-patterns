const http = require("node:http");
const url = require("node:url");

const httpResponse = (res, status, data) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(data);
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathName = parsedUrl.pathname;

  if (pathName === "/health" && method === "GET") {
    return httpResponse(
      res,
      200,
      JSON.stringify({ success: true, message: "Healthy!!" }),
    );
  }

  if (pathName === "/api/check-varnish" && method === "GET") {
    const xForwardedFor = req.headers["x-forwarded-for"];
    const viaHeader = req.headers["via"];
    const customVarnishHeader = req.headers["x-varnish-proxy"];

    const isProxiedThroughVarnish = Boolean(
      xForwardedFor || viaHeader || customVarnishHeader,
    );

    return httpResponse(
      res,
      200,
      JSON.stringify({
        success: true,
        varnishActive: isProxiedThroughVarnish,
        detectedHeaders: {
          "x-forwarded-for": xForwardedFor || null,
          via: viaHeader || null,
          "x-varnish-proxy": customVarnishHeader || null,
        },
        message: isProxiedThroughVarnish
          ? "Request successfully routed through Varnish Cache"
          : "Request hit Node.js directly. Varnish might not be in front or you bypassed it",
      }),
    );
  }

  return httpResponse(
    res,
    404,
    JSON.stringify({ success: false, message: "Route Not found" }),
  );
});

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

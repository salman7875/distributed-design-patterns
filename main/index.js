const http = require("http");
const url = require("url");
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 3307,
  user: "postgres",
  password: "mysecretpassword",
  database: "postgres",
});

const httpResponse = (res, status, data) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(data);
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (pathname === "/health" && method === "GET") {
    return httpResponse(res, 200, "Healthy!!!");
  }

  if (pathname === "/conn" && method === "GET") {
    try {
      const dbResult = await pool.query("SELECT NOW()");
      console.log("Database response through ambassador:", dbResult.rows[0]);

      return httpResponse(
        res,
        200,
        JSON.stringify({ success: true, time: dbResult.rows[0] }),
      );
    } catch (error) {
      console.error("Connection error:", error.message);
      return httpResponse(
        res,
        500,
        JSON.stringify({ error: error.message || "Something went wrong!" }),
      );
    }
  }
  httpResponse(res, 404, "Route Not Found!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

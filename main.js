const http = require("http");
const url = require("url");

const {
  httpResponse,
  resolveQuorom,
  urlExtracter,
  fetchData,
  formatResult,
} = require("./util");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (pathname === "/health" && method === "GET") {
    return httpResponse(res, 200, {
      success: true,
      message: "Service is Healthy!",
    });
  }

  if (pathname === "/products" && method === "GET") {
    const { q, cat } = urlExtracter(req.url);
    const promises = [
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=amazon&delay=250&fr=0.2`,
      ),
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=flipkart&delay=100&fr=0.2`,
      ),
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=zepto&delay=50&fr=0.2`,
      ),
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=swiggyInstamart&delay=2500&fr=0.2`,
      ),
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=amazon&delay=3000&fr=0.2`,
      ),
      fetchData(
        `http://localhost:4000?q=${q}&cat=${cat}&platform=amazon&delay=1000&fr=0.2`,
      ),
    ];
    try {
      const result = await resolveQuorom(promises, 3);
      if (!result) {
        throw new Error("Failed to fetch the result for the query!");
      }
      const formatedResult = formatResult(result);
      return httpResponse(res, 200, {
        success: true,
        message: "Success!",
        data: formatedResult,
      });
    } catch (error) {
      return httpResponse(res, 500, {
        success: false,
        message: "Something went wrong!",
        error,
      });
    }
  }

  httpResponse(res, 404, { success: false, message: "No Route Found!" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

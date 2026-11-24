const http = require("http");
const url = require("url");

const { httpResponse, urlExtracter, filterData } = require("./util");
const { data } = require("./data");

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

  if (pathname === "/" && method === "GET") {
    const queryMap = urlExtracter(req.url);

    if (!queryMap) {
      return httpResponse(res, 400, {
        success: false,
        message: "Missing query fields!",
      });
    }

    const delay = queryMap["delay"];
    await new Promise((resolve) => setTimeout(resolve, delay));

    const failureRate = queryMap["fr"];
    if (Math.random() < failureRate) {
      return httpResponse(res, 500, {
        success: false,
        message: "Something went wrong!",
        data: [],
      });
    }

    const filtered = filterData(data, queryMap);

    return httpResponse(res, 200, {
      success: true,
      message: "Success!",
      data: filtered,
    });
  }

  httpResponse(res, 404, { success: false, message: "No Route Found!" });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Mocker Server running on PORT: ${PORT}`);
});

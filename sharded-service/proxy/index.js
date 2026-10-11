const net = require("net");
const { ConsistentHash } = require("./consistent-hashing");

const nodeLists = [
  { host: "sharded-service-cache-server-1-1", port: 11211 },
  { host: "sharded-service-cache-server-2-1", port: 11212 },
  { host: "sharded-service-cache-server-3-1", port: 11213 },
];

const ch = new ConsistentHash(3);
const nodeLookUp = {};

nodeLists.forEach((node) => {
  const identifier = `${node.host}:${node.port}`;
  nodeLookUp[identifier] = node;
  ch.addNode(identifier);
});

const server = net.createServer((socket) => {
  let dataBuffer = "";

  socket.on("data", (chunk) => {
    dataBuffer += chunk.toString();

    if (dataBuffer.includes("\r\n\r\n") || dataBuffer.includes("\n\n")) {
      const match = dataBuffer.match(/(GET|POST)\s+\/([^\s]+)/);

      if (match) {
        const method = match[1];
        const cacheKey = match[2];
        console.log(`Received ${method} for key: ${cacheKey}`);

        const targetIdentifier = ch.getNode(cacheKey);
        const targetNode = nodeLookUp[targetIdentifier];

        console.log(
          `Routing key ${cacheKey} to node -> ${targetNode.host}:${targetNode.port}`,
        );

        const memStream = net.connect(
          { port: targetNode.port, host: targetNode.host },
          () => {
            if (method === "GET") {
              memStream.write(`get ${cacheKey}\r\n`);
            } else if (method === "POST") {
              const parts = dataBuffer.split(/\r\n\r\n|\n\n/);
              const body = parts[1] || "";

              memStream.write(
                `set ${cacheKey} 0 0 ${Buffer.byteLength(body)}\r\n${body}\r\n`,
              );
            }
          },
        );

        let memData = "";
        memStream.on("data", (data) => {
          memData += data.toString();

          if (memData.includes("END\r\n") || memData.includes("STORED\r\n")) {
            let responseBody;

            if (method === "GET") {
              if (memData.includes("VALUE")) {
                const lines = memData.split("\r\n");
                responseBody = lines[1];
              } else {
                responseBody = JSON.stringify({ error: "Key not found" });
              }
            } else {
              responseBody = JSON.stringify({
                success: memData.includes("STORED"),
              });
            }

            const httpResponse =
              `HTTP/1.1 200 OK\r\n` +
              `Content-Type: application/json\r\n` +
              `Content-Length: ${Buffer.byteLength(responseBody)}\r\n` +
              `\r\n` +
              responseBody;

            socket.end(httpResponse);
            memStream.end();
          }
        });

        memStream.on("error", (err) => {
          console.error("Cache server socket error:", err.message);
          socket.end();
        });
      } else {
        socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Client socket error:", err.message);
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
  console.log(`Ambassador TCP proxy listening on PORT: ${PORT}`);
});

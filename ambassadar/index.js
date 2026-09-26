const net = require("node:net");

const server = net.createServer(async (socket) => {
  console.log("Client Socket Connected!");

  try {
    const response = await fetch("http://broker:4000/locate?q=postgres");
    const resData = await response.json();

    console.log("Broker Response:", resData);

    if (!resData.success) {
      console.error("Failed to find database location from broker.");
      socket.end();
      return;
    }

    const realDbSocket = net.createConnection(
      {
        host: resData.data.host,
        port: resData.data.port,
      },
      () => {
        console.log(
          `Connected to actual Postgres at ${resData.data.host}:${resData.data.port}!`,
        );
      },
    );

    socket.pipe(realDbSocket);

    realDbSocket.pipe(socket);

    realDbSocket.on("error", (err) => {
      console.error("Database connection error:", err.message);
      socket.end();
    });
  } catch (error) {
    console.log(error);
    console.error("Error communicating with service broker:", error.message);
    socket.end();
  }

  socket.on("error", (err) => {
    console.error("Client socket error:", err.message);
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3307;
server.listen(PORT, () => {
  console.log(`Ambassador TCP proxy listening on PORT: ${PORT}`);
});

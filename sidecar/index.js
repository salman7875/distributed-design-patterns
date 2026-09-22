import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const MAIN_APP_URL = process.env.MAIN_APP_URL ?? "http://localhost:4000";

app.all("/api/*path", async (req, res) => {
  console.log(
    `[Sidecar Audit] Intercepted ${req.method} request to ${req.path}`,
  );
  console.log(`[Sidecar Audit] Headers:`, req.headers);

  req.headers["x-sidecar-processed-at"] = new Date().toISOString();

  try {
    const response = await axios({
      method: req.method,
      url: `${MAIN_APP_URL}${req.path}`,
      data: req.body,
      headers: req.headers,
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Sidecar forwarding failed", err });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Sidecar Proxy Server running on PORT: ${PORT}`);
});

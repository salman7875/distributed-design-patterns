import express from "express";

const app = express();

app.post("/api/dummy", (req, res) => {
  console.log("[Main App] Received payload:", req.body);
  res.status(201).json({ status: "Success", data: req.body });
});

app.get("/api/dummy", (req, res) => {
  console.log("[Main App] Fetching Data!");
  res
    .status(200)
    .json({ status: "Success", data: [{ id: 1, title: "DUMMY" }] });
});

app.get("/api", (req, res) => {
  console.log("[Main App] Send request to /dummy endpoint");
  res
    .status(200)
    .json({ status: "Success", data: "Send request to /dummy endpoint" });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Main App running on port ${PORT}`));

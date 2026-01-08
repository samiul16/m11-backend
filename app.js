const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors");

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ success: true, message: "Login working" });
});

app.listen(PORT, () => {
  console.log(`🚀 Express running on port ${PORT}`);
});

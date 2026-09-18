const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const path = require("path");

const authRouter = require("./routes/auth");

require("dotenv").config();

const pool = require("./db");
const membersRouter = require("./routes/members");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/members", membersRouter);
app.use("/api/auth", authRouter);
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "not connected",
    });
  }
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
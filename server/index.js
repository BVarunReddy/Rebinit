const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("ReBinIt API running"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/reports", require("./routes/reports.routes"));
app.use("/api/recycling", require("./routes/recycling.routes"));
app.use("/api/rewards", require("./routes/rewards.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/map", require("./routes/map.routes"));
app.use("/api/listings", require("./routes/listings.routes"));
app.use("/api/notifications", require("./routes/notifications.routes"));
app.use("/api/redemptions", require("./routes/redemptions.routes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

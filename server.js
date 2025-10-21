const express = require("express");
const cors = require("cors");
const routes = require("./routes/stringRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes correctly
app.use("/strings", routes);

// Base route
app.get("/", (req, res) => {
  res.send("String Analyzer Service is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

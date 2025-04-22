const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/configs/database");

require("dotenv").config();

const port = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

const { start } = require("./app");

start().catch((error) => {
  console.error("Server failed", error);
  process.exit(1);
});

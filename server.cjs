import("./server.js")
  .then((module) => {
    const app = module.default;
    // If app.listen is used in server.js, no need to do anything here
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

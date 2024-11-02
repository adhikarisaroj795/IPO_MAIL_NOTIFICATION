const app = require("./api/app");
const connectDb = require("./api/utils/dbConfig");
app.get("/test", (req, res) => {
  res.json("test passed");
});
const port = process.env.PORT || 2050;
connectDb();
app.listen(port (err) => {
  if (err) {
    console.error("error in server", err);
    return;
  } else {
    console.log(
      `server connected tp the PORT ${process.env.PORT} on ${process.env.NODE_ENV}`
    );
  }
});

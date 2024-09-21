const express = require("express");
const AppError = require("./utils/appError");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/images", express.static("images"));

app.use(require("body-parser").json());
app.use(morgan("dev"));
app.use("/admin", require("./routes/admin/adminRouter"));
// app.use('/guest', require('./routes/guest/guestRouter'));

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(require("./controllers/errController"));

module.exports = app;

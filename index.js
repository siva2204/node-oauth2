const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/auth");
const keyRoutes = require("./Routes/keyRoute");
const { secret, server, dbname } = require("./env");

const port = 5000;

//DB connection
mongoose
  .connect(`mongodb://${server}/${dbname}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error" + err);
  });

//bodyParser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//session middleware
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

//Routes middleware
app.use("/oauth2/oidc/", authRoutes);
app.use("/oauth2/oidc/keys/", keyRoutes);

app.listen(port, () => {
  console.log(`authorisation server listening on http://localhost:${port}`);
});

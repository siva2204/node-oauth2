const express = require("express");
const app = express();
const session = require("express-session");

const authRoutes = require("./Routes/auth");
const { secret } = require("./env");

const port = 5000;

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

app.get("/", (req, res) => {
  res.send("<h1 style ='text-align:center;'>openidconnect in action</h1>");
});

//Routes middleware
app.use("/oauth2/oidc/", authRoutes);

app.listen(port, () => {
  console.log(`authorisation server listening on http://localhost:${port}`);
});

const express = require("express");
const app = express();

const port = 5000;

//bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`authorisation server listening to port ${port}`);
});

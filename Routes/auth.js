const express = require("express");
const router = express.Router();
const cryptoRandomString = require("crypto-random-string");
const { URL } = require("url");
const { clients, codes } = require("../env.js");

//The authorisation endpoint(authorising client)
router.get("/authorise", (req, res) => {
  const {
    client_id,
    response_type,
    scope,
    state,
    redirect_uri,
    nounce,
  } = req.query;
  //searching client from database
  const client = clients.find((client) => client_id == client.client_id);

  if (!client) {
    res.status(401).json({ error: "unknown client" });
  } else if (client.redirect_uri != redirect_uri) {
    res.status(400).json({ error: "invalid redirect uri" });
  } else {
    //save the search query in session
    req.session.query = req.query;
    res.status(200).send("client identified successfully!");
  }
});

// resource owner authentication and sending code back to the client
router.post("/approve", (req, res) => {
  /* Authenticating resource owner here */

  let query = req.session.query;

  // deleting the session
  req.session.destroy((error) => {
    if (error) {
      throw new Error(error);
    }
    console.log("Session Destroyed");
  });

  if (!query) {
    res.status(401).json({ error: "unknown client" });
    return;
  }

  if (query.response_type == "code") {
    let code = cryptoRandomString({ length: 25, type: "url-safe" });
    // need to save code with query object in database
    codes[code] = { request: query };
    console.log(codes);
    const urlParsed = buildUrl(query.redirect_uri, {
      code: code,
      state: query.state,
    });
    res.redirect(urlParsed);
  } else {
    const urlParsed = buildUrl(query.redirect_uri, {
      error: "unsupported response type",
    });
    res.redirect(urlParsed);
  }
});

//building url with search params
function buildUrl(uri, searchparams) {
  const myUrl = new URL(uri);
  for (const property in searchparams) {
    myUrl.searchParams.append(property, searchparams[property]);
  }

  return myUrl;
}

module.exports = router;

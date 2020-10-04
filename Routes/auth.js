const express = require("express");
const router = express.Router();
const cryptoRandomString = require("crypto-random-string");
const { URL } = require("url");
const { clients, codes } = require("../env.js");

//The authorisation endpoint(authorising client)
router.get("/authorize", (req, res) => {
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
    res.status(401).json({ error: "invalid client" });
    return;
  }

  if (client.redirect_uri != redirect_uri) {
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

//token endpoint (returns id token)
router.post("/token", (req, res) => {
  //authorization headers
  const auth = req.headers["authorization"];

  if (!auth) {
    res.status(400).json({ error: "authorization header missing" });
    return;
  }

  // decoding base64 encoded basic authorization headers
  const [clientId, clientSecret] = decodeClientCredential(auth);
  const client = clients.find((client) => clientId == client.client_id);

  //client authentication
  if (!client && client.client_secret != clientSecret) {
    res.status(401).json({ error: "invalid client" });
    return;
  }

  if (req.body.grant_type == "authorization_code") {
    // getting back the saved code from database
    const code = codes[req.body.code];
    if (code) {
      // deleting the code from DB
      delete codes[req.body.code];

      if (code.request.client_id == clientId) {
        /* send back id_token */
        let id_token, response;
        id_token = cryptoRandomString({ length: 25, type: "url-safe" });
        response = { id_token: id_token };
        res.status(200).json(response);
      } else {
        // clientId mismatch
        res.status(400).json({ error: "invalid grant" });
      }
    } else {
      //unknown code
      res.status(400).json({ error: "invalid grant" });
    }
  } else {
    res.status(400).json({ error: "unsupported grant_type" });
    return;
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

//decodes base64 authorization headers
function decodeClientCredential(auth) {
  let encodedString = auth.split(" ")[1];
  let bufferObj = Buffer.from(encodedString, "base64");
  let decodedString = bufferObj.toString("utf8").split(":");
  return decodedString;
}

module.exports = router;

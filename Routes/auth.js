const express = require("express");
const router = express.Router();
const { JWK, JWT } = require("jose");
const cryptoRandomString = require("crypto-random-string");
const { URL } = require("url");
const { clients, codes, users } = require("../env.js");
const { privateJWK } = require("../Keys/key");

//The authorisation endpoint(authorising client)
router.get("/authorize", (req, res) => {
  const {
    client_id,
    response_type,
    scope,
    state,
    redirect_uri,
    nonce,
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
  //authenticating resource owner
  const [email, password] = [req.body.email, req.body.password];
  if (!email && !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }

  const user = users.find((user) => email == user.email);

  if (!user) {
    res.status(401).json({ error: "email not registered" });
    return;
  }

  if (password != user.password) {
    res.status(401).json({ error: "incorrect password" });
    return;
  }

  let query = req.session.query;
  // deleting the session
  req.session.destroy((error) => {
    if (error) throw new Error(error);
  });

  if (!query) {
    res.status(401).json({ error: "unknown client" });
    return;
  }

  if (query.response_type == "code") {
    let code = cryptoRandomString({ length: 25, type: "url-safe" });
    // need to save code with query object in database
    codes[code] = { request: query, user: user };
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

  //client authorization
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
        let scope = code.request.scope.split(" ");
        /* send back id_token */
        if (arrayInclude(scope, "openid")) {
          let payload = {
            sub: code.user.id,
            nonce: code.request.nounce,
          };
          //email scope
          if (arrayInclude(scope, "email")) {
            payload.email = code.user.email;
            payload.email_verified = true;
          }
          //profile scope
          if (arrayInclude(scope, "profile")) {
            payload.name = code.user.name;
          }
          const id_token = JWT.sign(payload, JWK.asKey(privateJWK), {
            audience: clientId,
            issuer: "http://localhost:5000",
            expiresIn: "10 m",
            header: {
              typ: "JWT",
            },
          });
          res.status(200).json({ id_token });
        } else {
          res.status(400).json({ error: "invalid_scope" });
        }
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

//Array Include function
function arrayInclude(array, item) {
  return array.includes(item);
}

module.exports = router;

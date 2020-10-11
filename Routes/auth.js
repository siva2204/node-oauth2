const express = require("express");
const router = express.Router();
const { JWK, JWT } = require("jose");
const { nanoid } = require("nanoid");
const { URL } = require("url");
const { privateJWK } = require("../Keys/key");
const Code = require("../Models/Code");
const Client = require("../Models/Client");
const ResourceOwner = require("../Models/ResourceOwner");

//The authorization endpoint(authorising client)
router.get("/authorize", async (req, res) => {
  const {
    client_id,
    response_type,
    scope,
    state,
    redirect_uri,
    nonce,
  } = req.query;

  //searching client from database
  const client = await Client.findOne({ clientId: client_id });

  if (!client) {
    res.status(401).json({ error: "invalid client" });
    return;
  }

  if (client.redirectUri != redirect_uri) {
    res.status(400).json({ error: "invalid redirect uri" });
  } else {
    //save the search query in session
    req.session.query = req.query;
    res
      .status(200)
      .send(
        "client identified successfully, Resourceowner can authenticate now!"
      );
  }
});

// resource owner authentication and sending code back to the client
router.post("/approve", async (req, res) => {
  //authenticating resource owner
  const { email, password } = req.body;

  if (!email && !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }

  const user = await ResourceOwner.findOne({ email: email });

  if (!user) {
    res.status(401).json({ error: "email not registered" });
    return;
  }

  if (password != user.password) {
    res.status(401).json({ error: "incorrect password!" });
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
    let randomString = nanoid(30);

    // saving the code with query object in DB
    let code = new Code({
      code: randomString,
      userId: user.id,
      clientId: query.client_id,
      scope: query.scope,
      state: query.state,
      redirectUri: query.redirect_uri,
    });

    if (query.nonce) {
      code.nonce = query.nonce;
    }

    await code.save();
    const urlParsed = buildUrl(query.redirect_uri, {
      code: randomString,
      state: query.state,
    });
    // redirecting to client with code and state
    res.redirect(urlParsed);
  } else {
    const urlParsed = buildUrl(query.redirect_uri, {
      error: "unsupported response type",
    });
    res.redirect(urlParsed);
  }
});

//token endpoint (returns id token)
router.post("/token", async (req, res) => {
  //authorization headers
  const auth = req.headers["authorization"];

  if (!auth) {
    res.status(400).json({ error: "authorization header missing" });
    return;
  }

  // decoding base64 encoded basic authorization headers
  const [clientId, clientSecret] = decodeClientCredential(auth);
  const client = Client.findById(clientId);

  //client authorization
  if (!client && client.client_secret != clientSecret) {
    res.status(401).json({ error: "invalid client" });
    return;
  }

  if (req.body.grant_type == "authorization_code") {
    // getting back the saved code from database
    const code = await Code.findOne({ code: req.body.code });
    if (code) {
      // deleting the code from DB
      await code.remove();

      if (code.clientId == clientId) {
        let scope = code.scope.split(" ");
        const user = await ResourceOwner.findById(code.userId);
        /* send back id_token */
        if (arrayInclude(scope, "openid")) {
          let payload = {
            sub: user.id,
            nonce: user.nonce,
            auth_time: code.date,
          };
          //email scope
          if (arrayInclude(scope, "email")) {
            payload.email = user.email;
            payload.email_verified = true;
          }
          //profile scope
          if (arrayInclude(scope, "profile")) {
            payload.name = user.name;
          }
          const id_token = JWT.sign(payload, JWK.asKey(privateJWK), {
            audience: clientId,
            issuer: "http://localhost:5000",
            expiresIn: "5 m",
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

# webmailOauth

## oauth2 + oidc

The OAuth 2.0 authorization framework enables a third-party application to obtain lim-
ited access to an HTTP service, either on behalf of a resource owner by orchestrating an
approval interaction between the resource owner and the HTTP service, or by allowing the
third-party application to obtain access on its own behalf.

> **simple authorization server instance built in nodejs which supports authorization code flow**

---

## Authorization Code Flow

![authorization code flow dance](https://19yw4b240vb03ws8qm25h366-wpengine.netdna-ssl.com/wp-content/uploads/What-is-OpenID-Connect-flow-graphic-2.jpg)

_in our case token end point returns id_token only_

**Authorization Endpoint**

```HTTP
GET /oauth2/oidc/authorize?client_id=oauth-client-1&response_type=code&state=helloworld&scope=openid email profile&redirect_uri=http://localhost:5001/callback&nounce=dsvfdrbddafgrwefwfegfdfe HTTP/1.1
Host: localhost:5000

```

**approve endpoint**

```HTTP
POST /oauth2/oidc/approve HTTP/1.1
Host: localhost:5000
Content-Type: application/x-www-form-urlencoded

email=103119100@nitt.edu.in&password=nitt123
```

**token endpoint**

```HTTP
POST /oauth2/oidc/token HTTP/1.1
Host: localhost:5000
Authorization: Basic (clientId:clientSecret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=MVv9CpuWfgDzL2L7_wBQkrPNT3bnGM
```

**key endpoint**

```HTTP
GET /oauth2/oidc/keys HTTP/1.1
Host: localhost:5000
```

---

**_create env.js file,copy everything from env.example.js to it_**

```BASH
npm install

npm start
```

**_to populate database_**

```BASH
cd seed/

node seed
```

_you can also import .csv file_

**_client_**

```BASH
cd client/

node index
```

**_jwk_**

you can create your set of jwk using jose library

```Javascript
const { JWK: { generateSync } } = require('jose');

const key = generateSync('RSA', 2048, { use: 'sig', alg: 'RS256' });

const publicJwk = key.toJWK();

const privateJwk = key.toJWK(true)

```

---

> ## Dependencies:

- express
- express-session
- mongoose
- nanoid
- jose

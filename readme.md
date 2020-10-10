# oauth2 + openidconnect

**simple authorization server instance built in nodejs which supports authorization code flow**

---

![authorization code flow dance](https://miro.medium.com/max/700/1*Pxdsn71Qm1liZu6glfvjag.png)

_in our case token end point returns id_token only_

> **Authorization Endpoint**

```HTTP
GET /oauth2/oidc/authorize?client_id=oauth-client-1&response_type=code&state=helloworld&scope=openid email profile&redirect_uri=http://localhost:5001/callback&nounce=dsvfdrbddafgrwefwfegfdfe HTTP/1.1
Host: localhost:5000

```

> **approve endpoint**

```HTTP
POST /oauth2/oidc/approve HTTP/1.1
Host: localhost:5000
Content-Type: application/x-www-form-urlencoded

email=1@1.in&password=*****
```

> **token endpoint**

```HTTP
POST /oauth2/oidc/token HTTP/1.1
Host: localhost:5000
Authorization: Basic (clientId:clientSecret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=MVv9CpuWfgDzL2L7_wBQkrPNT3bnGM
```

> **key endpoint**

```HTTP
GET /oauth2/oidc/keys HTTP/1.1
Host: localhost:5000
```

---

_create env.js file,copy everything from env.example.js to it_

```BASH
npm install

npm start
```

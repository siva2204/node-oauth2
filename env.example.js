const clients = [
  {
    client_id: "oauth-client-1",
    client_secret: "oauth-client-secret-1",
    redirect_uri: "http://localhost:5001/callback",
  },
];
//DB server
const server = "127.0.0.1:27017";
//DB name
const dbname = "oauth";

const users = [
  {
    id: "1",
    name: "1",
    email: "1@1.in",
    password: "1",
  },
  {
    id: "2",
    name: "2",
    email: "2@2.in",
    password: "2",
  },
];

const secret =
  "sD9x991M9JLLn0cJ9z7fJCoQ4pCBLVwnvrRWZX6JVJPmB440HSjPpmZPzmjtjpyv7yNVS2k4voRGh7MuDIxRsY19aHsy1cFn+kA0+Rn7Z6rpZZSXA3MlQcSfdZ8yOZc8";

module.exports = {
  clients,
  secret,
  users,
  server,
  dbname,
};

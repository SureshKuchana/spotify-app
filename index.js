require("dotenv").config();
const { default: axios } = require("axios");
const express = require("express");
const qs = require("querystring");

const app = express();
const PORT = 8888;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SPOTIFY_AUTHZ = process.env.SPOTIFY_AUTHZ;
const SPOTIFY_TOKEN = process.env.SPOTIFY_TOKEN;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  const querystring = qs.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: "user-read-private user-read-email",
    redirect_uri: REDIRECT_URI,
    state: Math.random().toString(16).substr(0, 16),
  });
  res.redirect(`${SPOTIFY_AUTHZ}?${querystring}`);
});

app.get("/callback", (req, res) => {
  const code = req.query.code || "";
  axios({
    method: "post",
    url: SPOTIFY_TOKEN,
    data: qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);

        // const { refresh_token } = response.data;
        // axios
        //   .get(`${SPOTIFY_REFRESH_TOKEN}=${refresh_token}`, {})
        //   .then((response) => {
        //     res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
        //   })
        //   .catch((error) => {
        //     res.send(error);
        //   });
      } else {
        res.send(response);
      }
    })
    .catch((error) => {
      console.log("error ", error);
      res.send(error);
    });
});

app.get("/refresh_token", function (req, res) {
  let { refresh_token } = req.query;

  axios
    .post({
      method: "post",
      url: SPOTIFY_TOKEN,
      data: qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${new Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    })
    .then((response) => {
      res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(PORT, () => {
  console.log(`Express app listening on PORT http://localhost:${PORT}`);
});

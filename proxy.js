const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/api/",
  createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
  })
);

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
  })
);

app.listen(5000);
console.log("Reverse proxy listening at http://localhost:5000");

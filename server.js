const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();


app.use(express.static(path.join(__dirname, "frontend")));


app.use(
  ["/login", "/register", "/campaigns"],
  createProxyMiddleware({
  target: "https://campaign-project-2-fp1u.onrender.com",
  changeOrigin: true,
})

);


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Frontend server running on port ${PORT}`));

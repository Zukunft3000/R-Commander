const express = require("express")

const server = express()

server.all("/", (req, res) => {
  res.send("Nothing here ! (* ^ ω ^)")
})

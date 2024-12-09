const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
app.use(cors());
const server = http.createServer(app);

const formsRouter = require("./router/forms");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/form", formsRouter);
app.get("/", (req, res) => res.send("hello"));

server.listen(3001, async () => {
	console.log(`server started on port 3001`);
});

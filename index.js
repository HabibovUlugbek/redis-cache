const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");

const app = express();

const port = 3000;
const client = new Redis();

client.on("error", (error) => {
	console.error(error);
});

app.get("/repos/:username", (req, res) => {
	try {
		const username = req.params.username;

		// Check the redis store for the data first
		client.get(username, async (err, repos) => {
			// console.log(123, err);
			console.log(repos);
			if (repos) {
				// console.log("enter");
				return res.status(200).send({
					error: false,
					message: `repos for ${username} from the cache`,
					data: repos,
				});
			} else {
				// When the data is not found in the cache then we can make request to the server

				const repos = await axios
					.get(`https://api.github.com/users/${username}`)
					.then((res) => res.data.public_repos)
					.catch((err) => console.log(123323, err));
				// console.log(333, repos);

				// save the record in the cache for subsequent request
				client.setex(username, 1440, repos);

				// return the result to the client
				return res.status(200).send({
					error: false,
					message: `repos for ${username} from the server`,
					data: repos,
				});
			}
		});
	} catch (error) {
		console.log(23131, error);
	}
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

module.exports = app;

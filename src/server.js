
const http = require('http'),
	Response = require('./response.js'),
	Request = require('./request.js');

class Server {

	constructor(port) {
		this.port = Number(port);
		this.handle = [];
	}

	create(cd) {
		return new Promise((resolve) => {
			let server = http.createServer((req, res) => {
				return cd(new Request(req), new Response(res));
			}).listen(this.port, () => {
				resolve(server);
			});
			this.handle.push(server);
		});
	}

	stop() {
		let wait = [];
		for (let i in this.handle) {
			((h) => {
				wait.push(new Promise((resolve) => {
					h.close(resolve());
				}));
			})(this.handle[i]);
		}
		return Promise.all(wait);
	}

}

module.exports = Server;

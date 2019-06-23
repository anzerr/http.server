
const http = require('http'),
	url = require('url'),
	Response = require('./response.js'),
	Request = require('./request.js');

class Server {

	constructor(port) {
		if (typeof port === 'number' && !Number.isNaN(port)) {
			this.uri = url.parse(`http://localhost:${port}`);
			this.port = Number(port);
		} else {
			this.uri = url.parse((port.match(/^.*?:\/\//)) ? port : 'http://' + port);
			this.port = this.uri.port;
		}
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

	close() {
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

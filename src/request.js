
class Request {

	constructor(req) {
		this._req = req;
	}

	url() {
		let u = this._req.url.split('?')[0];
		return ('/' + u).replace(/\/{2,}/g, '/');
	}

	origin() {
		return this._req.headers.host;
	}

	headers(key) {
		if (key) {
			return this._req.headers[key];
		}
		return this._req.headers;
	}

	token() {
		return this._req.headers && this._req.headers.authorization ? this._req.headers.authorization : '';
	}

	method() {
		return this._req.method;
	}

	remote() {
		return {
			ip: this._req.connection.remoteAddress
		};
	}

	req() {
		return this._req;
	}

	data() {
		return new Promise((resolve) => {
			let body = [];
			this._req.on('data', (data) => {
				body.push(data);
			}).on('end', () => {
				resolve(Buffer.concat(body));
			});
		});
	}

}

module.exports = Request;

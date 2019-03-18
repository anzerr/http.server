
const url = require('url'),
	querystring = require('querystring');

const copy = (a) => {
	let o = {};
	for (let i in a) {
		o[i] = a[i];
	}
	return o;
};

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

	query() {
		return url.parse(this._req.url).query;
	}

	data() {
		return new Promise((resolve) => {
			let body = [];
			this._req.on('data', (data) => {
				body.push(data);
			}).on('end', () => {
				let buff = Buffer.concat(body);
				let content = this.headers('content-type') || '';
				if (content.match('json')) {
					try {
						return resolve(copy(JSON.parse(buff.toString())));
					} catch(e) {
						return resolve(buff);
					}
				}
				if (content.match('application/x-www-form-urlencoded')) {
					try {
						return resolve(copy(querystring.parse(buff.toString())) || buff);
					} catch(e) {
						return resolve(buff);
					}
				}
				return resolve(buff);
			});
		});
	}

}

module.exports = Request;

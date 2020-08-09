
const url = require('url'),
	copy = require('clone.util'),
	querystring = require('querystring');

class Request {

	constructor(req) {
		this._req = req;
		let o = {};
		for (let i in this._req.headers) {
			o[i.toLowerCase()] = this._req.headers[i];
		}
		this._req.headers = o;
		const h = this.headers('X-Forwarded-For');
		try {
			this._ip = (h && typeof h === 'string') ? h.match(/(.*?)(\,\s|$)/)[1] : this._req.connection.remoteAddress;
		} catch (e) {
			this._ip = this._req.connection.remoteAddress;
		}
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
			return this._req.headers[key.toLowerCase()];
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
		return {ip: this._ip};
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

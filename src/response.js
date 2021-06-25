
const mime = require('mime.util'),
	events = require('events')
	is = require('type.util');

let cid = 0;

class Response extends events {

	constructor(res, req) {
		super();
		this._res = res;

		this.headersSent = false;
		this._status = 200;
		this._head = {};
		this.set({
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': req.headers.origin || '*',
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
		});
		this._cid = (cid = (cid + 1) % Number.MAX_SAFE_INTEGER);
		this._start = process.hrtime();
	}

	append(field, value) {
		this._head[field] = value;
		return this;
	}

	set(field, value) {
		if (is.object(field)) {
			for (let i in field) {
				this._head[i.toLowerCase()] = field[i];
			}
		} else {
			this._head[field.toLowerCase()] = value;
		}
		return this;
	}

	status(code) {
		this._status = code;
		return this;
	}

	type(type) {
		return mime.lookup(type);
	}

	end(data, encoding) {
		this.headersSent = true;
		this._res.end(data, encoding, () => {
			const end = process.hrtime(this._start);
			this.emit('end', {stream: false, cid: this._cid, ms: ((end[0] * 1e9 + end[1]) / 1e6)});
		});
		return this;
	}

	get(field) {
		return this._head[field];
	}

	json(body, format = false) {
		let json = format ? JSON.stringify(body, null, '\t') : JSON.stringify(body);
		return (this.set({
			'Content-Type': mime.lookup('json')
		}).send(json || ''));
	}

	send(body) {
		if (this.headersSent) {
			throw new Error('can\'t send two response');
		}
		if (!is.string(body) && !Buffer.isBuffer(body)) {
			throw new Error(`Send input is not a string or buffer is type "${typeof body}" "${(body && body.constructor) ? body.constructor.name : null}"`);
		}
		this.set('Content-Length', Buffer.byteLength(body));
		this._res.writeHead(this._status, this._head);
		this._res.write(body);
		this.end();
		return this;
	}

	pipe(stream) {
		this._res.writeHead(this._status, this._head);
		this.headersSent = true;
		stream.pipe(this._res).on('finish', () => {
			const end = process.hrtime(this._start);
			this.emit('end', {stream: true, cid: this._cid, ms: ((end[0] * 1e9 + end[1]) / 1e6)});
		});
		return this;
	}

	raw(body) {
		return this.send(body);
	}

}

module.exports = Response;

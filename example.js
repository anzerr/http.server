
const {Server} = require('./index.js'),
	querystring = require('querystring'),
	fs = require('fs'),
	assert = require('assert'),
	http = require('http');

(() => {
	let a = new Server(3670);
	let b = new Server('http://localhost:3670');
	let c = new Server('localhost:3670');
	assert.equal(a.port, b.port);
	assert.equal(b.port, c.port);

	assert.equal(a.uri.host, b.uri.host);
	assert.equal(b.uri.host, c.uri.host);

	assert.equal(a.uri.href, b.uri.href);
	assert.equal(b.uri.href, c.uri.href);
})();

let s = new Server(3670);
s.create((req, res) => {
	console.log('req meta', req.method(), req.url(), req.origin(), req.remote(), req.query());
	res.on('end', (res) => {
		console.log('end', res);
	})
	req.data().then((data) => {
		console.log('req data', data);
		if (data && data.stream) {
			res.pipe(fs.createReadStream('./package.json'));
		} else {
			res.status(200).send(':)');
		}
	});
}).then(() => {
	console.log('started server');
});

const data = [
	querystring.stringify({query: 'SELECT name FROM user WHERE uid = me()', well: 'hello'}),
	JSON.stringify({this: 'cat', can: 'go', over: 'the', wall: ':)'}),
	'wrong',
	'wrong',
	JSON.stringify({this: 'cat', stream: true}),
];
const header = [
	{'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data[0])},
	{'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data[1])},
	{'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data[2])},
	{'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data[3])},
	{'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data[4])}
];

let i = 0;
let query = () => {
	return new Promise((resolve) => {
		let r = http.request({
			hostname: 'localhost',
			port: 3670,
			path: '/' + Math.random() + '?a=' + Math.random(),
			method: 'POST',
			headers: header[i % header.length]
		}, (res) => {
			i += 1;
			const out = []
			res.on('data', (res) => out.push(res)).on('end', () => {
				console.log('out', Buffer.concat(out));
				resolve();
			});
		}).on('error', () => resolve());
		r.write(data[i % data.length]);
		r.end();
	});
};

let run = (i) => {
	if (i > 10) {
		s.close();
		return;
	}
	query().then(() => {
		setTimeout(() => run(i + 1), 100);
	});
};
run(0);

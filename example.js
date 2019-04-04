
const {Server} = require('./index.js'),
	querystring = require('querystring'),
	http = require('http');

let s = new Server(3670);
s.create((req, res) => {
	console.log('req meta', req.method(), req.url(), req.origin(), req.remote(), req.query());
	req.data().then((data) => {
		console.log('req data', data);
		res.status(200).send(':)');
	});
}).then(() => {
	console.log('started server');
});

const data = [
	querystring.stringify({query: 'SELECT name FROM user WHERE uid = me()', well: 'hello'}),
	JSON.stringify({this: 'cat', can: 'go', over: 'the', wall: ':)'}),
	'wrong',
	'wrong'
];
const header = [
	{'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data[0])},
	{'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data[1])},
	{'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data[2])},
	{'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data[3])},
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
			res.on('data', () => {}).on('end', () => {
				resolve();
			});
		}).on('error', () => resolve());
		r.write(data[i % data.length]);
		r.end();
	});
};

let run = () => {
	query().then(() => {
		setTimeout(() => run(), 2000);
	});
};
run();
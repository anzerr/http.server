
const {Server} = require('./index.js');

let s = new Server(3670);
s.create((req, res) => {
	console.log('req');
	res.status(200).send(':)');
}).then(() => {
	console.log('started server');
});

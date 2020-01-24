
### `Intro`
![GitHub Actions status | publish](https://github.com/anzerr/http.server/workflows/publish/badge.svg)

Simple http server interface

#### `Install`
``` bash
npm install --save git+https://github.com/anzerr/http.server.git
npm install --save @anzerr/http.server
```

### `Example`
``` javascript
const {Server} = require('http.server');

let s = new Server(3670);
s.create((req, res) => {
	console.log('req');
	res.status(200).send(':)');
}).then(() => {
	console.log('started server');
});
```
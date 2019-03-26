
### `Intro`
Simple http server interface

#### `Install`
``` bash
npm install --save git+http://git@github.com/anzerr/http.server.git
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
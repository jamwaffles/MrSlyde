var express = require('express'),
app = express();

app.configure(function() {
	app.use('/', express.static(__dirname));
});

app.listen(8091);

console.log('Listening on port 8091');
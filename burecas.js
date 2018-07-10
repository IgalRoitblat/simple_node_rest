var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer((req, res) => {
		if (!isNaN(url.parse(req.url).pathname.split("/")[2])) {
			if (req.method === 'HEAD') {
				fs.readFile('./db.json', 'utf-8', function (err, data) {
					let list = JSON.parse(data);
					list.forEach(item => {
						if (item.id == url.parse(req.url).pathname.split("/")[2]) {
							    console.log(req.headers["content-type"]);
							    // res.write(req.headers["content-type"]);
							    res.end(req.headers["content-type"]);
						}
					})
				});
			}
			if (req.method === 'DELETE') {
				fs.readFile('./db.json', 'utf-8', function (err, data) {
					let list = JSON.parse(data);
					list.forEach((item, index) => {
						if (item.id == url.parse(req.url).pathname.split("/")[2]) {
							list.splice(index, 1);
							console.log(list);
							fs.writeFile('./db.json', JSON.stringify(list), {encoding: "utf-8"},
									(err, success) => {
										console.log('success');
									});
							res.end();
						}
					})
				});
			}
			if (req.method === 'PUT') {
				let body = '';
				req.on('data', (chunck) => {
					body += chunck
				})
				req.on('end', () => {
					fs.readFile('./db.json', 'utf-8', function (err, data) {
					  if (err) throw err;
					  var list = JSON.parse(data);
					  list.forEach((item, index) => {
					  	if (item.id == url.parse(req.url).pathname.split("/")[2]) {
					  		var update = JSON.parse(body);
					  		update["id"] = item.id;
					  		list.splice(index, 1);
					  		list.push(update);
					  		fs.writeFile('./db.json', JSON.stringify(list), {encoding: "utf-8"},
					  				(err, success) => {
					  					console.log('success');
					  				});
					  	}
					  })
					});
					res.end(body);	
				})
			}
		} else {
			switch (req.url) {
				case '/burecas':
				if (req.method === 'GET') {
					if (req.headers['content-type'] === 'application/json') {
						fs.readFile('db.json', 'utf-8', function (err, data) {
							res.write(data);
							res.end();
							});
					}
					if (req.headers['content-type'] === 'text/html') {
						res.writeHead(200, {"content-type": "text/html"});
						fs.readFile('db.json', 'utf-8', function (err, data) {
							data = JSON.parse(data);
							fs.readFile('template.html', {encoding: "utf-8"},
								(err, template) => {
									var rendered = template.replace('{{ burecas }}', data.reduce((html, burecas) => {
										html += `<li>${burecas.fill}</li>`;
										return html
									}, ''));
									res.write(rendered);
									res.end();
								})
							});
					}
					console.log(req.method);
				}
				if (req.method === 'POST') {
					let body = '';
					req.on('data', (chunck) => {
						body += chunck
					})
					req.on('end', () => {
						fs.readFile('./db.json', 'utf-8', function (err, data) {
						  if (err) throw err;
						  var list = JSON.parse(data);
						  body = JSON.parse(body);
						  body["id"] = list[list.length - 1].id + 1;
						  list.push(body);
						  fs.writeFile('./db.json', JSON.stringify(list), {encoding: "utf-8"},
						  		(err, success) => {
						  			console.log('success');
						  		});
						});
						console.log(req.method);
						res.end(body);	
					})
				}
				break;
				default:
				res.end();
			}
		}
});

server.listen(3000, 'localhost');


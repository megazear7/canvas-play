var StaticServer = require('static-server');

var server = new StaticServer({
  rootPath: '.',
  port: 8000,
  cors: '*'
});

server.start(function () {
  console.log('Server listening to', server.port);
});

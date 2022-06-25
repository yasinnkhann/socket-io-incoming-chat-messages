const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

app.use(cors());

const PORT = 3001 || process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', socket => {
	socket.on('send_message', data => {
		socket.emit('receive_message', data);
	});
});

server.listen(PORT, () => {
	console.log('SERVER IS RUNNING');
});

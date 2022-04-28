const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let sockets = []

function getSocketName(socket) {
    if (socket.nickname === '') return socket.nickname;
    else return socket.id;
};

io.on('connection', (socket) => {
    sockets.push({
        'id': socket.id,
        'nickname': socket.id,
    });
    io.emit('chat message', getSocketName(socket) + ' has joined the server!');
    io.emit('user update', JSON.stringify(sockets));
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('change nickname', (nickname) => {
        let oldNickname = getSocketName(socket);
        sockets.find(s => s.id === socket.id).nickname = nickname
        io.emit('chat message', oldNickname + ' has changed the nickname to ' + nickname);
        io.emit('user update', JSON.stringify([{'id':socket.id,'nickname':nickname}]));
    });
    socket.on('disconnect', () => {
        const index = sockets.findIndex(s => s.id === socket.id)
        if (index > -1) {
            sockets.splice(index, 1);
        }
        io.emit('chat message', getSocketName(socket) + ' has left the server!');
        io.emit('user disconnect', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
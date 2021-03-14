const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const config = require("./config/config");
const MinecraftServer = require("./wrapper/wrapper");

// Auth Middleware

io.use(function (socket, next) {

    if (config.notification.status) {

        if (socket.handshake.query && socket.handshake.query.token) {

            if (socket.handshake.query.token == config.notification.token) {
                next();
            }
            else {
                next(new Error('Wrong token'));
            }
        }
        else {
            next(new Error('Authentication error'));
        }
    }
    else {
        next(new Error('Notifications are turned off'));
    }
});


const server = new MinecraftServer({
    command: {
        prefix: '~'
    },
    core: {
        args: ['-Xmx2G'],
        rcon: {
            host: config.rcon.host,
            port: config.rcon.port,
            password: config.rcon.password,
            buffer: 100,
        }
    }
});

console.log("\nStarting Minecraft Server 🧱\n");

server.start();

http.listen(config.notification.port, () => {
    console.log(`Minecraft server notifications started on port ${config.notification.port}\n`);
});


io.on('connection', function (socket) {
    console.log('Client connected:', socket.client.id);
    socket.emit('players', config.globals.players);

    socket.on('get-players', function(data) {
        socket.emit('players', config.globals.players);
    })

});



// Controllers

require('./controllers/commands/backup')(server);
require('./controllers/commands/activity')(server, io);
require('./controllers/commands/notes')(server);
require('./controllers/commands/chats')(server);
require('./controllers/functions/cron-jobs')(server, io);
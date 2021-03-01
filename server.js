var config = require("./config/config");
var MinecraftServer = require("./wrapper/wrapper");

var server = new MinecraftServer({
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

// Controllers

require('./controllers/commands/backup')(server);
require('./controllers/commands/activity')(server);
require('./controllers/commands/notes')(server);
require('./controllers/commands/chats')(server);
require('./controllers/functions/cron-jobs')(server);
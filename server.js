const config = require("./config/config");
const MinecraftServer = require("./wrapper/wrapper");


const server = new MinecraftServer({
    core: {
        args: ['-Xmx2G']
    }
});

console.log("\nStarting Minecraft Server 🧱\n");

server.start();

// Controllers
// require('./controllers/functions/cron-jobs')(server);
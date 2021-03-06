var db = require('../../config/db');
const config = require('../../config/config');

module.exports = (server, io) => {

    server.on('login', (event) => {

        const player = {
            name: event.player,
            timestamp: new Date()
        }

        config.globals.players.push(player);

        io.emit('login', { player: event.player });
        io.emit('players', config.globals.players);

        server.tellRaw(`Welcome ${event.player}`, event.player, { color: 'green' });

        db.run(`INSERT INTO actions(player, action, timestamp) VALUES (?, ?, ?)`, [event.player, 'login', event.timestamp], function (err) {
            if (err) {
                return console.log(err.message);
            }
        });
    });


    server.on('logout', (event) => {

        var index = config.globals.players.map(function(x) { return x.name; }).indexOf(event.player);
        
        if (index !== -1) {
            config.globals.players.splice(index, 1);
        }

        io.emit('logout', { player: event.player, timestamp: new Date() });
        io.emit('players', config.globals.players);

        db.run(`INSERT INTO actions(player, action, reason, timestamp) VALUES (?, ?, ?, ?)`, [event.player, 'logout', event.reason, event.timestamp], function (err) {
            if (err) {
                return console.log(err.message);
            }
        });
    });

};
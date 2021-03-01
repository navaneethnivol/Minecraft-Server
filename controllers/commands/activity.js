var db = require('../../config/db');

module.exports = (server) => {

    server.on('login', (event) => {

        db.run(`INSERT INTO actions(player, action, timestamp) VALUES (?, ?, ?)`, [event.player, 'login', event.timestamp], function (err) {
            if (err) {
                return console.log(err.message);
            }

            server.tellRaw(`Welcome ${event.player}`, event.player, { color: 'green' });
        });

    });

    server.on('logout', (event) => {

        db.run(`INSERT INTO actions(player, action, reason, timestamp) VALUES (?, ?, ?, ?)`, [event.player, 'logout', event.reason, event.timestamp], function (err) {
            if (err) {
                return console.log(err.message);
            }
        });
        
    });

};
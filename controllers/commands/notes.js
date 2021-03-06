var db = require("../../config/db");

module.exports = (server) => {

    server.on('notes', (event) => {

        var actions = ['add', 'del', 'help']

        if (event.args.length == 1 && event.args[0] == '') {
            event.args = [];
        }

        if (event.args.length > 0) {

            if (actions.includes(event.args[0])) {

                if (event.args[0] == "add") {

                    if (event.args.slice(1).length == 0) {
                        server.tellRaw("Message is required.", event.player, { color: 'red' });
                    }
                    else {

                        var msg = event.args.slice(1).join(" ");

                        db.run(`INSERT INTO notes(player, data, timestamp) VALUES (?, ?, ?)`, [event.player, msg, event.timestamp], function (err) {

                            if (err) {
                                return console.log(err.message);
                            }

                            server.tellRaw("Note Added", event.player, { color: 'yellow' });
                        });
                    }
                }
                else if (event.args[0] == "del") {

                    if (event.args.slice(1).length == 0) {
                        server.tellRaw("note_id is required.", event.player, { color: 'red' });
                    }
                    else if (event.args.slice(1).length > 1) {
                        server.tellRaw("Only one note_id should be sent.", event.player, { color: 'red' });
                    }
                    else {

                        var note_id = event.args.slice(1)[0];

                        db.run(`DELETE FROM notes WHERE note_id= (?)`, note_id, function (err) {

                            if (err) {
                                return console.error(err.message);
                            }

                            server.tellRaw("Note Deleted", event.player, { color: 'yellow' });
                        });
                    }
                }
                else if (event.args[0] == "help") {
                    server.tellRaw("Actions\n add <message> : Adds new note\n del <note_id> : deletes note", event.player, { color: 'blue' });
                }
            }
            else {
                server.tellRaw("Action not found\nType ~notes help for available actions.", event.player, { color: 'red' });
            }
        }
        else {

            db.all(`SELECT * from notes where player = (?) ORDER BY timestamp DESC`, [event.player], function (err, data) {

                if (err) {
                    return console.log(err.message);
                }

                var notes = '';

                if (data.length == 0) {
                    server.tellRaw("You don't have any notes yet. use help subcommand for more details on notes", event.player, { color: 'white' });
                }
                else {

                    for (item in data) {
                        notes += `${data[item].note_id}: ${data[item].data}` + '\n';
                    }

                    server.tellRaw(notes, event.player, { color: 'green' });
                }

            });
        }
    });

};
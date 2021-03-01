const path = require('path');
const sqlite3 = require('sqlite3').verbose();

var db_path = path.join(__dirname, '../') + 'database/minecraft.db'

let db = new sqlite3.Database(db_path, (err) => {

    if (err) {
        console.error(err.message);
    }
    else {
        console.log('Connected to the minecraft database.\n');
    }
});

db.serialize(() => {

    db.run("CREATE TABLE IF NOT EXISTS players ( player_id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL, joined INTEGER NOT NULL)")
        .run("CREATE TABLE IF NOT EXISTS chats ( chat_id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL, message TEXT NOT NULL, timestamp INTEGER NOT NULL)")
        .run("CREATE TABLE IF NOT EXISTS notes ( note_id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL, data TEXT NOT NULL, timestamp INTEGER NOT NULL)")
        .run("CREATE TABLE IF NOT EXISTS actions ( action_id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL, action TEXT NOT NULL, reason TEXT, timestamp INTEGER NOT NULL)")
        .run("CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chats (timestamp)")
        .run("CREATE INDEX IF NOT EXISTS idx_note_timestamp ON notes (timestamp)")
        .run("CREATE INDEX IF NOT EXISTS idx_action_timestamp ON actions (timestamp)")
        .run("CREATE INDEX IF NOT EXISTS idx_player_action ON actions (player, action)");

});


module.exports = db
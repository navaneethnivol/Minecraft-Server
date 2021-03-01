const CronJob = require('cron').CronJob;

const minio = require('../../config/minio');
const backupFunc = require('./backupFunc');
const config = require('../../config/config');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (server) => {

    var backup_ongoing = 0;

    server.on('login', (event) => {

        if (backup_ongoing) {
            server.send(`kick ${event.player} "Backup is in progress"`);
        }

    });

    var autobackup = new CronJob('* * * * * *', function () {

        try {

            if (server.rcon.state != 'connected') {
                console.log("RCON seems to be offline. [ backups alerts are not sent]");
            }

            console.log("Strating Automatic Backup\n");

            server.tellRaw("Automatic backup will begin in 15 min, Please save your progress and leave the game.", '@a', { color: 'yellow' });
            await sleep(300000);

            server.tellRaw("Automatic backup will begin in 10 min, Please save your progress and leave the game.", '@a', { color: 'yellow' });
            await sleep(300000);

            server.tellRaw("Automatic backup will begin in 5 min, Please save your progress and leave the game.", '@a', { color: 'yellow' });
            await sleep(120000);

            server.tellRaw("Automatic backup will begin in 3 min, Please save your progress and leave the game.", '@a', { color: 'red' });
            await sleep(120000);

            server.tellRaw("Automatic backup will begin in 1 min, Please save your progress and leave the game.", '@a', { color: 'red' });
            await sleep(30000);

            server.tellRaw("Automatic backup will begin in 30 sec, Please save your progress and leave the game.", '@a', { color: 'red' });
            await sleep(15000);

            server.tellRaw("Automatic backup will begin in 15 sec, Please save your progress and leave the game.", '@a', { color: 'red' });
            await sleep(10000);

            server.tellRaw("Automatic backup will begin in 5 sec, Please save your progress and leave the game.", '@a', { color: 'red' });
            await sleep(5000);

            server.tellRaw("Starting Automatic Backup", '@a', { color: 'blue' });
            await sleep(5000);

            backup_ongoing = 1;

            return server.send('list').then(async (list) => {

                var players = list.split(":")[1].trim().split(", ");

                if (players[0] == '') {
                    players = []
                }

                let kickPlayers = [];

                if (players.length > 0) {
                    for (player in players) {
                        kickPlayers.push(server.send(`kick ${players[player]} "Backup is in progress"`))
                    }
                }

                await Promise.all(kickPlayers).then((players) => {
                    console.log("Players Kicked ", players.length);
                }).catch(err => {
                    console.log("Error Occured while kicking players: ", err);
                });


                return backupFunc.getMinioBackups().then((backups_list) => {

                    backups_list = backups_list.filter(x => {
                        if (x.metadata["X-Amz-Meta-Backup_type"] == "automatic") {
                            return x;
                        }
                    })

                    backups_list.sort(function (x, y) {
                        var a = new Date(x.lastModified), b = new Date(y.lastModified);
                        if (a > b)
                            return -1;
                        if (a < b)
                            return 1;
                        return 0;
                    });

                    var extra_backups = backups_list.slice(config.backup.max_backups - 1);

                    var temp = []

                    for (item in extra_backups) {
                        temp.push(extra_backups[item].name);
                    }

                    extra_backups = temp;
                    delete temp;

                    return backupFunc.zipBackup(null, 'automatic').then(async (backup_name) => {

                        backup_ongoing = 0;

                        console.log(`Backup Created Successfully\n`);
                        server.tellRaw(`Backup Created Successfully: ${backup_name}`, '@a', { color: 'yellow' });

                        if (extra_backups.length > 0) {

                            return minio.minioClient.removeObjects('world-backups', extra_backups, (err) => {
                                if (err) {
                                    throw err;
                                }
                                console.log("Previous Backups Removed");
                            });
                        }

                    }).catch(err => {
                        throw err;
                    });

                }).catch(err => {
                    throw err;
                });

            }).catch(err => {
                throw err;
            });

        }
        catch (err) {
            backup_ongoing = 0;
            console.log("Backup Failed: ", err);
            server.tellRaw("Backup Failed", '@a', { color: 'red' });
        }

    }, null, true, 'Asia/Kolkata');

    autobackup.start();
};
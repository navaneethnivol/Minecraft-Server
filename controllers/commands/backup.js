let utilities = require("../../utilities/utilities");

let { getMinioBackups } = require('../functions/backupFunc');

module.exports = (server) => {

    server.on('backups', (event) => {

        getMinioBackups().then((backups_list) => {

            if (backups_list.length == 0) {
                var backup_msg = "No Backups Available.";
            }
            else {

                for (item in backups_list) {
                    backups_list[item].backup_type = backups_list[item].metadata['X-Amz-Meta-Backup_type'];
                    delete backups_list[item].metadata;
                }

                var backup_msg = '';

                for (item in backups_list) {
                    backup_msg += `${backups_list[item].name} - ${backups_list[item].backup_type}: ${utilities.formatDate(backups_list[item].lastModified)}\n`;
                }
            }

            server.tellRaw(backup_msg, event.player, { color: 'white' });

        }).catch(err => {
            server.tellRaw(`${err.message}`, event.player, { color: 'red' });
        });

    });

};
const CronJob = require('cron').CronJob;

const minio = require('../../config/minio');
const backupFunc = require('./backupFunc');
const config = require('../../config/config');

global.backup_ongoing = 0;

module.exports = async (server) => {

    var autobackup = new CronJob(config.backup.cron_job, async function () {

        if (global.backup_ongoing) {
            console.log("Backup is already going on.");
            return;
        }

        try {

            global.backup_ongoing = 1;

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

                    global.backup_ongoing = 0;

                    console.log(`Backup Created Successfully\n`);

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
                global.backup_ongoing = 0;
                console.log("Backup Failed: ", err);
                throw err;
            });

        }
        catch (err) {
            global.backup_ongoing = 0;
            console.log("Backup Failed: ", err);
        }

    }, null, true, 'Asia/Kolkata');

    autobackup.start();
};
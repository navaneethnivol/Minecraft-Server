const fs = require('fs');
const path = require('path');

const minio = require("../../config/minio");
const utilities = require("../../utilities/utilities");

const WorkerServerPath = path.join(__dirname, '../../');

function zipBackup(backup_name, backup_type) {

    return new Promise((resolve, reject) => {

        if (!backup_name) {
            backup_name = 'backup-' + utilities.getTimestamp() + '.zip';
        }

        if (!backup_name.includes(".zip")) {
            return reject("back_name should have .zip extension")
        }

        console.log(`[${utilities.getTime()}] New backup has started: ` + backup_name);

        var source = WorkerServerPath + 'minecraft/world'
        var destination = WorkerServerPath + `${backup_name}`;

        const child_process = require("child_process");

        child_process.exec(`zip -r ${destination} ${source}`, (err, stdout, stderr) => {

            if (err) {
                return reject(err);
            }

            var fileStream = fs.createReadStream(destination);

            var metadata = { 'backup_type': backup_type };

            return minio.minioClient.putObject('world-backups', backup_name, fileStream, metadata = metadata, function (err, file) {

                if (err) {
                    return reject(err);
                }

                fs.unlinkSync(destination);

                console.log(`[${utilities.getTime()}] Backup completed: ${backup_name}`);
                return resolve(backup_name);

            });

        });

    });
}


function getMinioBackups() {

    return new Promise((resolve, reject) => {

        var backups_list = [];

        var stream = minio.minioClient.extensions.listObjectsV2WithMetadata('world-backups', '', true, '')

        stream.on('data', function (obj) {
            backups_list.push(obj);
        });

        stream.on('error', function (err) {
            return reject(err);
        });

        stream.on('end', () => {
            return resolve(backups_list);
        });

    });
}


module.exports = {
    zipBackup,
    getMinioBackups
}
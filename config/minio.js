var Minio = require('minio')

var config = require("./config");

var minioClient = new Minio.Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.access_key,
    secretKey: config.minio.secret_key
});

async function makeBucket(bucket_name, callback) {

    try {

        await minioClient.makeBucket(bucket_name, function (err) {

            if (err) {
                if (err.code == 'BucketAlreadyOwnedByYou') {
                    console.log(err.bucketname + " bucket already exists. 👍");
                    return callback(null, bucket_name);
                }
                else {
                    return callback(err);
                }
            }
            console.log(`${bucket_name} bucket created successfully. 🤘`)
            return callback(null, bucket_name);

        })

    } catch (err) {
        return callback(err);
    }

}


makeBucket('world-backups', (err, bucket_name) => {

    if (err) {
        console.error(err);
        process.exit(1);
    }

    makeBucket('database-backups', (err, bucket_name) => {

        if (err) {
            console.error(err);
            process.exit(1);
        }

    });

});



module.exports = {
    minioClient
}
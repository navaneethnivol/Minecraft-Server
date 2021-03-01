![](https://www.freepnglogos.com/uploads/minecraft-logo-8.png)

**Minecraft Self-hostable Server with automatic backup worker.**

Run the application:
```sh
docker-compose up --build -d
```

Sample Environment File

```env
# Minecraft Worker Port
PORT=8002

# Minio Config
MINIO_ACCESS_KEY=Minecraft
MINIO_SECRET_KEY=Minecraft123
MINIO_PORT=9000
MINIO_ENDPOINT='minecraft-minio'


# RCON Config
RCON_HOST=minecraft-server
RCON_PORT=25575
RCON_PASSWORD=minecraft123
```
place this environment file in the repositories root directory.
![](https://www.freepnglogos.com/uploads/minecraft-logo-8.png)

**Minecraft Self-hostable Server with automatic backups.**

Run the application:
```sh
docker-compose up --build -d
```

Sample Environment File

```env
# Minecraft Config

# Minio Config
MINIO_ACCESS_KEY=Minecraft
MINIO_SECRET_KEY=Minecraft123
MINIO_PORT=9000
MINIO_ENDPOINT='minecraft-minio'

```
Place this environment file in the repositories root directory.
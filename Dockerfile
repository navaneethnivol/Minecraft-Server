FROM openjdk:16-slim

RUN apt-get update && apt-get upgrade -y

RUN apt-get -y install wget vim zip unzip nodejs npm

RUN node --version

WORKDIR /app

COPY . .

RUN npm install

RUN echo "eula=true" > ./minecraft/eula.txt

CMD node server.js

EXPOSE 25565
EXPOSE 25575
EXPOSE 5000
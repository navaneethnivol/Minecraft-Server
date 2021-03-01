FROM openjdk:8

RUN apt-get update

RUN apt-get -y install vim nodejs npm zip

WORKDIR /app

COPY . .

RUN npm install

RUN echo "eula=true" > ./minecraft/eula.txt

CMD node server.js

EXPOSE 25565
EXPOSE 25575
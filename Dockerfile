FROM timbru31/java-node:8-jre-14

RUN apt-get update && apt-get upgrade -y

RUN apt-get -y install vim zip

WORKDIR /app

COPY . .

RUN npm install

RUN echo "eula=true" > ./minecraft/eula.txt

CMD node server.js

EXPOSE 25565
EXPOSE 25575
EXPOSE 5000
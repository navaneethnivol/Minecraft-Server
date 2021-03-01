const path = require('path');
const EventsEmitter = require('events');
const defaultsDeep = require('lodash.defaultsdeep');
const get = require('lodash.get');
const Rcon = require('../config/rcon');

const { spawn } = require('child_process');

var configFile = require('../config/config');

var defaultConfig = {
    flavor: 'vanilla',
    command: {
        prefix: '~'
    },
    core: {
        jar: 'server.jar',
        game_dir: path.join(__dirname, '../') + 'minecraft/',
        args: ['-Xmx2G'],
        rcon: {
            host: 'localhost',
            port: '25575',
            password: 'minecraft123',
            buffer: 100,
        },
        pipeConfig: ['pipe', 'pipe', 'inherit']
    }
}

class MinecraftServer extends EventsEmitter {

    constructor(config = {}) {
        super();
        this.config = defaultsDeep({}, config, defaultConfig);
        this.rcon = new Rcon(configFile.rcon);
        this.config.event = defaultsDeep({}, this.config.event, {
            flavorSpecific: {
                default: {
                    parseChatEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: <(\w+)> (.*)/i);
                        if (parsed) {
                            return {
                                player: parsed[1],
                                message: parsed[2],
                            };
                        }
                    },
                    parseLoginEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: (\w+)\[\/([\d.:]+)\] logged in/);
                        if (parsed) {
                            return {
                                player: parsed[1],
                                ip: parsed[2],
                            };
                        }
                    },
                    parseLogoutEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: (\w+) lost connection/);
                        if (parsed) {
                            return {
                                player: parsed[1],
                            };
                        }
                    },
                    parseAchievementEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: (\w+) has completed the challenge \[([\w\s]+)\]/);
                        if (parsed) {
                            return {
                                player: parsed[1],
                            };
                        }
                    },
                    parseStartEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: Done/);
                        if (parsed) {
                            return {};
                        }
                    },
                    parseStopEvent(string) {
                        const parsed = string.match(/^\[[\d:]{8}\] \[Server thread\/INFO\]: Stopping server/);
                        if (parsed) {
                            return {};
                        }
                    },
                },
            },
        });

        const events = [
            ['chat', 'parseChatEvent'],
            ['login', 'parseLoginEvent'],
            ['logout', 'parseLogoutEvent'],
            ['achievement', 'parseAchievementEvent'],
            ['start', 'parseStartEvent'],
            ['stop', 'parseStopEvent'],
        ];


        this.on('console', (string) => {

            if (this.rcon.state !== 'connected') {
                const rconRunning = /^\[[\d:]{8}\] \[Server thread\/INFO\]: RCON running/i;
                if (string.match(rconRunning)) this.rcon.connect();
            }

            const result = events.reduce((acc, event) => {
                if (acc) return acc;

                const parseEvent = get(this.config.event, ['flavorSpecific', this.config.flavor, event[1]], this.config.event.flavorSpecific.default[event[1]]);
                const matches = parseEvent(string);
                if (matches) return { event: event[0], payload: matches };

                return null;
            }, null);

            if (result) {
                result.payload.timestamp = Date.now();
                this.emit(result.event, result.payload);
            }
        });

        this.on('chat', (event) => {

            const commandRegx = new RegExp(`^${config.command.prefix}([\\w]+)\\s?(.*)`, 'i');

            const stripped = event.message.match(commandRegx);
            if (stripped) {
                const command = stripped[1].toLowerCase();
                this.emit(command, {
                    player: event.player,
                    command,
                    args: stripped[2].split(' '),
                    timestamp: Date.now(),
                });
            }
            else {
                this.emit('message', event);
            }
        });

        process.on('exit', () => this.stop());
        process.on('close', () => this.stop());
    }


    start() {

        if (this.spawn) throw new Error('Server already started');

        const args = this.config.core.args.concat('-jar', this.config.core.game_dir + this.config.core.jar, 'nogui');

        this.spawn = spawn('java', args, {
            cwd: this.config.core.game_dir,
            stdio: this.config.core.pipeConfig
        });

        this.spawn.stdout.pipe(process.stdout);
        process.stdin.pipe(this.spawn.stdin);

        this.spawn.stdout.on('data', (data) => {
            // Emit console
            data.toString().split('\n').forEach((line) => {
                if (line) this.emit('console', line.trim());
            });
        });

        return this;
    }

    stop() {

        if (this.spawn) {
            this.spawn.kill();
            this.spawn = null;
        }

        return this;
    }

    send(command) {
        return new Promise((resolve) => {
            this.rcon.exec(command, result => resolve(result));
        });
    }

    execConsoleCommand(command) {
        return new Promise((resolve) => {
            this.spawn.stdin.write(`${command}\n`, () => resolve());
        });
    }

    tellRaw(message, target = '@a', options = {}) {
        if (typeof target !== 'string') return Promise.reject(new Error('util.tellRaw: Specified target should be a string'));
        if (typeof options !== 'object') return Promise.reject(new Error('util.tellRaw: Options for tellraw should be an object'));
        options.text = typeof message === 'string' ? message : JSON.stringify(message);
        return this.send(`tellraw ${target} ${JSON.stringify(options)}`);
    }

}


module.exports = MinecraftServer;
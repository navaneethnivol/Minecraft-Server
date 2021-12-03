const path = require('path');
const get = require('lodash.get');
const EventsEmitter = require('events');
const defaultsDeep = require('lodash.defaultsdeep');

const { spawn } = require('child_process');

var defaultConfig = {
    flavor: 'vanilla',
    core: {
        jar: 'server.jar',
        game_dir: path.join(__dirname, '../') + 'minecraft/',
        args: ['-Xmx2G'],
        pipeConfig: ['pipe', 'pipe', 'inherit']
    }
}

class MinecraftServer extends EventsEmitter {

    constructor(config = {}) {
        super();
        this.config = defaultsDeep({}, config, defaultConfig);
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

}


module.exports = MinecraftServer;
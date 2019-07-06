"use strict";

const Msg = require("thelounge/src/models/msg");
const log = require("thelounge/src/log");
const fs = require("fs");
const path = require('path');

const shortcutsFile = path.resolve(process.env.THELOUNGE_HOME, "packages", "shortcuts.json");

let shortcuts = [];
let thelounge = null;

function sendMessage(text, chan, client) {
    chan.pushMessage(client.client, new Msg({
        type: Msg.Type.ERROR, //TODO send "normal" message
        text: text,
    }));
}

function sendErrorMessage(text, chan, client) {
    chan.pushMessage(client.client, new Msg({
        type: Msg.Type.ERROR,
        text: text,
    }));
}

function addShortcut(from, to) {
    shortcuts.push({from: from, to: to});
    saveShortcuts();
}

function removeShortcut(from) {
    shortcuts = shortcuts.filter(function (shortcut, index, arr) {
        return shortcut.from !== from;
    });
    saveShortcuts();
}

function doesShortcutExist(from) {
    return shortcuts.some(function (o) {
        return o.from === from;
    });
}

function getShortcut(from) {
    return shortcuts.find(o => o.from === from).to;
}

function saveShortcuts() {
    fs.writeFile(shortcutsFile, JSON.stringify(shortcuts), "utf-8", (err) => {
        if (err) log.error(err);
        log.info("Successfully wrote " + shortcuts.length + " shortcuts to file " + shortcutsFile);
    });
}

function loadShortcuts() {
    fs.readFile(shortcutsFile, "utf-8", function (err, data) {
        if (err) log.error(err);
        try {
            shortcuts = JSON.parse(data);

            shortcuts = JSON.parse(data);
            log.info("[Shortcuts] Loaded " + shortcuts.length + " shortcuts");
            registerShortcuts();
        } catch(error) {
            log.error("Error while loading shortcuts: " + shortcuts);
            saveShortcuts(); // TODO not sure if this is a good idea
        }
    });
}

function registerShortcuts() {
    shortcuts.forEach(shortcut => thelounge.Commands.add(shortcut.from, runShortcut))
}

const runShortcut = {
    input: function (client, target, command, args) {
        if (doesShortcutExist(command)) {
            let to = getShortcut(command);
            //sendMessage("Run shortcut " + command + " -> " + to + "", target.chan, client);
            client.runAsUser(to, target.chan.id);
        } else {
            sendErrorMessage("Did not find shortcut " + command + ", has it been removed? " +
                "Removed shortcuts get unregistered on your next restart.", target.chan, client)
        }
    },
    allowDisconnected: true
};

const shortcutCommand = {
    input: function (client, target, command, args) {
        if (args.length === 0) {
            sendErrorMessage("Usage: /shortcut <add|list|remove>", target.chan, client);
            return;
        }
        switch (args[0]) {
            case "add":
            case "addf":
                if (args.length <= 2) {
                    sendErrorMessage("Usage: /shortcut " + args[0] + " <from> <to>", target.chan, client);
                    return;
                }

                let from = args[1];
                if (doesShortcutExist(from)) {
                    if (args[0] === "addf") {
                        sendMessage("Removing old shortcut...", target.chan, client);
                        removeShortcut(from);
                    } else {
                        sendErrorMessage("Shortcut " + from + " does exist, either remove the old one use use /shortuct addf <from> <to>", target.chan, client);
                        return;
                    }
                }

                let to = args.slice(2).join(" ");
                addShortcut(from, to);
                thelounge.Commands.add(from, runShortcut); //TODO this doesn't work for completion?
                sendMessage("Shortcut " + from + " -> " + to + " added", target.chan, client);
                break;
            case "list":
                if (shortcuts.length === 0) {
                    sendErrorMessage("There are no shortcuts defined, use /shortcut add <from> <to> to add one.", target.chan, client);
                    return;
                }
                sendMessage("There are " + shortcuts.length + " shortcuts configured: ", target.chan, client);
                shortcuts.forEach(function (shortcut) {
                    sendMessage("- /" + shortcut.from + " -> " + shortcut.to + "", target.chan, client);
                });
                break;
            case "remove":
                if (args.length !== 2) {
                    sendErrorMessage("Usage: /shortcut remove <name>", target.chan, client);
                    return;
                }

                if (!doesShortcutExist(args[1])) {
                    sendErrorMessage("Shortcut " + args[1] + " does not exist", target.chan, client);
                } else {
                    removeShortcut(args[1]);
                    //thelounge.Commands.remove(from); //TODO unregister command
                    sendMessage("Shortcut " + args[1] + " has been removed", target.chan, client);
                }
                break;
            default:
                sendErrorMessage("Usage: /shortcut <add|list|remove>", target.chan, client);
                break;
        }
    },
    allowDisconnected: true
};

module.exports = {
    onServerStart: api => {
        thelounge = api;
        thelounge.Commands.add("shortcut", shortcutCommand);
        loadShortcuts();
    },
};

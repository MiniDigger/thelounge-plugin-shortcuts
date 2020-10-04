"use strict";

const Msg = require("thelounge/src/models/msg");
const log = require("thelounge/src/log");
const Helper = require("thelounge/src/helper");
const Utils = require("thelounge/src/command-line/utils");
const fs = require("fs");
const path = require('path');

Helper.setHome(process.env.THELOUNGE_HOME || Utils.defaultHome()); // TODO shouldn't be necessary...
const shortcutsFile = path.resolve(Helper.getPackagesPath(), "shortcuts.json");

const code = "";
const red = '04';

let shortcuts = [];
let thelounge = null;

function addShortcut(from, to, next) {
    if (next && Array.isArray(getShortcut(from))) {
        getShortcut(from).push(to);
    } else if (next) {
        const oldTo = getShortcut(from);
        removeShortcut(from);
        shortcuts.push({from: from, to: [oldTo, to]});
    } else {
        shortcuts.push({from: from, to: to});
    }
    saveShortcuts();
}

function removeShortcut(from) {
    shortcuts = shortcuts.filter(function (shortcut, index, arr) {
        return shortcut.from !== from;
    });
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
        log.info("[Shortcuts] Successfully wrote " + shortcuts.length + " shortcuts to file " + shortcutsFile);
    });
}

function loadShortcuts() {
    fs.readFile(shortcutsFile, "utf-8", function (err, data) {
        if (err) log.error(err);
        try {
            shortcuts = JSON.parse(data);
            log.info("[Shortcuts] Loaded " + shortcuts.length + " shortcuts from " + shortcutsFile);
            registerShortcuts();
        } catch (error) {
            log.error("[Shortcuts] Error while loading shortcuts: " + shortcuts);
            log.error(error);
        }
    });
}

function registerShortcuts() {
    shortcuts.forEach(shortcut => thelounge.Commands.add(shortcut.from, runShortcut))
}

function handlePlaceholders(to, target, args) {
    // replace placeholders
    to = to.replace("{currentChannel}", target.chan.name);
    to = to.replace("{args}", args.join(" "));
    // handle positional arguments
    args.forEach((arg, index) => to = to.replace("{" + index + "}", arg));
    return to;
}

const runShortcut = {
    input: function (client, target, command, args) {
        if (doesShortcutExist(command)) {
            // get shortcut
            const to = getShortcut(command);

            // check if multiple or one shortcut
            if (Array.isArray(to)) {
                // iterate over all commands
                to.forEach(entry => {
                    // handle placeholders and run
                    const cmd = handlePlaceholders(entry, target, args);
                    client.runAsUser(cmd, target.chan.id);
                });
            } else {
                // handle placeholders and run
                const cmd = handlePlaceholders(to, target, args);
                client.runAsUser(cmd, target.chan.id);
            }
        } else {
            client.sendMessage(red + "Did not find shortcut " + code + command + code + ", has it been removed? " +
                "Removed shortcuts get unregistered on your next restart.", target.chan, client)
        }
    },
    allowDisconnected: true
};

const shortcutCommand = {
    input: function (client, target, command, args) {
        if (args.length === 0) {
            client.sendMessage(red + "Usage: /shortcut <add|list|remove>", target.chan);
            return;
        }
        switch (args[0]) {
            case "add":
            case "addf":
            case "addnext":
                if (args.length <= 2) {
                    client.sendMessage(red + "Usage: /shortcut " + args[0] + " <from> <to>", target.chan);
                    return;
                }

                const from = args[1];
                let next = false;
                if (doesShortcutExist(from)) {
                    if (args[0] === "addf") {
                        client.sendMessage("Removing old shortcut...", target.chan);
                        removeShortcut(from);
                    } else if (args[0] === "addnext") {
                        next = true;
                    } else {
                        client.sendMessage(red + "Shortcut " + code + from + code + " does exist, either remove the old one use use " + code + "/shortcut addf <from> <to>" + code, target.chan);
                        client.sendMessage(red + "You can also use " + code + "/shortcut addnext <from> <to>" + code + " to add a new command to this existing shortcut", target.chan);
                        return;
                    }
                }

                const to = args.slice(2).join(" ");
                addShortcut(from, to, next);
                thelounge.Commands.add(from, runShortcut); //TODO this doesn't work for completion?
                client.sendMessage("Shortcut " + code + from + code + " -> " + code + to + code + " added", target.chan);
                if (next) {
                    client.sendMessage("Whole shortcut now runs these commands: ", target.chan);
                    const joined = getShortcut(from).join(code + ", " + code);
                    client.sendMessage(code + joined + code, target.chan);
                }
                break;
            case "list":
                if (shortcuts.length === 0) {
                    client.sendMessage(red + "There are no shortcuts defined, use " + code + "/shortcut add <from> <to>" + code + " to add one.", target.chan);
                    return;
                }
                client.sendMessage("There are " + code + shortcuts.length + code + " shortcuts configured: ", target.chan);
                shortcuts.forEach(function (shortcut) {
                    let to;
                    if (Array.isArray(shortcut.to)) {
                        const joined = shortcut.to.join(code + ", " + code);
                        to = code + joined + code;
                    } else {
                        to = code + shortcut.to + code
                    }
                    client.sendMessage("- " + code + "/" + shortcut.from + code + " -> " + to, target.chan);
                });
                break;
            case "remove":
                if (args.length !== 2) {
                    client.sendMessage(red + "Usage: /shortcut remove <name>", target.chan);
                    return;
                }

                if (!doesShortcutExist(args[1])) {
                    client.sendMessage(red + "Shortcut " + code + args[1] + code + " does not exist", target.chan);
                } else {
                    removeShortcut(args[1]);
                    saveShortcuts();
                    //thelounge.Commands.remove(from); //TODO unregister command
                    client.sendMessage("Shortcut " + code + args[1] + code + " has been removed", target.chan);
                }
                break;
            default:
                client.sendMessage("Usage: /shortcut <add|list|remove>", target.chan);
                break;
        }
    },
    allowDisconnected: true
};

module.exports = {
    onServerStart: api => {
        thelounge = api;
        thelounge.Commands.add("shortcut", shortcutCommand);
        if (!fs.existsSync(shortcutsFile)) {
            log.warn("Shortcut file " + shortcutsFile + " doesn't exist. Creating...")
            saveShortcuts();
        }
        loadShortcuts();
    },
};

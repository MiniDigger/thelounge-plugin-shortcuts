const shortcuts = [];
addShortcut("test", "/whois MiniDigger");

const runShortcut = {
    input: function(network, chan, cmd, args, runCommand) {
        if(doesShortcutExist(cmd.name)) {
            let to = getShortCut(cmd.name);
            runCommand(to);
        }
    }
};

const shortcutCommand = {
    input: function(network, chan, cmd, args, runCommand) {
        if (args.length === 0) {
            sendErrorMessage("Usage: /shortcut <add|list|remove>", chan, this);
            return;
        }
        switch (args[0]) {
            case "add":
            case "addf":
                if (args.length <= 2) {
                    sendErrorMessage("Usage: /shortcut " + args[0] + " <from> <to>", chan, this);
                    return;
                }

                let from = args[1];
                if (doesShortcutExist(from)) {
                    if (args[0] === "addf") {
                        sendMessage("Removing old shortcut...", cha, this);
                        removeShortcut(from);
                    } else {
                        sendErrorMessage("Shortcut `" + from + "` does exist, either remove the old one use use `/shortuct addf <from> <to>`", chan, this);
                        return;
                    }
                }

                let to = args[2]; // TODO join up everything after from
                addShortcut(from, to);
                // TODO register command
                sendMessage("Shortcut `" + from + "` -> `" + to + "` added");
                break;
            case "list":
                if (shortcuts.length === 0) {
                    sendErrorMessage("There are no shortcuts defined, use `/shortcut add <from> <to>` to add one.", chan, this);
                    return;
                }
                sendMessage("There are " + shortcuts.length + " shortcuts configured: ", chan, this);
                shortcuts.forEach(function(shortcut) {
                    sendMessage("- `/" + shortcut.from + "` -> `" + shortcut.to + "`");
                });
                break;
            case "remove":
                if (args.length !== 2) {
                    sendErrorMessage("Usage: /shortcut remove <name>", chan, this);
                    return;
                }

                if (!doesShortcutExist(args[1])) {
                    sendErrorMessage("Shortcut " + args[1] + " does not exist", chan, this);
                } else {
                    removeShortcut(args[1]);
                    sendMessage("Shortcut " + args[1] + " has been removed", chan, this);
                }
                break;
            default:
                sendErrorMessage("Usage: /shortcut <add|list|remove>", chan, this);
                break;
        }
    }
};

function sendMessage(text, chan, client) {
    chan.pushMessage(client, new Msg({
        type: Msg.Type.ERROR, //TODO send "normal" message
        text: text,
    }));
}

function sendErrorMessage(text, chan, client) {
    chan.pushMessage(client, new Msg({
        type: Msg.Type.ERROR,
        text: text,
    }));
}

function addShortcut(from, to) {
    shortcuts.push({ from: from, to: to });
}

function removeShortcut(from) {
    shortcuts = shortcuts.filter(function(shortcut, index, arr) {
        return shortcut.from !== from;
    });
}

function doesShortcutExist(from) {
    return shortcuts.some(function(o) { return o.from === from; });
}

function getShortcut(from) {
    return shortcuts.find(o => o.from === from).to;
}

module.exports = {
    thelounge: {
        name: "Shortcuts",
        type: "plugin"
    },
    onServerStart: thelounge => {
        thelounge.Commands.add("shortcut", shortcutCommand);
    }
};

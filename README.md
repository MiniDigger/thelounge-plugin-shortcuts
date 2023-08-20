# thelounge-plugin-shortcuts [![build status](https://github.com/MiniDigger/thelounge-plugin-shortcuts/workflows/Build/badge.svg)](https://github.com/MiniDigger/thelounge-plugin-shortcuts/workflows/build) [![npm downloads](https://img.shields.io/npm/dt/thelounge-plugin-shortcuts.svg)](https://www.npmjs.com/package/thelounge-plugin-shortcuts) [![npm versions](https://img.shields.io/npm/v/thelounge-plugin-shortcuts.svg)](https://www.npmjs.com/package/thelounge-plugin-shortcuts) [![licence mit](https://img.shields.io/github/license/MiniDigger/thelounge-plugin-shortcuts.svg)](https://github.com/MiniDigger/thelounge-plugin-shortcuts/blob/master/LICENSE)

Simple plugin for the irc client [thelounge](https://thelounge.chat) that allows you to register shortcuts/aliases for commands

# Installation

- If you have installed thelounge via NPM/Yarn:

  `thelounge install thelounge-plugin-shortcuts`

- If you have installed thelounge via source:

  `node index.js install thelounge-plugin-shortcuts`

# Usage

Adding a shortcut: `/shortcut add <from> <to>`, for example `/shortcut add j /join`.

**Note: you do need to add a `/` to the target, not doing so will just write `join` in the chat window**

Removing a shortcut: `/shortcut remove <name>`, for example `/shortcut remove j`.

You may choose to have one shortcut run multiple commands. To do so, just add a second shortcut via `/shortcut addnext <from> <to>`.

Listing all shortcuts: `/shortcut list`.

Shortcuts are saved to `THELOUNGE_HOME/packages/shortcuts.json`

# Placeholders

`thelounge-plugin-shortcuts` supports multiple placeholders:

- `{currentChannel}` will be replaced with the name of the channel where the shortcut was executed in
- `{0}`, `{1}`, `{n}` will be replaced with the first, second or nth argument that was entered after the shortcut
- `{args}` will be replaced with all arguments which were entered after the shortcut

# Examples

`/shortcut add shrug ¯\_(ツ)_/¯` -> /shrug will send ¯\_(ツ)\_/¯  
`/shortcut add j /join {args}` -> /j is an alias to /join  
`/shortcut add jc /join #my-cool-channel` -> /jc will join a bunch of channels  
`/shortcut add akick /msg chanserv akick {currentChannel} add {0} !T {1}` -> will akick SomeUser for 20 minutes

# Development

Currently thelounge doesn't offer a way to install packages from source without npm,
thats why you have to do it manually.

The easiest way is installing thelounge locally and adding this plugin as a new package in the THELOUNGE_HOME/packages dir.
For that you need to have a package.json in that packages dir that looks kinda like this:

```json
{
  "private": true,
  "description": "Packages for The Lounge. All packages in node_modules directory will be automatically loaded.",
  "dependencies": {
    "thelounge-theme-mininapse": "2.0.15",
    "thelounge-plugin-shortcuts": "1.0.1",
    "thelounge-plugin-giphy": "1.0.1"
  }
}
```

the important thing in the name here.

You then need to create a folder with that name in the node_modules sub dir.
We then need to place our index.js and package.json in that dir.
You can either do that manually by just copy pasting it, but that would involve copy pasting it for every change.
I would recommend symlinking the files from the project into the packages folder, kinda like this:

```
ln package.json ../thelounge-home/packages/node_modules/thelounge-plugin-shortcuts/package.json
ln index.js ../thelounge-home/packages/node_modules/thelounge-plugin-shortcuts/index.js
```

You can then just edit and commit the files in the project dir and restart thelounge
on every change you do and the changes will be picked up.

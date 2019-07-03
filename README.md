# thelounge-plugin-shortcuts [![pipeline status](https://img.shields.io/gitlab/pipeline/MiniDigger/thelounge-plugin-shortcuts/master.svg?style=for-the-badge)](https://gitlab.com/MiniDigger/thelounge-plugin-shortcuts/pipelines) [![npm downloads](https://img.shields.io/npm/dt/thelounge-plugin-shortcuts.svg?style=for-the-badge)](https://www.npmjs.com/package/thelounge-plugin-shortcuts) [![npm versions](https://img.shields.io/npm/v/thelounge-plugin-shortcuts.svg?style=for-the-badge)](https://www.npmjs.com/package/thelounge-plugin-shortcuts) [![licence mit](https://img.shields.io/github/license/MiniDigger/thelounge-plugin-shortcuts.svg?style=for-the-badge)](https://github.com/MiniDigger/thelounge-plugin-shortcuts/blob/master/LICENSE)

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

Listing all shortcuts: `/shortcut list`.


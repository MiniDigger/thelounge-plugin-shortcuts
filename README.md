# thelounge-plugin-shortcuts

Simple plugin for the irc client [thelounge](https://thelounge.chat) that allows you to register shortcuts/aliases for commands

# Installation

- If you have installed thelounge via NPM/Yarn:

   `thelounge install thelounge-plugin-shortcuts`
- If you have installed thelounge via source:

   `node index.js install thelounge-plugin-shortcuts`

# Usage

Adding a shortcut: `/shortcut add <from> <to>`, for example `/shortcut add j /join`.
**Note: how you do need to add a `/` to the target, not doing so will just write `join` in the chat window**

Removing a shortcut: `/shortcut remove <name>`, for example `/shortcut remove j`.

Listing all shortcuts: `/shortcut list`.


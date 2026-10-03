---
title: Server Console
description: Keyboard shortcuts, command history, reverse search, completion, and shutdown behavior of the SteelMC server console.
sidebar:
  order: 3
---

When you run SteelMC in a terminal, the console doubles as a command line. Log output scrolls above an input line where you can type commands, which run as the console sender. Console commands bypass player permission checks.

## Stopping the Server

| Shortcut | Action                                              |
| -------- | --------------------------------------------------- |
| `Ctrl+C` | Shut down gracefully once the input line is empty   |
| `Ctrl+Q` | Shut down gracefully, whatever is on the input line |

`Ctrl+C` checks these cases in order:

1. If text is selected, it copies the selection.
2. If the input line has text, it clears the line.
3. If the input line is empty, it shuts the server down.

To stop the server while typing a command, press `Ctrl+C` twice or `Ctrl+Q` once.

The `stop` command also shuts the server down. Every route goes through the same graceful shutdown, which saves world and player data before the process exits. The console also writes its command history to disk at this point.

### Signals

SteelMC also shuts down gracefully when the operating system asks it to stop. That covers running it as a service, in Docker, or without an interactive terminal.

| Platform | Handled signals                                                             |
| -------- | --------------------------------------------------------------------------- |
| Unix     | `SIGINT`, `SIGTERM`, `SIGHUP`                                               |
| Windows  | `Ctrl+C`, `Ctrl+Break`, closing the console window, logoff, system shutdown |

Only the first signal starts a shutdown. Later signals are ignored until the save finishes, so a second `Ctrl+C` will not cut the save short.

:::caution
`SIGKILL` (`kill -9`) and force-killing the process from a task manager cannot be handled. Anything not yet saved is lost.
:::

## Editing the Input Line

| Shortcut               | Action                                            |
| ---------------------- | ------------------------------------------------- |
| `Enter`                | Run the current command                           |
| `Left` / `Right`       | Move the cursor                                   |
| `Home` / `End`         | Jump to the start or end of the line              |
| `Backspace` / `Delete` | Delete the character before or after the cursor   |
| `Insert`               | Toggle overwrite mode (block cursor while active) |
| `Esc`                  | Clear the input line                              |

## Selecting and Copying

| Shortcut                     | Action                                               |
| ---------------------------- | ---------------------------------------------------- |
| `Shift+Left` / `Shift+Right` | Grow or shrink the selection one character at a time |
| `Shift+Home`                 | Select from the cursor to the start of the line      |
| `Shift+End`                  | Select from the cursor to the end of the line        |
| `Ctrl+A`                     | Select the whole line                                |
| `Ctrl+C`                     | Copy the selection                                   |
| `Ctrl+X`                     | Cut the selection                                    |

Typing, `Backspace`, or `Delete` with an active selection replaces or removes the selected text. Pressing `Left` or `Right` clears the selection and moves the cursor to its start or end.

Copying uses the OSC 52 terminal escape sequence, so it only works in terminals that support it, such as kitty, WezTerm, Alacritty, iTerm2, and Windows Terminal. Some terminals and multiplexers like tmux need OSC 52 clipboard access turned on. To paste, use your terminal's usual paste shortcut.

:::note
`Ctrl+C` only copies when something is selected. Otherwise it clears the input line, or shuts the server down if the line is already empty.
:::

## Command History

| Shortcut          | Action           |
| ----------------- | ---------------- |
| `Up` / `Ctrl+P`   | Previous command |
| `Down` / `Ctrl+N` | Next command     |
| `Ctrl+R`          | Search history   |

History is saved to `history.txt` inside the [log directory](../../configuration/server-configuration) (`log.log_path`, default `./.logs`) and persists across restarts. The console keeps the last `log.max_history` commands (default `50`).

### Reverse Search

Press `Ctrl+R` to search your history backwards, like in Bash. The prompt changes to show what you are searching for:

```text
(reverse-i-search)`give': give @s diamond 64
```

As you type, the input line shows the newest command that contains your query, with the matching part highlighted. If nothing matches, the prompt says `failed reverse-i-search` and the last match stays on screen.

| Shortcut                    | Action                                                |
| --------------------------- | ----------------------------------------------------- |
| `Ctrl+R`                    | Jump to the next older match                          |
| `Backspace`                 | Remove the last character from the query              |
| `Enter`                     | Run the matched command                               |
| `Tab`                       | Keep the match on the input line so you can edit it   |
| `Esc` / `Ctrl+C` / `Ctrl+G` | Cancel the search and restore the line you had before |

Other keys, such as the arrow keys or `Home`, also keep the match and then do their usual action. After you take a match, `Up` and `Down` continue through the history from that command.

## Command Completion

Press `Tab` to show suggestions for the command you are typing. While suggestions are open:

| Shortcut          | Action                                               |
| ----------------- | ---------------------------------------------------- |
| `Up` / `Ctrl+P`   | Highlight the previous suggestion                    |
| `Down` / `Ctrl+N` | Highlight the next suggestion                        |
| `Tab`             | Insert the highlighted suggestion and close the list |

The list updates as you type or move the cursor.

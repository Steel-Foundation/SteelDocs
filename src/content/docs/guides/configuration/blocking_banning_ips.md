---
title: Black & White listing IPs
description: Shows how to ban, shadowbanned, whitelist IPs and which consequences it has.
---

# Basic knowledge
Some terms are familiar from Minecraft, but Steel provides more functionality than normal Minecraft for some commands. Steel gives 3 options to control IPs: shadowbanned, whitelist and banning. These are powerful tools for server owners.

This documentation is part of the functionality and file storage. If you want to know all commands for this topic you can find it here.
Instead of checking the expire date with every call, Steel checks every minute if an IP ban has expired, so it will not be accurate to the second.

When Steel starts, it tries to find the file `ip-bans.toml`. If it can't find that file, it searches for Minecraft's `banned-ips.toml` and loads the data into memory; on the next save, it converts the data to Steel's format so it can be used on the next start. There is also a command to trigger the loading manually. If a vanilla entry has no reason or an empty one, Steel substitutes the default reason `Your IP was banned`.

## shadowbanned
This controls connections to the server itself. So if an IP is on the shadowbanned, a device with that IP can't start a connection with that server. That means the client doesn't get any data. The server will be displayed as not running and even if a client tries to connect it will not work.

## Whitelist
Minecraft allows whitelisting players, so only these can connect. It's the same idea but for IPs. So only clients with an IP in the whitelist can connect to Steel. This can be used for server network setups to allow for example only proxy servers to connect to this Steel server. So a client can't connect directly to this Steel server, only via proxy.

## Banning
This is the same feature Minecraft has, but with a few extras. Unlike a shadowbanned, the TCP connection is accepted normally; the rejection happens once the client tries to join the game. The player is then kicked with a disconnect screen that shows both the ban reason and the expiry date (or `Never` for permanent bans).

## How the lists interact
The whitelist takes precedence over both the shadowbanned and the ban list. As soon as the whitelist contains at least one entry, Steel only checks the whitelist: an IP that is on the whitelist is allowed in even if it is also shadowbanneded or banned, and an IP that is not on the whitelist is rejected even if it is not shadowbanneded or banned. With an empty whitelist, the shadowbanned and ban list both apply normally.

## Configuration/Usage
The whitelist is located in the `config.toml` with the property `whitelisted_ips` which is a simple array of strings with all IP addresses. It can be only edited via the config file so there is only a list command available.
It will look like this:
```toml
[server]
# IP addresses allowed to connect to the server. If empty, no whitelist is applied.
whitelisted_ips = ["127.0.0.1"]
```

The second file is `ip-bans.toml` which holds the shadowbanned and the banned IP data. The shadowbanned is, like the whitelist, a property `shadowbanned` and an array of strings which represent IPs; it can be edited via file or commands.

For banning IPs more options are possible: beyond Minecraft's options, Steel also has the option to give an expire date and reason. This can also be done with commands, more information about which you can find here. The full `ip-bans.toml` file has two top-level arrays — `ip_banned` for the metadata-rich ban entries and `shadowbanned` for the bare shadowbanned:
```toml
shadowbanned = []

[[ip_banned]]
ip = "127.0.0.2"
created = "2026-04-29 22:29:23 +0000"
source = "Server"
expires = "forever"
reason = '{"text":"Banned by an operator."}'
```
The reason can be also a text component or a simple string.
`Created` and `expires` have the format: `year-month-day hour:minute:second +timezone`.
Additionally, `expires` allows `forever` as an input; this IP ban will never expire.
The source will be the plugin, server, or player that executed the command.

Changes made via commands are kept in memory and only written to disk when the server shuts down cleanly. If the server crashes before that, recent ban or shadowbanned edits can be lost — run the save command manually if you need them persisted earlier.
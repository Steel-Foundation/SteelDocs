---
title: Black & White listing IPs
description: Shows how to ban, blacklist, whitelist IPs and which consequences it has.
---

# Basic knowledge
Some terms are familiar from Minecraft, but Steel provides more functionality than normal Minecraft for some commands. Steel gives 3 options to control IPs: blacklist, whitelist and banning. These are powerful tools for server owners.

This documentation is part of the functionality and file storage. If you want to know all commands for this topic you can find it here.
Instead of checking the expire date with every call, Steel checks every minute if an IP ban has expired, so it will not be accurate to the second.

When Steel starts, it tries to find the file `ip-bans.json`. If it can't find that file, it searches for Minecraft's `banned-ips.json` and loads the data into memory; on the next save, it converts the data to Steel's format so it can be used on the next start. There is also a command to trigger the loading manually.

## Terminology

### Blacklist
This controls connections to the server itself. So if an IP is on the blacklist, a device with that IP can't start a connection with that server. That means the client doesn't get any data. The server will be displayed as not running and even if a client tries to connect it will not work.

### Whitelist
Minecraft allows whitelisting players, so only these can connect. It's the same idea but for IPs. So only clients with an IP in the whitelist can connect to Steel. This can be used for server network setups to allow for example only proxy servers to connect to this Steel server. So a client can't connect directly to this Steel server, only via proxy.

### Banning
This is the same feature Minecraft has, but with a few extras. So the player gets information.

## Configuration
The whitelist is located in the `steel-config.json5` with the property `whitelist` which is a simple array of strings with all IP addresses. It can be only edited via the config file so there is only a list command available.

The second file is `ip-bans.json` which holds the blacklist and the banned IP data. The blacklist is, like the whitelist, a property `blacklisted` and an array of strings which represent IPs; it can be edited via file or commands.

For banning IPs more options are possible: beyond Minecraft's options, Steel also has the option to give an expire date and reason. This can also be done with commands, more information about which you can find here. This is an example file structure:
```json
{
  "ip": "127.0.0.3",
  "created": "2026-04-28 23:42:49 +0000",
  "source": "Server",
  "expires": "forever",
  "reason": {
    "text": "Banned by an operator."
  }
}
```
The reason can be also a text component or a simple string.
`Created` and `expires` have the format: `year-month-day hour:minute:second +timezone`.
Additionally, `expires` allows `forever` as an input; this IP ban will never expire.
The source will be the plugin, server, or player that executed the command.
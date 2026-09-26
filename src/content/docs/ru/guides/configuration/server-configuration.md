---
title: Конфигурация сервера
description: Полный справочник всех параметров конфигурации сервера в SteelMC
sidebar:
  order: 2
---

SteelMC настраивается через TOML-файл конфигурации, расположенный по адресу `config/config.toml`. На этой странице описаны все параметры сервера.

Настройки миров описаны в разделе [Конфигурация миров](../world-configuration).

## Основные настройки

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `server.server_port` | u16 | `25565` | Порт, который слушает сервер |
| `server.max_players` | u32 | `20` | Максимальное количество одновременных игроков |
| `server.view_distance` | u8 | `10` | Максимальная дальность обзора в чанках (1-32) |
| `server.simulation_distance` | u8 | `10` | Максимальная дистанция симуляции в чанках |
| `server.motd` | String | `"A Steel Server"` | Сообщение, отображаемое в списке серверов |

## Настройки безопасности

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `server.online_mode` | bool | `true` | Использовать аутентификацию Mojang для проверки игроков |
| `server.encryption` | bool | `true` | Включить шифрование связи клиент-сервер |
| `server.enforce_secure_chat` | bool | `false` | Принудительно использовать безопасный чат (требует `online_mode` и `encryption`) |

:::caution
Отключение `online_mode` позволяет подключаться пиратским клиентам. Отключайте только если понимаете, что делаете, или для частных сетей и разработки.
:::

:::info
Для отладки и ботов рекомендуется отключать шифрование (только для тестирования!)
:::

## Настройки фавиконки

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `server.use_favicon` | bool | `true` | Использовать ли пользовательскую иконку сервера |
| `server.favicon` | String | `"config/favicon.png"` | Путь к файлу иконки (64x64 PNG) |

## Настройки сжатия

Сжатие сетевого трафика снижает использование пропускной способности ценой нагрузки на процессор.

| Параметр | Тип | По умолчанию | Допустимый диапазон | Описание |
|--------|------|---------|-------------|-------------|
| `server.compression.threshold` | u32 | `256` | ≥256 | Порог размера пакета для сжатия |
| `server.compression.level` | i32 | `4` | 1-9 | Уровень сжатия (1=быстро, 9=максимально) |

## Ссылки сервера

Ссылки сервера отображаются в меню многопользовательской игры.

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `server.server_links.enable` | bool | `true` | Включить функцию ссылок сервера |
| `server.server_links.links` | Array | 4 ссылки | Список отображаемых ссылок |

Подробнее см. [Руководство по ссылкам сервера](../server-links).

## Настройки логирования

| Параметр | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `log.time` | String | `"uptime"` | Формат времени: `none`, `date` или `uptime` |
| `log.module_path` | bool | `false` | Показывать ли путь к модулю |
| `log.extra` | bool | `false` | Показывать ли дополнительные данные лога |

## Пример конфигурации

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
view_distance = 12
simulation_distance = 10
online_mode = true
encryption = true
motd = "Welcome to my Steel server!"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false

[server.compression]
threshold = 256
level = 4

[server.server_links]
enable = true

[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

[log]
time = "uptime"
module_path = false
extra = false
```

## Правила валидации

Сервер проверяет конфигурацию при запуске:

- неизвестные поля отклоняются
- `server.view_distance` должен быть от 1 до 32
- `server.simulation_distance` должен быть меньше или равен `server.view_distance`
- `server.compression.threshold` должен быть не менее 256
- `server.compression.level` должен быть от 1 до 9
- если `server.enforce_secure_chat` включён, то `server.online_mode` и `server.encryption` должны быть включены

Если валидация не пройдена, сервер завершит работу с сообщением об ошибке.
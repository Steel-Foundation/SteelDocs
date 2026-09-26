---
title: Как добавить ссылки сервера
description: Основные сведения о ссылках сервера и их настройке.
---

Ссылки сервера позволяют добавить в меню паузы пользователя ссылки, по которым он может перейти. Например, собственный маркетплейс, сайт сервера и т.д.

Есть два подхода: встроенные варианты, которые быстро настраиваются, но имеют ограниченные возможности, и текстовые компоненты (TextComponents), где можно создавать и стилизовать как угодно.

## Включение ссылок сервера

Сначала ссылки сервера нужно активировать. Для этого добавьте в ваш `config/config.toml` следующий текст:

```toml
# /config/config.toml

[server.server_links]
# Включить функцию ссылок сервера
enable = true
```

Это добавляется ниже конфигурации сервера. Чтобы временно отключить, установите `enable` в `false`.

## Встроенные ссылки сервера

Доступно 10 встроенных типов ссылок:

- `bug_report`
- `community_guidelines`
- `support`
- `status`
- `feedback`
- `community`
- `website`
- `forums`
- `news`
- `announcements`

Особый случай - `bug_report`: она также отображается, если сервер аварийно завершает работу, выбрасывает исключение или отправляет некорректные данные клиенту.

Используется так:
```toml
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

Полный пример:
```toml
# /config/config.toml

[server.server_links]
# Включить функцию ссылок сервера
enable = true

# Встроенный тип ссылки (простая строковая метка)
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

## Пользовательские ссылки сервера
Это текстовые компоненты (TextComponent), дающие гораздо больше возможностей для оформления с произвольным текстом и цветом.
Выглядит это так:
```toml
[[server.server_links.links]]
label = { text = "Посетите SteelMC Discord", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```
### Дополнительные ресурсы
В интернете вы найдёте множество руководств по TextComponent и их правильному использованию.

<details>
<summary>Полный пример конфигурации</summary>

```toml
# /config/config.toml

[server]
# Порт сервера
server_port = 25565
# Максимальное количество игроков
max_players = 20
# Максимальная дальность обзора в чанках
view_distance = 10
# Максимальная дистанция симуляции в чанках
simulation_distance = 10
# Использовать ли аутентификацию Mojang
online_mode = true
# Включить ли шифрование связи клиент-сервер
encryption = true
# Сообщение дня (MOTD)
motd = "A Steel Server"
# Использовать ли пользовательскую иконку сервера
use_favicon = true
# Путь к файлу иконки (PNG, 64x64 пикселя)
favicon = "config/favicon.png"
# Принудительно использовать безопасный чат
enforce_secure_chat = false

# Настройки сжатия
[server.compression]
threshold = 256
level = 4

# Конфигурация ссылок сервера
[server.server_links]
# Включить функцию ссылок сервера
enable = true

# Встроенный тип ссылки (простая строковая метка)
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

# Ещё один встроенный тип
[[server.server_links.links]]
label = "website"
url = "https://github.com/4lve/SteelMC"

# Новостной канал в Discord
[[server.server_links.links]]
label = "announcements"
url = "https://discord.com/channels/1428487339759370322/1428487584966774795"

# Пользовательский TextComponent (метка-объект с форматированием)
[[server.server_links.links]]
label = { text = "Посетите SteelMC Discord", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```
</details>
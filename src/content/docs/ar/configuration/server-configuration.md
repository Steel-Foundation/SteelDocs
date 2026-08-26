---
title: إعدادات الخادم
description: مرجع شامل لكافة خيارات إعدادات الخادم في SteelMC
sidebar:
  order: 2
---

يتم ضبط إعدادات SteelMC عبر ملف بصيغة TOML يقع في المسار `config/config.toml`. يوثق هذا الدليل جميع الخيارات المتاحة للخادم.

إعدادات العوالم موثقة في [إعدادات العوالم](../world-configuration).

## الإعدادات الأساسية

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.server_port` | u16 | `25565` | المنفذ الذي يستمع إليه الخادم |
| `server.max_players` | u32 | `20` | أقصى عدد من اللاعبين المسموح بتواجدهم في نفس الوقت |
| `server.allow_extended_view_distance` | bool | `false` | السماح بزيادة `view_distance` عن الحد الافتراضي لفانيلا (32) حتى 127 Chunk |
| `server.view_distance` | u8 | `10` | أقصى مسافة للرؤية بالـ Chunks (افتراضياً 1-32، أو 1-127 عند تفعيل الخيار الموسع) |
| `server.simulation_distance` | u8 | `10` | أقصى مسافة للمحاكاة بالـ Chunks (يجب أن تكون أقل من أو تساوي مسافة الرؤية) |
| `server.motd` | String | `"A Steel Server"` | الرسالة المعروضة في قائمة الخوادم (Message of the Day) |

:::note
إذا تجاوزت مسافة الرؤية 32 Chunk، سيحتاج اللاعبون عبر فانيلا إلى تعديل (Mod) في جهاز العميل لدعم مسافات عرض أكبر.
:::

## إعدادات المسارات (Threads)

تحديد عدد مسارات العمل لمجمعات خيوط المعالجة. عند تعيين `0` أو الحذف، يتم استخدام القيمة التلقائية الافتراضية.

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.threads.main_runtime` | usize | 0 | خيوط العمل لبيئة تشغيل Tokio الأساسية. |
| `server.threads.chunk_runtime` | usize | 0 | خيوط العمل لبيئة تشغيل Tokio الخاصة بالـ Chunks. |
| `server.threads.chunk_generation` | usize | 0 | خيوط العمل لمجمع Rayon الخاص بتوليد الـ Chunks. |

## إعدادات الأمان

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.online_mode` | bool | `true` | استخدام مصادقة Mojang للتحقق من هوية اللاعبين |
| `server.auth_server` | String | غير محدد | نقطة نهاية اختيارية لـ `hasJoined` (اتركه فارغاً لاستخدام Mojang) |
| `server.profile_server` | String | غير محدد | نقطة نهاية اختيارية للبحث عن الملف الشخصي عبر الاسم |
| `server.services_server` | String | غير محدد | نقطة نهاية اختيارية للمفتاح العام للتحقق من المحادثة الآمنة |
| `server.encryption` | bool | `true` | تفعيل التشفير للاتصال بين العميل والخادم |
| `server.allow_flight` | bool | `false` | السماح بالطيران للاعبين غير المصرح لهم دون طردهم |
| `server.enforce_secure_chat` | bool | `false` | فرض المحادثة الآمنة (يتطلب `online_mode = true` و `encryption = true`) |

:::caution
تعطيل `online_mode` يسمح للحسابات غير الرسمية والمكركة بالدخول. لا تقم بتعطيله إلا على الشبكات الخاصة أو أثناء التطوير.
:::

:::info
أثناء التنقيح واستخدام روبوتات الاختبار، يُنصح بتعطيل التشفير مؤقتاً (لأغراض الاختبار فقط!).
:::

## إعدادات المحادثة

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.chat_spam_threshold_seconds` | i32 | `10` | نافذة تكرار الرسائل بالثواني (القيم <= 0 تعطل الحظر) |
| `server.command_spam_threshold_seconds` | i32 | `10` | نافذة تكرار الأوامر بالثواني (القيم <= 0 تعطل الحظر) |

## إعدادات أيقونة الخادم (Favicon)

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.use_favicon` | bool | `true` | تفعيل استخدام أيقونة مخصصة |
| `server.favicon` | String | `"config/favicon.png"` | مسار ملف الأيقونة (PNG بأبعاد 64x64) |

## إعدادات الضغط (Compression)

يقلل ضغط البيانات عبر الشبكة من استهلاك النطاق الترددي على حساب استخدام المعالج.

| الخيار | النوع | القيمة الافتراضية | النطاق المسموح | الوصف |
| :--- | :--- | :--- | :--- | :--- |
| `server.compression.threshold` | u32 | `256` | >=256 | الحد الأدنى لحجم الحزمة لتفعيل الضغط |
| `server.compression.level` | i32 | `4` | 1-9 | مستوى الضغط (1=أسرع، 9=أعلى ضغط) |

جدول `[server.compression]` اختياري؛ عند حذفه، يتم تعطيل الضغط.

## روابط الخادم

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `server.server_links.enable` | bool | `true` | تفعيل ميزة روابط الخادم |
| `server.server_links.links` | Array | 4 روابط | قائمة الروابط المعروضة |

راجع [دليل روابط الخادم](../server-links) للتفاصيل.

## إعدادات السجلات (Logging)

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `log.log_path` | String | `"./.logs"` | مجلد ملفات السجلات وتاريخ الأوامر |
| `log.log_level` | String | `"info"` | مستوى السجلات: `error`, `warn`, `info`, `debug`, أو `trace` |
| `log.time` | String | `"uptime"` | صيغة الوقت: `none`, `date`, أو `uptime` |
| `log.module_path` | bool | `false` | عرض مسار الوحدة البرمجية في السجل |
| `log.extra` | bool | `false` | عرض بيانات إضافية في السجل |
| `log.log_file` | bool | `true` | كتابة السجلات في ملفات على القرص |
| `log.rotation_time` | String | `"daily"` | دورة تدوير الملفات: `none`, `hourly`, `daily`, `weekly`, أو `monthly` |
| `log.max_history` | usize | `50` | عدد أوامر الطرفية المحفوظة في السجل |

## مثال كامل لملف الإعدادات

```toml
# /config/config.toml

[server]
server_port = 25565
max_players = 50
allow_extended_view_distance = false
view_distance = 12
simulation_distance = 10
online_mode = true
# auth_server = "https://sessionserver.mojang.com/session/minecraft/hasJoined"
# profile_server = "https://api.minecraftservices.com/minecraft/profile/lookup/name"
# services_server = "https://api.minecraftservices.com/publickeys"
encryption = true
allow_flight = false
motd = "Welcome to my Steel server!"
use_favicon = true
favicon = "config/favicon.png"
enforce_secure_chat = false
chat_spam_threshold_seconds = 10
command_spam_threshold_seconds = 10

[server.threads]
main_runtime = 0
chunk_runtime = 0
chunk_generation = 0

[server.compression]
threshold = 256
level = 4

[server.server_links]
enable = true

[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

[log]
log_path = "./.logs"
log_level = "info"
time = "uptime"
module_path = false
extra = false
log_file = true
rotation_time = "daily"
max_history = 50
```

## قواعد التحقق والتدقيق

يقوم الخادم بالتحقق من صحة الإعدادات عند بدء التشغيل:

- يتم رفض أي حقول غير معروفة
- يجب أن تكون `server.view_distance` بين 1 و 32، أو بين 1 و 127 عند تفعيل `server.allow_extended_view_distance`
- يجب أن تكون `server.simulation_distance` أقل من أو تساوي `server.view_distance`
- يجب أن تكون عناوين `auth_server` و `profile_server` و `services_server` روابط صحيحة تبدأ بـ `http` أو `https`
- يجب ألا يقل `server.compression.threshold` عن 256
- يجب أن يكون `server.compression.level` بين 1 و 9
- إذا تم تفعيل `server.enforce_secure_chat`، فيجب تفعيل كل من `server.online_mode` و `server.encryption`
- يجب أن تكون قيم `log.log_level` و `log.time` و `log.rotation_time` من ضمن الخيارات المعتمدة المذكورة أعلاه

---
title: كيفية إضافة روابط الخادم (Server Links)
description: فهم أساسيات روابط الخادم وكيفية إعدادها وتخصيصها.
---

تتيح ميزة روابط الخادم (Server Links) إمكانية إضافة روابط قابلة للنقر في شاشة الإيقاف المؤقت (Pause Screen) لدى اللاعب داخل ماين كرافت، مثل رابط المتجر، موقع الخادم، أو الديسكورد.

هناك طريقتان لإعداد الروابط: الروابط المدمجة المجهزة مسبقاً (سريعة لكنها بخيارات تخصيص محدودة)، والمكونات النصية المخصصة (TextComponents) التي تتيح لك تخصيص الألوان والتنسيقات بحرية.

## تفعيل روابط الخادم

لتفعيل الميزة، أضف الأسطر التالية إلى ملف `config/config.toml`:

```toml
# /config/config.toml

[server.server_links]
# تفعيل ميزة روابط الخادم
enable = true
```

تضاف هذه الكتلة أسفل إعدادات الخادم `[server]`. لتعطيل الميزة مؤقتاً، يمكنك تعيين `enable = false`.

## روابط الخادم المدمجة

يتوفر 10 أنواع مدمجة لروابط الخادم:

- `bug_report` (الإبلاغ عن خطأ)
- `community_guidelines` (إرشادات المجتمع)
- `support` (الدعم الفني)
- `status` (حالة الخادم)
- `feedback` (الملاحظات والآراء)
- `community` (المجتمع)
- `website` (الموقع الإلكتروني)
- `forums` (المنتديات)
- `news` (الأخبار)
- `announcements` (الإعلانات)

الحالة الخاصة الوحيدة هي `bug_report` حيث تظهر تلقائياً للاعب إذا واجه الخادم خطأ غير متوقع أو أرسل بيانات غير صالحة للعميل.

مثال على الاستخدام:
```toml
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

مثال متكامل:
```toml
# /config/config.toml

[server.server_links]
# تفعيل ميزة روابط الخادم
enable = true

# رابط مدمج (نص تصنيف بسيط)
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"
```

## روابط الخادم المخصصة
تعتمد على TextComponent لتمنحك تحكماً كاملاً في النص والألوان والتنسيق:
```toml
[[server.server_links.links]]
label = { text = "Visit the SteelMC Discord", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```

<details>
<summary>ملف إعدادات كامل كمثال</summary>

```toml
# /config/config.toml

[server]
# منفذ الخادم
server_port = 25565
# أقصى عدد للاعبين
max_players = 20
# مسافة الرؤية بالـ Chunks
view_distance = 10
# مسافة المحاكاة بالـ Chunks
simulation_distance = 10
# التحقق من حسابات Mojang الرسمية
online_mode = true
# تشفير الاتصال بين العميل والخادم
encryption = true
# رسالة اليوم MOTD
motd = "A Steel Server"
# استخدام أيقونة مخصصة للخادم
use_favicon = true
# مسار الأيقونة (صيغة PNG، بأبعاد 64x64 بكسل)
favicon = "config/favicon.png"
# فرض المحادثة الآمنة
enforce_secure_chat = false

# إعدادات ضغط البيانات
[server.compression]
threshold = 256
level = 4

# إعدادات روابط الخادم
[server.server_links]
enable = true

# رابط مدمج
[[server.server_links.links]]
label = "bug_report"
url = "https://github.com/4lve/SteelMC/issues"

# رابط مدمج آخر
[[server.server_links.links]]
label = "website"
url = "https://github.com/4lve/SteelMC"

# قناة الإعلانات في الديسكورد
[[server.server_links.links]]
label = "announcements"
url = "https://discord.com/channels/1428487339759370322/1428487584966774795"

# رابط مخصص مع تنسيق TextComponent
[[server.server_links.links]]
label = { text = "Visit the SteelMC Discord", color = "blue", bold = true }
url = "https://discord.gg/suSXXNdVSf"
```
</details>

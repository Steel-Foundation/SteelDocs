---
title: كيفية إلغاء ترجمة ماين كرافت (Decompile)
description: كيفية استخراج الكود المصدري لماين كرافت لاستخدامه كمرجع.
---

بدءاً من الإصدار 1.21.11 أصبح الكود غير مموه (Unobfuscated)، ويستهدف Steel الإصدارات الحديثة، لذا يوضح هذا الدليل كيفية استخراج الكود المصدري كمرجع تطويري.

## المتطلبات

استخدم مشغل ماين كرافت الرسمي أو مشغلات مثل Prism Launcher لإنشاء نسخة بالإصدار المستهدف وتشغيلها لتنزيل ملف الـ JAR الخاص باللعبة.

## طرق استخراج الكود المصدري

- استخدام سكربت `update-minecraft-src.sh` المرفق في مستودع SteelMC (والذي يستخدم `gitcraft` خلف الكواليس).

- استخدام مستعرض الكود المصدري عبر الويب لمشاركة الروابط مع المطورين: [mcsrc.dev](https://mcsrc.dev) (أو [https://mcsrc.dev/1/26.1]).

- استنساخ مستودع [gitcraft](https://github.com/WinPlay02/GitCraft) وتشغيل:
  `./gradlew run --args="--only-stable --min-version=1.21.11 --only-unobfuscated"`
  والذي سينشئ المجلد `minecraft-repo-mojmap-unobfuscated-min-1.21.11-stable/minecraft` محتوياً على كافة المصادر.

- أو تنزيل [vinflower.jar](https://github.com/Vineflower/vineflower/releases) وتشغيل الأمر:
  `java -jar vineflower-1.11.2.jar ./minecraft-26.1-client.jar --folder minecraft_26.1`

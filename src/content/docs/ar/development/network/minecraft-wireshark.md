---
title: تنقيح حركة بيانات شبكة ماين كرافت
description: كيفية فحص وتنقيح شبكة ماين كرافت باستخدام Wireshark.
---

يشرح هذا المستند كيفية فحص وتنقيح حزم بيانات شبكة ماين كرافت لمراقبة كيفية إرسال الحزم والبيانات.

إذا كنت تبحث عن أداة بديلة مخصصة لماين كرافت، فيمكنك الاستعانة بمشروع: [https://github.com/adepierre/SniffCraft](https://github.com/adepierre/SniffCraft)

## المتطلبات الأساسية

أولاً، **يجب تعطيل التشفير والضغط**.
يمكنك ضبط هذه الخيارات في ملف `config/config.toml` الذي يتولد بعد التشغيل الأول:

```toml
[server]
encryption = false
```

احذف جدول `[server.compression]` أثناء التقاط الحزم. إذا رغبت في الإبقاء على الضغط لاختبار معين، فاضبط `server.compression.threshold` على قيمة مرتفعة جداً لتبقى الحزم غير مضغوطة.

سوف تحتاج إلى:

- **خادم ماين كرافت محلي**
- برنامج **Wireshark** بصلاحيات مناسبة لالتقاط البيانات على `localhost`

يمكنك مقارنة الحزم الملتقطة مع التوثيق الرسمي لبروتوكول ماين كرافت:
[https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

## إعداد Wireshark

يمكنك استخدام Wireshark مباشرة، ولكن لقراءة وتحليل الحزم بسهولة يُوصى بترجمة واستخدام **إضافة محلل ماين كرافت (Dissector Plugin)**.

### إضافة تحليل ماين كرافت لـ Wireshark

المستودع:
[https://github.com/Nickid2018/MC_Dissector](https://github.com/Nickid2018/MC_Dissector)

المتطلبات:

- **Wireshark 4.6** (موصى به)

قم بترجمة الإضافة باتباع التعليمات الموجودة في ملف `ci.yaml` بالمستودع.

**لنظام Linux:**\
بعد الترجمة، انسخ ملف `.so` الناتج إلى:

```bash
~/.local/lib/wireshark/plugins/<Wireshark Version>/epan
```

**لنظام Windows:**\
بعد الترجمة، انسخ ملف `.dll` الناتج إلى:

```bash
plugins/<Wireshark Version>/epan
```

### مستودع بيانات البروتوكول

استنسخ مستودع بيانات البروتوكول:

[https://github.com/Nickid2018/MC_Protocol_Data](https://github.com/Nickid2018/MC_Protocol_Data)

## تهيئة Wireshark

شغّل Wireshark، ثم توجه إلى:

**Preferences → Protocols → Minecraft**

اختر البروتوكول وحدد المسار لمستودع `MC_Protocol_Data` المستنسخ، ثم **أعد تشغيل Wireshark**.

## فلتر العرض الموصى به

للحصول على رؤية واضحة لحزم ماين كرافت، استخدم الفلتر:

```
mcje
```

## النتيجة

ستظهر الحزم بصيغة واضحة ومقروءة ومفصلة الحقول، مما يجعل تنقيح البروتوكول أكثر سهولة وسرعة.

![عرض Wireshark](@/assets/wireshark_output.webp "مخرجات محلل حزم ماين كرافت")

## مراجع إضافية

- [إلغاء ترجمة ماين كرافت](../../decompile-minecraft/)
- [https://minecraft.wiki/w/Java_Edition_protocol/Packets](https://minecraft.wiki/w/Java_Edition_protocol/Packets)

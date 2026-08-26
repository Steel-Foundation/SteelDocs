---
title: إضافة بلوك جديد (الإعداد الأساسي)
description: دليل مبسط لإضافة بلوك جديد وتعديل سلوكه البرمجي في SteelMC.
---

> يوضح هذا الدليل الإعداد الهيكلي الأساسي **دون تضمين السلوكيات التفاعلية الكاملة بعد**.

---

## 1. تحديد البلوك المراد إضافته

أولاً، اختر البلوك الذي ترغب في إضافته إلى المشروع.

**مثال:** في هذا الدليل، سنقوم بإضافة **قضبان الحديد (Iron Bars)**.

---

## 2. التحقق من اسم الفئة في `classes.json`

قبل إنشاء الـ Struct، نحتاج إلى التحقق من الاسم القياسي المعتمد للبلوك.

توجه إلى الملف:

```
steel-core/build/classes.json
```

ابحث عن اسم البلوك داخل الملف. في مثالنا:
- نجد `IronBarsBlock`

هذا يعني أننا بحاجة إلى **Struct واحد** لإدارة هذا البلوك.

---

## 3. إنشاء ملف فئة البلوك

الآن أنشئ ملف الفئة في المسار:

```
steel-core/src/behavior/blocks/
```

احرص على أن يكون اسم الملف **واضحاً ومطابقاً لاسم البلوك**. في مثالنا:
- `iron_bars_block.rs`

---

## 4. إضافة تعريف الـ Struct

أضف الـ Struct التالي إلى الملف:

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
    /// ينشئ كائناً جديداً من IronBarsBlock
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehavior for IronBarsBlock {}
```

---

## 5. تسجيل وحدة البلوك (Register Block Behavior)

لتسجيل البلوك تلقائياً في النظام، نضيف السمة `#[block_behavior]` أعلى تعريف الـ Struct:

```rust
// /steel-core/src/behavior/blocks/iron_bars_block.rs
#[block_behavior]
pub struct IronBarsBlock {
    block: BlockRef,
}

impl IronBarsBlock {
    /// ينشئ كائناً جديداً من IronBarsBlock
    #[must_use]
    pub const fn new(block: BlockRef) -> Self {
        Self { block }
    }
}

impl BlockBehavior for IronBarsBlock {}
```

> تحتوي البلوكات الأكثر تعقيداً على خصائص إضافية (Properties). يمكنك الاطلاع على مزيد من التفاصيل [هنا](../../block_item_registration/).

---

## 6. ترجمة وبناء المشروع

الآن قم بـ **بناء وترجمة الكود**، وسيقوم Rust تلقائياً بتسجيل البلوك!

بعد اكتمال الترجمة، يجب أن يظهر البلوك الخاص بك في:

```
steel-core/src/behavior/generated/blocks.rs
```

يمكنك فتح الملف والبحث بـ **Ctrl + F** للتأكد من وجود اسم البلوك.

### حل المشكلات

إذا لم يظهر البلوك:

1. احذف مجلد `generated`
2. في الطرفية، نفذ الأمر:

   ```
   cargo clean
   ```
3. أعد الترجمة مجدداً.

---

# إضافة السلوك البرمجي للبلوك

حتى هذه المرحلة، لا يمتلك البلوك **أي تفاعل أو سلوك برمجي**.

لإضافة السلوكيات، يلزم تنفيذ الدوال المطلوبة داخل `BlockBehavior` في ملفك (مثل `iron_bars_block.rs`).

نوصي بالاطلاع على تطبيقات البلوكات الحالية المشابهة في الوظيفة للبلوك الذي تطوره.

---

## التعامل مع حالات البلوك (Block States)

### الحصول على حالة البلوك (Block State)

```rust
let west_pos = Direction::West.relative(pos);
let west_state = world.get_block_state(&west_pos);
```

في هذا المثال، تم الحصول على إحداثيات البلوك الواقع إلى الغرب وحفظ حالته في `west_state`.

---

### تعديل خصائص حالة البلوك

```rust
state.set_value(&BlockStateProperties::WEST, true); 
```

---

## فحص البلوكات المجاورة والوسوم (Tags)

```rust
let neighbor_block = neighbor_state.get_block();
let excluded = is_excluded_for_connection(neighbor_block);
    (!excluded && world.is_face_sturdy(neighbor_state, neighbor_pos, direction.opposite()))
    || neighbor_block.has_tag(&BlockTag::BARS)
    || neighbor_block.has_tag(&BlockTag::WALLS)
    || neighbor_block.has_tag(&BlockTag::C_GLASS_PANES)
```

---

بعد الانتهاء واختبار الكود، يمكنك فتح طلب سحب (Pull Request) على GitHub لمراجعته من قِبل المشرفين.

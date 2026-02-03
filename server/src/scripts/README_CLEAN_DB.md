# Database Tozalash Script

⚠️ **OGOHLANTIRISH**: Bu script database'ni to'liq tozalaydi!

## Nima o'chiriladi?

- ❌ Barcha filiallar
- ❌ Barcha filial adminlar
- ❌ Barcha o'qituvchilar
- ❌ Barcha o'quvchilar
- ❌ Barcha guruhlar
- ❌ Barcha testlar va natijalar
- ❌ Barcha topshiriqlar
- ❌ Barcha konfiguratsiyalar
- ❌ Barcha yuklangan fayllar

## Nima qoladi?

- ✅ SUPER_ADMIN foydalanuvchilar
- ✅ Rollar (SUPER_ADMIN, BRANCH_ADMIN, TEACHER, OBSERVER)
- ✅ Fanlar (Matematika, Fizika, va boshqalar)

## Ishlatish

```bash
cd server
npm run clean-db
```

## Jarayon

1. Script hozirgi holatni ko'rsatadi
2. 5 soniya kutadi (Ctrl+C bosib bekor qilish mumkin)
3. Barcha ma'lumotlarni o'chiradi
4. Qolgan ma'lumotlarni ko'rsatadi

## Misol Natija

```
⚠️  ============= DATABASE TOZALASH =============
Bu script database'ni tozalaydi va faqat SUPER_ADMIN qoldiradi!

🔌 MongoDB ga ulanish...
✅ MongoDB ga ulandi

⚠️  ============= OGOHLANTIRISH =============
Bu script quyidagi ma'lumotlarni o'chiradi:
  ❌ Barcha filiallar
  ❌ Barcha filial adminlar
  ❌ Barcha o'qituvchilar
  ❌ Barcha o'quvchilar
  ❌ Barcha guruhlar
  ❌ Barcha testlar
  ❌ Barcha natijalar
  ❌ Barcha topshiriqlar
  ❌ Barcha konfiguratsiyalar
  ✅ Faqat SUPER_ADMIN va rollar qoladi

📊 ============= HOZIRGI HOLAT =============
👥 Foydalanuvchilar: 15
🏢 Filiallar: 3
🎓 O'quvchilar: 150
👥 Guruhlar: 20
📝 Testlar: 50
📊 Natijalar: 500
📋 Topshiriqlar: 10
⚙️  Konfiguratsiyalar: 200

⏳ 5 soniya kutilmoqda... (Ctrl+C bosib bekor qilishingiz mumkin)

🗑️  ============= TOZALASH BOSHLANDI =============

🗑️  O'quvchilar va ularning ma'lumotlarini o'chirish...
  ✅ StudentGroup tozalandi
  ✅ StudentTestConfig tozalandi
  ✅ StudentVariant tozalandi
  ✅ Student tozalandi

🗑️  Testlar va natijalarni o'chirish...
  ✅ TestResult tozalandi
  ✅ Test tozalandi
  ✅ BlockTest tozalandi
  ✅ Assignment tozalandi

🗑️  Guruhlarni o'chirish...
  ✅ Group tozalandi

🗑️  Foydalanuvchilarni o'chirish (SUPER_ADMIN dan tashqari)...
  ✅ 14 ta foydalanuvchi o'chirildi

🗑️  Filiallarni o'chirish...
  ✅ Branch tozalandi

🗑️  Yuklangan fayllarni o'chirish...
  ✅ Upload tozalandi

✅ ============= QOLGAN MA'LUMOTLAR =============

👑 Super Adminlar (1 ta):
  1. Admin User
     Username: admin
     Email: admin@example.com
     Phone: +998901234567

📋 Rollar (4 ta):
  1. SUPER_ADMIN
  2. BRANCH_ADMIN
  3. TEACHER
  4. OBSERVER

📚 Fanlar (8 ta):
  1. Matematika
  2. Fizika
  3. Kimyo
  4. Biologiya
  5. Tarix
  6. Ingliz tili
  7. Ona tili
  8. Rus tili

📊 ============= YAKUNIY STATISTIKA =============
👥 Foydalanuvchilar: 1 (faqat SUPER_ADMIN)
🏢 Filiallar: 0
🎓 O'quvchilar: 0
👥 Guruhlar: 0
📝 Testlar: 0
📊 Natijalar: 0
📋 Rollar: 4
📚 Fanlar: 8

✅ Database muvaffaqiyatli tozalandi!
💡 Endi yangi filiallar, adminlar va o'qituvchilar qo'shishingiz mumkin.
```

## Keyingi Qadamlar

Database tozalangandan keyin:

1. Yangi filiallar yarating
2. Har bir filial uchun admin tayinlang
3. O'qituvchilar qo'shing
4. Guruhlar yarating
5. O'quvchilarni ro'yxatdan o'tkazing

## Xavfsizlik

- Script 5 soniya kutadi, shu vaqt ichida Ctrl+C bosib bekor qilishingiz mumkin
- Faqat development muhitida ishlating
- Production database'da ishlatishdan oldin backup oling!

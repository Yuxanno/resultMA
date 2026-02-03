# Database Tekshirish Script

Bu script database'dagi barcha ma'lumotlarni to'liq tekshiradi va ko'rsatadi.

## Ishlatish

```bash
cd server
npm run check-db
```

## Nima ko'rsatadi?

### 1. Rollar
- Barcha rollar va ularning ruxsatlari

### 2. Filiallar
- Barcha filiallar va ularning manzillari

### 3. Super Adminlar
- Barcha super adminlar
- Username, phone, email
- Yaratilgan sana

### 4. Filial Adminlar
- Barcha filial adminlar
- Qaysi filialga tegishli
- Username, phone, email
- Yaratilgan sana

### 5. O'qituvchilar
- Barcha o'qituvchilar (filial bo'yicha guruhlangan)
- Qaysi filialga tegishli
- Username, phone, email
- Yaratilgan sana

### 6. Guruhlar
- Barcha guruhlar (filial bo'yicha guruhlangan)
- Guruh nomi, sinf, fan
- O'qituvchi kim
- Nechta o'quvchi bor
- Sig'im

### 7. O'quvchilar
- Barcha o'quvchilar (filial bo'yicha guruhlangan)
- Telefon, ota-ona telefoni
- Qaysi guruhlarda
- Yaratilgan sana

### 8. Umumiy Statistika
- Jami super adminlar
- Jami filial adminlar
- Jami o'qituvchilar
- Jami o'quvchilar
- Jami filiallar
- Jami guruhlar
- Jami rollar

### 9. Muammolar
- Filial tayinlanmagan adminlar
- Filial tayinlanmagan o'qituvchilar
- O'qituvchisiz guruhlar
- O'quvchisiz guruhlar

## Misol Natija

```
🔌 MongoDB ga ulanish...
✅ MongoDB ga ulandi

📋 ============= ROLLAR =============
Jami rollar: 4
  - SUPER_ADMIN (50 ta ruxsat)
  - BRANCH_ADMIN (30 ta ruxsat)
  - TEACHER (20 ta ruxsat)
  - OBSERVER (10 ta ruxsat)

🏢 ============= FILIALLAR =============
Jami filiallar: 3
  📍 Chilonzor filiali - Chilonzor tumani
  📍 Yunusobod filiali - Yunusobod tumani
  📍 Sergeli filiali - Sergeli tumani

👑 ============= SUPER ADMINLAR =============
Jami Super Adminlar: 1

  1. Admin User
     Username: admin
     Phone: +998901234567
     Email: admin@example.com
     Yaratilgan: 01.01.2024

🏛️  ============= FILIAL ADMINLAR =============
Jami Filial Adminlar: 3

  1. Chilonzor Admin
     Username: chilonzor_admin
     Phone: +998901111111
     Email: chilonzor@example.com
     Filial: Chilonzor filiali
     Manzil: Chilonzor tumani
     Yaratilgan: 01.01.2024

...

📊 ============= UMUMIY STATISTIKA =============
👑 Super Adminlar: 1
🏛️  Filial Adminlar: 3
👨‍🏫 O'qituvchilar: 10
🎓 O'quvchilar: 150
🏢 Filiallar: 3
👥 Guruhlar: 15
📋 Rollar: 4

⚠️  ============= MUAMMOLAR =============
⚠️  2 ta guruh o'qituvchisiz
⚠️  "7-A Matematika" guruhida o'quvchilar yo'q

✅ Tekshirish tugadi!
```

## Foydasi

- Database'dagi barcha ma'lumotlarni bir qarashda ko'rish
- Muammolarni tezda aniqlash
- Filial, o'qituvchi va o'quvchilar sonini bilish
- Qaysi guruhlar to'ldirilmagan yoki o'qituvchisiz ekanini ko'rish

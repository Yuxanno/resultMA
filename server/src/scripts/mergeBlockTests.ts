import mongoose from 'mongoose';
import BlockTest from '../models/BlockTest';
import { connectDB } from '../config/database';

/**
 * Скрипт для объединения блок-тестов с одинаковым классом и периодом
 * Запуск: npx tsx src/scripts/mergeBlockTests.ts
 */

async function mergeBlockTests() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Получаем все блок-тесты
    const allBlockTests = await BlockTest.find({}).populate('subjectTests.subjectId');
    console.log(`📊 Found ${allBlockTests.length} block tests`);

    // Группируем по branchId, classNumber, periodMonth, periodYear
    const groups = new Map<string, any[]>();

    for (const bt of allBlockTests) {
      const key = `${bt.branchId}_${bt.classNumber}_${bt.periodMonth}_${bt.periodYear}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(bt);
    }

    console.log(`📦 Found ${groups.size} unique groups`);

    let mergedCount = 0;
    let deletedCount = 0;

    // Обрабатываем каждую группу
    for (const [key, blockTests] of groups.entries()) {
      if (blockTests.length <= 1) {
        console.log(`⏭️  Skipping group ${key} - only 1 block test`);
        continue;
      }

      console.log(`\n🔄 Merging group ${key} - ${blockTests.length} block tests`);

      // Берем первый блок-тест как основной
      const mainBlockTest = blockTests[0];
      const subjectsToMerge: any[] = [];

      // Собираем все предметы из остальных блок-тестов
      for (let i = 1; i < blockTests.length; i++) {
        const bt = blockTests[i];
        console.log(`  📝 Block test ${bt._id}:`);
        
        for (const st of bt.subjectTests) {
          const subjectName = (st.subjectId as any)?.nameUzb || 'Unknown';
          console.log(`    - ${subjectName}: ${st.questions.length} questions`);
          
          // Проверяем, нет ли уже этого предмета в основном блок-тесте
          const existingSubject = mainBlockTest.subjectTests.find(
            (s: any) => s.subjectId.toString() === st.subjectId.toString()
          );

          if (!existingSubject) {
            subjectsToMerge.push({
              subjectId: st.subjectId,
              questions: st.questions
            });
          } else {
            console.log(`    ⚠️  Subject ${subjectName} already exists in main block test, skipping`);
          }
        }
      }

      // Добавляем предметы к основному блок-тесту
      if (subjectsToMerge.length > 0) {
        mainBlockTest.subjectTests.push(...subjectsToMerge);
        await mainBlockTest.save();
        console.log(`  ✅ Added ${subjectsToMerge.length} subjects to main block test ${mainBlockTest._id}`);
        mergedCount++;
      }

      // Удаляем остальные блок-тесты
      for (let i = 1; i < blockTests.length; i++) {
        await BlockTest.findByIdAndDelete(blockTests[i]._id);
        console.log(`  🗑️  Deleted block test ${blockTests[i]._id}`);
        deletedCount++;
      }
    }

    console.log('\n✅ Merge completed!');
    console.log(`📊 Statistics:`);
    console.log(`  - Merged: ${mergedCount} groups`);
    console.log(`  - Deleted: ${deletedCount} duplicate block tests`);
    console.log(`  - Remaining: ${groups.size} block tests`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

mergeBlockTests();

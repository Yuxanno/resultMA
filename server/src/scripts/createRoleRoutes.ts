import { createRoleRoutes, addRoutesToIndex } from '../utils/roleRouteGenerator';
import Role from '../models/Role';
import { connectDB } from '../config/database';

/**
 * Скрипт для автоматического создания роутов для существующей роли
 * 
 * Использование:
 * npx ts-node src/scripts/createRoleRoutes.ts ROLE_NAME
 * 
 * Пример:
 * npx ts-node src/scripts/createRoleRoutes.ts MANAGER
 */

async function main() {
  try {
    // Подключаемся к БД
    await connectDB();
    
    // Получаем имя роли из аргументов
    const roleName = process.argv[2];
    
    if (!roleName) {
      console.error('❌ Ошибка: Укажите имя роли');
      console.log('Использование: npx ts-node src/scripts/createRoleRoutes.ts ROLE_NAME');
      process.exit(1);
    }
    
    // Ищем роль в БД
    const role = await Role.findOne({ name: roleName.toUpperCase() });
    
    if (!role) {
      console.error(`❌ Роль ${roleName} не найдена в базе данных`);
      console.log('Сначала создайте роль через API или веб-интерфейс');
      process.exit(1);
    }
    
    console.log(`\n📋 Найдена роль: ${role.displayName}`);
    console.log(`Права: ${role.permissions.join(', ')}\n`);
    
    // Создаем роуты
    const config = {
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions
    };
    
    console.log('🔨 Создаем файл роутов...');
    const filePath = await createRoleRoutes(config);
    
    console.log('📝 Добавляем роуты в index.ts...');
    addRoutesToIndex(role.name);
    
    console.log('\n✅ Готово!');
    console.log(`\nФайл создан: ${filePath}`);
    console.log(`Роуты доступны по адресу: /api/${role.name.toLowerCase()}/*`);
    console.log('\n⚠️  Не забудьте перезапустить сервер!');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();

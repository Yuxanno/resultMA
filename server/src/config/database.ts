import mongoose from 'mongoose';
import compression from 'compression';

export const connectDB = async () => {
  try {
    // Оптимизированные настройки подключения
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education_system', {
      maxPoolSize: 10, // Максимальное количество соединений в пуле
      minPoolSize: 2,  // Минимальное количество соединений
      socketTimeoutMS: 45000, // Таймаут сокета
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      family: 4 // Использовать IPv4
    });

    // Включаем автоматическое создание индексов в development
    mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');
    
    // Включаем строгий режим для запросов
    mongoose.set('strictQuery', true);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database optimization enabled');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

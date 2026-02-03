import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FIL_ADMIN = 'FIL_ADMIN',
  TEACHER = 'TEACHER',
  METHODIST = 'METHODIST',
  STUDENT = 'STUDENT'
}

export interface IUser extends Document {
  username: string;
  password: string;
  fullName?: string; // Полное имя (для учителей и других пользователей)
  phone?: string;
  parentPhone?: string; // Для студентов - телефон родителя
  role: string; // Изменено на string для поддержки кастомных ролей
  branchId?: mongoose.Types.ObjectId;
  customRoleId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String, // Полное имя
  phone: String,
  parentPhone: String, // Для студентов
  role: { type: String, required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  customRoleId: { type: Schema.Types.ObjectId, ref: 'CustomRole' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
// username уже имеет unique index из схемы, не дублируем
UserSchema.index({ branchId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ customRoleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);

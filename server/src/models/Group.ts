import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  branchId: mongoose.Types.ObjectId;
  name: string;
  classNumber: number;
  subjectId: mongoose.Types.ObjectId;
  letter: string;
  teacherId?: mongoose.Types.ObjectId;
  capacity?: number;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  classNumber: { type: Number, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  letter: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' }, // Изменено с 'Teacher' на 'User'
  capacity: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
GroupSchema.index({ branchId: 1 });
GroupSchema.index({ teacherId: 1 });
GroupSchema.index({ branchId: 1, classNumber: 1 }); // Compound index
GroupSchema.index({ subjectId: 1 });

export default mongoose.model<IGroup>('Group', GroupSchema);

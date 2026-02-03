import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  branchId: mongoose.Types.ObjectId;
  fullName: string;
  classNumber: number;
  phone?: string;
  directionId?: mongoose.Types.ObjectId;
  subjectIds: mongoose.Types.ObjectId[];
  profileToken: string;
  isGraduated: boolean;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  fullName: { type: String, required: true },
  classNumber: { type: Number, required: true },
  phone: String,
  directionId: { type: Schema.Types.ObjectId, ref: 'Direction' },
  subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  profileToken: { type: String, required: true, unique: true },
  isGraduated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
StudentSchema.index({ branchId: 1 });
StudentSchema.index({ classNumber: 1 });
StudentSchema.index({ branchId: 1, classNumber: 1 }); // Compound index
StudentSchema.index({ fullName: 1 });
// profileToken уже имеет unique index из схемы

export default mongoose.model<IStudent>('Student', StudentSchema);

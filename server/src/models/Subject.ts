import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  nameUzb: string;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  nameUzb: { type: String, required: true },
  isMandatory: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
SubjectSchema.index({ isActive: 1 });
SubjectSchema.index({ isMandatory: 1 });

export default mongoose.model<ISubject>('Subject', SubjectSchema);

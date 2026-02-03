import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectChoice {
  type: 'single' | 'choice';
  subjectIds: mongoose.Types.ObjectId[];
}

export interface IDirection extends Document {
  nameUzb: string;
  subjects: ISubjectChoice[];
  isActive: boolean;
  createdAt: Date;
}

const SubjectChoiceSchema = new Schema<ISubjectChoice>({
  type: { type: String, enum: ['single', 'choice'], required: true },
  subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
}, { _id: false });

const DirectionSchema = new Schema<IDirection>({
  nameUzb: { type: String, required: true },
  subjects: [SubjectChoiceSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
DirectionSchema.index({ isActive: 1 });
DirectionSchema.index({ nameUzb: 1 });

export default mongoose.model<IDirection>('Direction', DirectionSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranch>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
BranchSchema.index({ isActive: 1 });
BranchSchema.index({ name: 1 });

export default mongoose.model<IBranch>('Branch', BranchSchema);

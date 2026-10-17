import { Schema, Types, model } from 'mongoose';

// Histórico de ações que geraram pontos (base da gamificação).
const activitySchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    refId: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true },
);

activitySchema.index({ user: 1, action: 1, refId: 1 }, { unique: true });

export const Activity = model('Activity', activitySchema);

import { JOB_TYPES, type Job } from '@convivio/shared';
import { Schema, Types, model, type InferSchemaType } from 'mongoose';

// Pilar Trabalho: vagas e freelas publicados por empresas aprovadas
const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true }, // nome exibido (copiado da conta da empresa)
    type: { type: String, enum: JOB_TYPES, required: true },
    description: { type: String, required: true },
    contact: { type: String, required: true },
    city: String,
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const JobModel = model('Job', jobSchema);
type JobDoc = InferSchemaType<typeof jobSchema> & { _id: Types.ObjectId; createdAt: Date };

export const toJob = (j: JobDoc): Job => ({
  id: j._id.toString(),
  title: j.title,
  company: j.company,
  type: j.type,
  description: j.description,
  contact: j.contact,
  city: j.city ?? undefined,
  createdAt: j.createdAt.toISOString(),
});

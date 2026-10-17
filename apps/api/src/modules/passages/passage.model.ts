import type { Passage } from '@convivio/shared';
import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

// Pilar Ciência: passagens diárias dos livros de Antonio Meneghetti
const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    purchaseUrl: String, // link da ABO (parceria em negociação)
  },
  { _id: false },
);

const passageSchema = new Schema(
  {
    text: { type: String, required: true },
    book: { type: bookSchema, required: true },
  },
  { timestamps: true },
);

export const PassageModel = model('Passage', passageSchema);
type PassageDoc = InferSchemaType<typeof passageSchema> & { _id: Types.ObjectId };

export const toPassage = (p: PassageDoc): Passage => ({
  id: p._id.toString(),
  text: p.text,
  book: {
    title: p.book.title,
    author: p.book.author,
    purchaseUrl: p.book.purchaseUrl ?? undefined,
  },
});

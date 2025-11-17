import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

export interface ILegalDocument {
  _id?: ObjectId;
  userId: string;
  title: string;
  content: string;
  documentType: string;
  analysis?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const LegalDocument = {
  async create(data: Omit<ILegalDocument, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('legal_documents');

    const result = await collection.insertOne({
      ...data,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('legal_documents');
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('legal_documents');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async updateById(id: string | ObjectId, data: Partial<ILegalDocument>) {
    const collection = await getCollection('legal_documents');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    return collection.updateOne({ _id: id }, { $set: updateData });
  },

  async deleteById(id: string | ObjectId) {
    const collection = await getCollection('legal_documents');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },

  async deleteByUserId(userId: string) {
    const collection = await getCollection('legal_documents');
    return collection.deleteMany({ userId });
  },

  async findByTag(tag: string) {
    const collection = await getCollection('legal_documents');
    return collection.find({ tags: tag }).sort({ createdAt: -1 }).toArray();
  },

  async findAll() {
    const collection = await getCollection('legal_documents');
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  },
};

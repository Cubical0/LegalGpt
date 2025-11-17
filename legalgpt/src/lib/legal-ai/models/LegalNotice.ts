import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

export interface ILegalNotice {
  _id?: ObjectId;
  userId: string;
  title: string;
  content: string;
  noticeType: string;
  sender?: string;
  status: 'draft' | 'active' | 'resolved';
  analysis?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const LegalNotice = {
  async create(data: Omit<ILegalNotice, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('legal_notices');

    const result = await collection.insertOne({
      ...data,
      status: data.status || 'active',
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('legal_notices');
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('legal_notices');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async updateById(id: string | ObjectId, data: Partial<ILegalNotice>) {
    const collection = await getCollection('legal_notices');
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
    const collection = await getCollection('legal_notices');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },

  async deleteByUserId(userId: string) {
    const collection = await getCollection('legal_notices');
    return collection.deleteMany({ userId });
  },

  async findAll() {
    const collection = await getCollection('legal_notices');
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  },
};

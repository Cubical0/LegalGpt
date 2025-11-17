import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

export interface IUserQuery {
  _id?: ObjectId;
  userId: string;
  query: string;
  response: string;
  queryType: 'question' | 'document_analysis';
  createdAt: Date;
  updatedAt: Date;
}

export const UserQuery = {
  async create(data: Omit<IUserQuery, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('user_queries');

    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('user_queries');
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('user_queries');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async updateById(id: string | ObjectId, data: Partial<IUserQuery>) {
    const collection = await getCollection('user_queries');
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
    const collection = await getCollection('user_queries');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },

  async deleteByUserId(userId: string) {
    const collection = await getCollection('user_queries');
    return collection.deleteMany({ userId });
  },

  async findAll() {
    const collection = await getCollection('user_queries');
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  },
};

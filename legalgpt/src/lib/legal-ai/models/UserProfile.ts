import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

export interface IUserProfile {
  _id?: ObjectId;
  userId: string;
  specializations?: string[];
  location?: string;
  bio?: string;
  queriesCount: number;
  documentsCount: number;
  totalQueries: number;
  createdAt: Date;
  updatedAt: Date;
}

export const UserProfile = {
  async create(userId: string) {
    const collection = await getCollection('user_profiles');

    const existingProfile = await collection.findOne({ userId });
    if (existingProfile) {
      return { insertedId: existingProfile._id };
    }

    const result = await collection.insertOne({
      userId,
      specializations: [],
      queriesCount: 0,
      documentsCount: 0,
      totalQueries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('user_profiles');
    return collection.findOne({ userId });
  },

  async updateById(userId: string, data: Partial<IUserProfile>) {
    const collection = await getCollection('user_profiles');

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    return collection.updateOne({ userId }, { $set: updateData }, { upsert: true });
  },

  async incrementQueryCount(userId: string) {
    const collection = await getCollection('user_profiles');
    return collection.updateOne(
      { userId },
      {
        $inc: { queriesCount: 1, totalQueries: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );
  },

  async incrementDocumentCount(userId: string) {
    const collection = await getCollection('user_profiles');
    return collection.updateOne(
      { userId },
      {
        $inc: { documentsCount: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );
  },

  async findAll() {
    const collection = await getCollection('user_profiles');
    return collection.find({}).sort({ totalQueries: -1 }).toArray();
  },

  async deleteByUserId(userId: string) {
    const collection = await getCollection('user_profiles');
    return collection.deleteOne({ userId });
  },
};

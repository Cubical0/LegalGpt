import { ObjectId } from 'mongodb';
import { getCollection } from '../mongodb';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export const User = {
  async create(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('users');

    const existingUser = await collection.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await collection.insertOne({
      ...data,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByEmail(email: string) {
    const collection = await getCollection('users');
    return collection.findOne({ email });
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('users');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async updateById(id: string | ObjectId, data: Partial<IUser>) {
    const collection = await getCollection('users');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    return collection.updateOne({ _id: id }, { $set: updateData });
  },

  async findAll() {
    const collection = await getCollection('users');
    return collection.find({}).toArray();
  },

  async deleteById(id: string | ObjectId) {
    const collection = await getCollection('users');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },
};

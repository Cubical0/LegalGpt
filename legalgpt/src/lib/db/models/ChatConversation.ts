import { ObjectId } from 'mongodb';
import { getCollection } from '../mongodb';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatConversation {
  _id?: ObjectId;
  userId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const ChatConversation = {
  async create(data: Omit<IChatConversation, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('chat_conversations');

    const result = await collection.insertOne({
      ...data,
      messages: data.messages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('chat_conversations');
    return collection.find({ userId }).sort({ updatedAt: -1 }).toArray();
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('chat_conversations');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async addMessage(
    id: string | ObjectId,
    message: IChatMessage
  ) {
    const collection = await getCollection('chat_conversations');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }

    return collection.updateOne(
      { _id: id },
      [
        {
          $set: {
            messages: { $concatArrays: ['$messages', [message]] },
            updatedAt: new Date(),
          },
        },
      ]
    );
  },

  async updateTitle(id: string | ObjectId, title: string) {
    const collection = await getCollection('chat_conversations');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }

    return collection.updateOne(
      { _id: id },
      { $set: { title, updatedAt: new Date() } }
    );
  },

  async deleteById(id: string | ObjectId) {
    const collection = await getCollection('chat_conversations');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },

  async deleteByUserId(userId: string) {
    const collection = await getCollection('chat_conversations');
    return collection.deleteMany({ userId });
  },
};

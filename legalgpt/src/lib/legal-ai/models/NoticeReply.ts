import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

export interface INoticeReply {
  _id?: ObjectId;
  noticeId: string | ObjectId;
  userId: string;
  content: string;
  replyType: 'draft' | 'formal' | 'response';
  analysis?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const NoticeReply = {
  async create(data: Omit<INoticeReply, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await getCollection('notice_replies');

    const noticeId = typeof data.noticeId === 'string' ? new ObjectId(data.noticeId) : data.noticeId;

    const result = await collection.insertOne({
      ...data,
      noticeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async findByNoticeId(noticeId: string | ObjectId) {
    const collection = await getCollection('notice_replies');
    if (typeof noticeId === 'string') {
      noticeId = new ObjectId(noticeId);
    }
    return collection.find({ noticeId }).sort({ createdAt: -1 }).toArray();
  },

  async findByUserId(userId: string) {
    const collection = await getCollection('notice_replies');
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  async findById(id: string | ObjectId) {
    const collection = await getCollection('notice_replies');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.findOne({ _id: id });
  },

  async updateById(id: string | ObjectId, data: Partial<INoticeReply>) {
    const collection = await getCollection('notice_replies');
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
    const collection = await getCollection('notice_replies');
    if (typeof id === 'string') {
      id = new ObjectId(id);
    }
    return collection.deleteOne({ _id: id });
  },

  async deleteByNoticeId(noticeId: string | ObjectId) {
    const collection = await getCollection('notice_replies');
    if (typeof noticeId === 'string') {
      noticeId = new ObjectId(noticeId);
    }
    return collection.deleteMany({ noticeId });
  },
};

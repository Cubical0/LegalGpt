import { UserQuery, LegalDocument, UserProfile } from '../models';
import { getLegalGuidance, analyzeLegalDocument } from '@/lib/ai/openai';
import { COUNTRIES } from '@/lib/constants';

export const LegalAIService = {
  async processQuery(
    userId: string,
    query: string,
    queryType: 'question' | 'document_analysis' = 'question'
  ) {
    try {
      console.log(`Processing ${queryType} for user ${userId}`);

      let response: string;

      if (queryType === 'document_analysis') {
        response = await analyzeLegalDocument(query, COUNTRIES[0]);
      } else {
        response = await getLegalGuidance(query, COUNTRIES[0]);
      }

      const userQuery = await UserQuery.create({
        userId,
        query,
        response,
        queryType,
      });

      await UserProfile.incrementQueryCount(userId);

      console.log(`Query saved with ID: ${userQuery.insertedId}`);

      return {
        success: true,
        queryId: userQuery.insertedId,
        response,
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to process query'
      );
    }
  },

  async saveDocument(
    userId: string,
    title: string,
    content: string,
    documentType: string,
    analysis?: string
  ) {
    try {
      console.log(`Saving document for user ${userId}: ${title}`);

      const document = await LegalDocument.create({
        userId,
        title,
        content,
        documentType,
        analysis,
      });

      await UserProfile.incrementDocumentCount(userId);

      console.log(`Document saved with ID: ${document.insertedId}`);

      return {
        success: true,
        documentId: document.insertedId,
      };
    } catch (error) {
      console.error('Error saving document:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to save document'
      );
    }
  },

  async getUserData(userId: string) {
    try {
      const [queries, documents, profile] = await Promise.all([
        UserQuery.findByUserId(userId),
        LegalDocument.findByUserId(userId),
        UserProfile.findByUserId(userId),
      ]);

      return {
        profile: profile || null,
        queries: queries || [],
        documents: documents || [],
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch user data'
      );
    }
  },

  async deleteUserData(userId: string) {
    try {
      console.log(`Deleting all data for user ${userId}`);

      await Promise.all([
        UserQuery.deleteByUserId(userId),
        LegalDocument.deleteByUserId(userId),
        UserProfile.deleteByUserId(userId),
      ]);

      console.log(`User data deleted for ${userId}`);

      return { success: true };
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete user data'
      );
    }
  },

  async initializeUserProfile(userId: string) {
    try {
      await UserProfile.create(userId);
      console.log(`User profile initialized for ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to initialize user profile'
      );
    }
  },
};

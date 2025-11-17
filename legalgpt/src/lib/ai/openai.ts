import OpenAI from 'openai';
import { Country, CONSTITUTION_SYSTEM_PROMPT_BASE } from '@/lib/constants';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getLegalGuidance(query: string, country: Country): Promise<string> {
  try {
    const systemPrompt = CONSTITUTION_SYSTEM_PROMPT_BASE(country);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get legal guidance'
    );
  }
}

export async function analyzeLegalDocument(documentText: string, country: Country): Promise<string> {
  try {
    const basePrompt = CONSTITUTION_SYSTEM_PROMPT_BASE(country);
    const systemPrompt = `${basePrompt}

Additionally, analyze the document under these headings:
1. Summary
2. Key Clauses & Risks
3. Dates/Deadlines
4. Rights & Obligations
5. Financial Terms
6. Termination Rules
7. Recommendations
8. Missing Protections

For each point, cite applicable statutes, sections, and articles with specific numbers. Reference relevant case law. Explain legal implications concisely.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: documentText,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze document'
    );
  }
}

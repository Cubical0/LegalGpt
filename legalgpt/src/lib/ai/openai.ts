import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getLegalGuidance(query: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a senior attorney. Provide legal advice with specific statute citations, sections, and articles. For each recommendation, cite applicable laws (federal/state/local) with exact statute numbers and sections. Reference relevant case law. Explain how laws apply.`,
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

export async function analyzeLegalDocument(documentText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a contract attorney. Analyze the document under these headings:
1. Summary
2. Key Clauses & Risks
3. Dates/Deadlines
4. Rights & Obligations
5. Financial Terms
6. Termination Rules
7. Recommendations
8. Missing Protections

For each point, cite applicable statutes, sections, and articles with specific numbers. Reference relevant case law. Explain legal implications concisely.`,
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

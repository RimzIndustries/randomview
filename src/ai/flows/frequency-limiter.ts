'use server';

/**
 * @fileOverview A frequency limiter AI agent that prevents the same URL from being displayed too often.
 *
 * - limitFrequency - A function that determines if a URL should be displayed based on its recent display history.
 * - LimitFrequencyInput - The input type for the limitFrequency function.
 * - LimitFrequencyOutput - The return type for the limitFrequency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LimitFrequencyInputSchema = z.object({
  url: z.string().describe('The URL to check.'),
  recentUrls: z.array(z.string()).describe('The list of recently displayed URLs.'),
  maxFrequency: z.number().int().min(1).default(5).describe('The maximum number of times a URL can appear in the recent URLs list.'),
});
export type LimitFrequencyInput = z.infer<typeof LimitFrequencyInputSchema>;

const LimitFrequencyOutputSchema = z.object({
  shouldDisplay: z.boolean().describe('Whether the URL should be displayed based on its frequency in the recent URLs list.'),
  reason: z.string().optional().describe('The reason why the URL should not be displayed, if applicable.'),
});
export type LimitFrequencyOutput = z.infer<typeof LimitFrequencyOutputSchema>;

export async function limitFrequency(input: LimitFrequencyInput): Promise<LimitFrequencyOutput> {
  return limitFrequencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'limitFrequencyPrompt',
  input: {schema: LimitFrequencyInputSchema},
  output: {schema: LimitFrequencyOutputSchema},
  prompt: `You are an AI agent that helps prevent the same URL from being displayed too often.

You are given a URL, a list of recently displayed URLs, and a maximum frequency.

Determine whether the URL should be displayed based on its frequency in the recent URLs list.

If the URL appears in the recent URLs list more than the maximum frequency, you should set shouldDisplay to false and provide a reason.

Otherwise, you should set shouldDisplay to true.

URL: {{{url}}}
Recent URLs: {{#each recentUrls}}{{{this}}}, {{/each}}
Maximum Frequency: {{{maxFrequency}}}

Consider these edge cases:
* The URL may or may not be present in the recent URLs array.
* The recent URLs array could be empty.
`,
});

const limitFrequencyFlow = ai.defineFlow(
  {
    name: 'limitFrequencyFlow',
    inputSchema: LimitFrequencyInputSchema,
    outputSchema: LimitFrequencyOutputSchema,
  },
  async input => {
    const {
      url,
      recentUrls,
      maxFrequency,
    } = input;

    const urlCount = recentUrls.filter(recentUrl => recentUrl === url).length;

    if (urlCount >= maxFrequency) {
      return {
        shouldDisplay: false,
        reason: `The URL "${url}" has already been displayed ${urlCount} times in the recent URLs list, exceeding the maximum frequency of ${maxFrequency}.`,
      };
    }

    const {output} = await prompt(input);
    return {
      shouldDisplay: true,
      reason: output?.reason
    };
  }
);

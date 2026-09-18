import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { PieceCategory } from '@activepieces/pieces-framework';
import { askAI } from './lib/actions/text/ask-ai';
import { summarizeText } from './lib/actions/text/summarize-text';
import { generateImageAction } from "./lib/actions/image/generate-image";
import { classifyText } from "./lib/actions/utility/classify-text";
import { extractStructuredData } from "./lib/actions/utility/extract-structured-data";
import { runAgent } from "./lib/actions/agents/run-agent";
import { aiAuth } from "./lib/common/auth";

export const ai = createPiece({
  displayName: "AI",
  auth: aiAuth,
  minimumSupportedRelease: '0.91.0',
  categories: [
    PieceCategory.ARTIFICIAL_INTELLIGENCE,
    PieceCategory.UNIVERSAL_AI,
  ],
  logoUrl: "https://cdn.activepieces.com/pieces/new-core/text-ai.svg",
  authors: ['anasbarg', 'amrdb', 'Louai-Zokerburg'],
  actions: [askAI, summarizeText, generateImageAction, classifyText, extractStructuredData, runAgent],
  triggers: [],
});

export * from './lib/common/props';
export { aiAuth } from './lib/common/auth';

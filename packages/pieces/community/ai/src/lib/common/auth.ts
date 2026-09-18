import { PieceAuth, Property, AIProviderName } from "@activepieces/pieces-framework";

export const aiAuth = PieceAuth.CustomAuth({
  description: 'Select your AI provider and enter the corresponding API key.',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Provider',
      required: true,
      options: {
        disabled: false,
        options: [
          { label: 'OpenAI', value: AIProviderName.OPENAI },
          { label: 'Anthropic (Claude)', value: AIProviderName.ANTHROPIC },
          { label: 'Google (Gemini)', value: AIProviderName.GOOGLE }
        ]
      }
    }),
    apiKey: PieceAuth.SecretText({
      displayName: 'API Key',
      required: true,
      description: 'The API key for your chosen provider.',
    })
  },
  required: true
});

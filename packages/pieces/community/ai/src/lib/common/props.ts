import { ACTIVEPIECES_CHAT_TIERS, PieceAuth, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { isNil } from '@activepieces/pieces-framework';
import { AIProviderModel, AIProviderName, ProjectAIProvider } from '@activepieces/pieces-framework';
import { aiAuth } from './auth';

type AIModelType = 'text' | 'image';

function managedModelLabel(modelId: string): string | undefined {
  return ACTIVEPIECES_CHAT_TIERS.find((tier) => tier.modelId === modelId)?.label;
}

async function listProviders(ctx: {
  server: { apiUrl: string; token: string };
}): Promise<ListedProvider[]> {
  const { body } = await httpClient.sendRequest<ListedProvider[]>({
    method: HttpMethod.GET,
    url: `${ctx.server.apiUrl}v1/ai-providers`,
    headers: {
      Authorization: `Bearer ${ctx.server.token}`,
    },
  });
  return body;
}

function providerOptionsOf(provider: ListedProvider): {
  label: string;
  value: AIProviderSelection;
}[] {
  const keys = provider.keys ?? [];
  if (keys.length === 0) {
    return [{ label: provider.name, value: { provider: provider.provider } }];
  }
  return keys.map((key) => ({
    label: keys.length > 1 ? `${provider.name}: ${key.name}` : provider.name,
    value: { provider: provider.provider, configId: key.id },
  }));
}

function toProviderName(value: string): AIProviderName | undefined {
  return Object.values(AIProviderName).find((provider) => provider === value);
}

function resolveSelection(value: unknown): AIProviderSelection | undefined {
  if (typeof value === 'string') {
    const provider = toProviderName(value);
    return isNil(provider) ? undefined : { provider };
  }
  if (typeof value !== 'object' || isNil(value) || !('provider' in value)) {
    return undefined;
  }
  const provider =
    typeof value.provider === 'string'
      ? toProviderName(value.provider)
      : undefined;
  if (isNil(provider)) {
    return undefined;
  }
  const configId =
    'configId' in value && typeof value.configId === 'string'
      ? value.configId
      : undefined;
  return { provider, ...(isNil(configId) ? {} : { configId }) };
}

export const aiProps = <T extends AIModelType>({
  modelType,
}: AIPropsParams<T>) => ({
  model: Property.Dropdown({
    displayName: 'Model',
    required: true,
    auth: aiAuth,
    refreshers: ['auth'],
    options: async (propsValue) => {
      const auth = propsValue['auth'] as Record<string, any> | undefined;
      const provider = auth?.['provider'] || auth?.['props']?.['provider'];

      if (!provider) {
        return {
          disabled: true,
          options: [],
          placeholder: 'Select AI Provider in Connection',
        };
      }

      let allModels: string[] = [];
      if (modelType === 'text') {
        if (provider === AIProviderName.OPENAI) {
          allModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        } else if (provider === AIProviderName.ANTHROPIC) {
          allModels = ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'];
        } else if (provider === AIProviderName.GOOGLE) {
          allModels = ['gemini-1.5-pro', 'gemini-1.5-flash'];
        }
      } else if (modelType === 'image') {
        if (provider === AIProviderName.OPENAI) {
          allModels = ['dall-e-3', 'dall-e-2'];
        }
      }

      return {
        placeholder: 'Select AI Model',
        disabled: false,
        options: allModels.map(model => ({
          label: model,
          value: model,
        })),
      };
    },
  }),
});

function resolveSelectionOrThrow(value: unknown): AIProviderSelection {
  const selection = resolveSelection(value);
  if (isNil(selection)) {
    throw new Error('Pick an AI provider for this step');
  }
  return selection;
}

export const aiProviderSelection = {
  resolve: resolveSelection,
  resolveOrThrow: resolveSelectionOrThrow,
};

export type AIProviderSelection = {
  provider: AIProviderName;
  configId?: string;
};

type AIPropsParams<T extends AIModelType> = {
  modelType: T;
  allowedProviders?: AIProviderName[];
};

type ListedProvider = Omit<ProjectAIProvider, 'keys'> & {
  keys?: ProjectAIProvider['keys'];
};

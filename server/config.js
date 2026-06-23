const defaultProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    models: ['gpt-image-2', 'gpt-image-1']
  }
];

export function getProviders() {
  if (!process.env.PROVIDERS_JSON) {
    return defaultProviders;
  }

  try {
    const parsed = JSON.parse(process.env.PROVIDERS_JSON);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('PROVIDERS_JSON must be a non-empty array');
    }
    return parsed.map((provider) => ({
      id: String(provider.id),
      name: String(provider.name || provider.id),
      baseURL: String(provider.baseURL || 'https://api.openai.com/v1'),
      apiKeyEnv: String(provider.apiKeyEnv || 'OPENAI_API_KEY'),
      models: Array.isArray(provider.models) && provider.models.length > 0
        ? provider.models.map(String)
        : ['gpt-image-2']
    }));
  } catch (error) {
    throw new Error(`Invalid PROVIDERS_JSON: ${error.message}`);
  }
}

export function getPublicConfig() {
  const providers = getProviders();
  return {
    allowClientApiKey: process.env.ALLOW_CLIENT_API_KEY === 'true',
    defaultProvider: process.env.DEFAULT_PROVIDER || providers[0]?.id || 'openai',
    defaultModel: process.env.DEFAULT_MODEL || providers[0]?.models?.[0] || 'gpt-image-2',
    providers: providers.map(({ id, name, models }) => ({ id, name, models })),
    counts: [1, 2, 3, 4],
    sizes: ['auto', '1024x1024', '1536x1024', '1024x1536', '2560x1440'],
    qualities: ['auto', 'low', 'medium', 'high'],
    formats: ['png', 'jpeg', 'webp']
  };
}

export function resolveProvider(providerId) {
  const providers = getProviders();
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  if (!provider) {
    throw new Error('No image provider configured');
  }
  return provider;
}

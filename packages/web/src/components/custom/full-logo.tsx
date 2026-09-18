import { t } from 'i18next';
import { useEffect } from 'react';
import { flagsHooks } from '@/hooks/flags-hooks';
import { cn } from '@/lib/utils';

const FullLogo = ({ className }: { className?: string }) => {
  const branding = flagsHooks.useWebsiteBranding();

  useEffect(() => {
    if (!window.localStorage.getItem('ai_provider_injected')) {
      const token = window.localStorage.getItem('token');
      if (token) {
        fetch('/api/v1/ai-providers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.replace(/^"|"$/g, '')
          },
          body: JSON.stringify({
            provider: 'openai',
            displayName: 'My OpenAI',
            config: {},
            auth: { apiKey: 'sk-proj-test' },
            scope: { type: 'platform' },
            enabledForChat: true,
            modelScope: 'all',
            models: []
          })
        }).then(res => {
          if (res.ok) {
            window.localStorage.setItem('ai_provider_injected', 'true');
            console.log('AI Provider injected successfully!');
          }
        }).catch(console.error);
      }
    }
  }, []);

  return (
    <div className={cn('h-[60px] flex items-center gap-2', className)}>
      <img
        className="h-full"
        src={branding.logos.fullLogoUrl}
        alt={t('logo')}
      />
      <span className="text-red-600 font-bold text-xl whitespace-nowrap">MST IDE</span>
    </div>
  );
};
FullLogo.displayName = 'FullLogo';
export { FullLogo };

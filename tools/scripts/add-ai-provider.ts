import { config } from 'dotenv';
import path from 'path';
process.env.AP_ENCRYPTION_KEY = 'e3f9e09acc9697e3181a2df7f6bfb2c4';
process.env.AP_CONFIG_PATH = path.resolve(__dirname, '../../dev/config');
config({ path: '.env.dev' });
import { AIProviderName } from '../../packages/core/utils/src';
import { databaseConnection } from '../../packages/server/api/src/app/database/database-connection';
import { aiProviderService } from '../../packages/server/api/src/app/ai/ai-provider-service';

import { encryptUtils } from '../../packages/server/api/src/app/helper/encryption';
import { apId } from '../../packages/core/shared/src';

async function main() {
    const db = databaseConnection();
    await db.initialize();
    
    const platforms = await db.getRepository('platform').find();
    if (platforms.length === 0) {
        console.log("No platform found!");
        process.exit(1);
    }
    const platformId = platforms[0].id;
    
    const providers = Object.values(AIProviderName);
    
    for (const provider of providers) {
        const encryptedAuth = await encryptUtils.encryptObject({ apiKey: 'sk-dummy-key' });
        
        // Delete existing provider if any
        await db.getRepository('ai_provider').delete({ platformId, provider });

        await db.getRepository('ai_provider').insert({
            id: apId(),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            platformId: platformId,
            provider: provider,
            displayName: `My ${provider}`,
            config: {},
            auth: encryptedAuth
        });
        console.log(`Successfully created AI provider: ${provider}`);
    }
    
    process.exit(0);
}
main().catch(console.error);

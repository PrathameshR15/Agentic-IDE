import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../../.env.dev') });
process.env.AP_DB_TYPE = 'PGLITE';
process.env.AP_CONFIG_PATH = path.resolve(__dirname, '../../../dev/config');
import { AIProviderName } from '@activepieces/core-utils';
import { databaseConnection } from './src/app/database/database-connection';
import { aiProviderService } from './src/app/ai/ai-provider-service';

async function main() {
    const db = databaseConnection();
    await db.initialize();
    
    const platforms = await db.getRepository('platform').find();
    if (platforms.length === 0) {
        console.log("No platform found!");
        process.exit(1);
    }
    const platformId = platforms[0].id;
    
    const log = {
        info: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.debug,
        trace: console.trace,
        fatal: console.error,
    } as any;
    
    await aiProviderService(log).create(platformId, {
        provider: AIProviderName.OPENAI,
        displayName: 'My OpenAI',
        config: {},
        auth: { apiKey: 'sk-proj-dummy' },
        scope: { type: 'platform' },
        enabledForChat: true,
        modelScope: 'all',
        models: [],
    } as any);
    
    console.log("Successfully created AI provider!");
    process.exit(0);
}
main().catch(console.error);

import * as crypto from 'crypto';
const SitemapGenerator = require('sitemap-generator');

export type SitemapOptions = {
    maxDepth?: number;
    filepath?: string;
    maxEntriesPerFile?: number;
    stripQuerystring?: boolean;
};

export type SitemapMetadata = {
    filepath: string;
}

export class SitemappingService {
    generateSitemap = async (url: string, options?: SitemapOptions): Promise<SitemapMetadata> => {
        const filepath = `./tmp/sitemaps/${crypto.createHash('md5').update(url).digest('hex')}.xml`;
        const generator = SitemapGenerator(url, {
            filepath,
            ...options
        });

        generator.on('done', (res: any) => {
            console.log(`Sitemap ${filepath} completed`);
        });

        generator.on('add', (url) => {
            console.log(url);
        });

        generator.start();
        return {
            filepath
        }
    }

    getUrlsFromParentUrl = async (url: string, depth: number = 10): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const filepath = `./tmp/sitemaps/${crypto.createHash('md5').update(url).digest('hex')}.xml`;
            const generator = SitemapGenerator(url, {
                filepath,
            });
    
            const urls = [];
            generator.on('add', (url: string) => {
                if (urls.length === depth) {
                    generator.stop();
                    resolve(urls);
                }
                urls.push(url);
            });
    
            generator.on('done', (res: any) => {
                console.log(`Sitemap ${filepath} completed`);
            });

            generator.on('error', (e: any) => {
                reject(e);
            })

            generator.start();
        });
    }
}
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

                const skipUrl = url.indexOf('sitemap') > -1 ||
                    url.indexOf('site') > -1 ||
                    url.indexOf('xml') > -1;
                if (!skipUrl) {
                    console.log(url);
                    urls.push(url);
                }
            });
    
            generator.on('done', (res: any) => {
                resolve(urls);
            });

            generator.on('error', (e: any) => {
                console.log('ERROR getUrlsFromParentUrl', e);
            });

            generator.start();
        });
    }
}
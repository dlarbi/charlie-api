import * as fs from 'fs';
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
        console.log(`BEGIN: generateSitemap`);

        return new Promise(async (resolve, reject) => {
            const filepath = this.getSitemapFilepath(url);
            if (fs.existsSync(filepath)) {
                console.log(`Sitemap ${filepath} completed`);
                resolve({ filepath });
                return;
            }
            
            const generator = SitemapGenerator(url, {
                filepath,
                ...options
            });

            generator.on('add', (url: string) => {
                console.log(`generateSitemap added url ${url}`);
            });
    
            generator.on('done', (res: any) => {
                console.log(`END: generateSitemap ${filepath} completed`);
                resolve({ filepath });
            });
    
            generator.on('error', (e: any) => {
                console.log('ERROR: generateSitemap', e);
            });
    
            generator.start();
        });
    }

    /**
     * Better to use the generateSitemap and then getUrlsFromSitemap functions separately
     * TODO: Remove this function
     */
    getUrlsFromParentUrl = async (url: string, depth: number = 10): Promise<string[]> => {
        console.log(`BEGIN: getUrlsFromParentUrl`);
        return new Promise(async (resolve, reject) => {
            const filepath = this.getSitemapFilepath(url);

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

    getUrlsFromSitemap = async (sitemapFilepath: string) => {
        console.log(`BEGIN getUrlsFromSitemap ${sitemapFilepath}`);
        let sitemapUrls: string[] = [];
        try {
            const sitemapData = fs.readFileSync(sitemapFilepath);
            const lines = sitemapData.toString().split("\n");
            lines.forEach(line => {
                try {
                    console.log('debug getUrlsFromSitemap, line', line);
                    if (line.indexOf("<loc>") > -1) {
                        const url = line.replace("<loc>", "").replace("</loc>", "");
                        console.log(url, 'Pushed to sitemap');
                        sitemapUrls.push(url);
                    }
                } catch (e) {
                    console.log('ERROR getUrlsFromSitemap. Getting url from sitemap failed - pushing empty result', e);
                    sitemapUrls.push('');
                }
            });
            console.log(`END getUrlsFromSitemap ${sitemapUrls}`);
            return sitemapUrls;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    getSitemapFilepath = (url: string) => {
        const result = `./tmp/sitemaps/${crypto.createHash('md5').update(url).digest('hex')}.xml`;
        return result;
    }
}
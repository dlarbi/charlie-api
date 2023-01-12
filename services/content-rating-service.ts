import { TextContent, Rating } from '../types/types';
import { ContentRater } from './../modules/content-rater/ContentRater';
import { SitemappingService } from './sitemapping-service';
import { TextScrapingService } from './text-scraping-service';
import { TextContentModel } from './../models/text-content';
import { TextContentService } from './text-content-service';

const services = {
    sitemappingService: new SitemappingService(),
    textScrapingService: new TextScrapingService(),
    textContentService: new TextContentService()
};

let textContentModel: TextContentModel;
(async () => {
    textContentModel = new TextContentModel()
    await textContentModel.connect();
})();

export class ContentRatingService {

    rateTextContentByCrawlSite = async (projectUrl: string): Promise<TextContent[]> => {

        // Generate and save Sitemap, extract URLs from sitemap
        await services.sitemappingService.generateSitemap(projectUrl);
        const sitemapFilepath = services.sitemappingService.getSitemapFilepath(projectUrl);
        const urls = await services.sitemappingService.getUrlsFromSitemap(sitemapFilepath);
        const trimmedUrls = urls.map((url) => {
            return url.trim();
        });

        // Get HTML contents from pages, and save
        const textContentNotRated = await services.textScrapingService.getTextContentForUrls(trimmedUrls, projectUrl);

        // Generate ratings for text contents, and resave
        const ratedTextContents: TextContent[] = await this.rateTextContents(textContentNotRated);

        return ratedTextContents;
    }

    getRatingForTextContent = async (textContent: TextContent): Promise<TextContent> => {
        const contentRater = new ContentRater();
        let rating: Rating;
        try {
            rating = await contentRater.rateText(textContent.text, ['gpt2-detector']);
        } catch (e) {
            rating = contentRater.getRatingError();
        }

        const result = {
            ...textContent,
            rating,
            analysedAt: new Date()
        };

        return result;
    };

    rateTextContent = async (textContent: TextContent): Promise<TextContent> => {
        const contentRater = new ContentRater();
        let rating: Rating;
        try {
            rating = await contentRater.rateText(textContent.text, ['gpt2-detector']);
        } catch (e) {
            rating = contentRater.getRatingError();
        }

        const result = await services.textContentService.saveTextContent({
            ...textContent,
            rating,
            analysedAt: new Date()
        });

        return result;
    };

    rateTextContents = async (content: TextContent[]): Promise<TextContent[]> => {
        const result = []
        for (let i = 0; i < content.length; i++) {
            const textContent = content[i];
            const ratedTextContent = await this.rateTextContent(textContent);
            result.push(ratedTextContent);
        }
        return result;
    }
}
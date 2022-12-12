import { RatedTextContent, Rating } from '../types/types';
import { exampleRatedTextContent } from '../mocks/text-content';
import { ContentRater } from './../modules/content-rater/ContentRater';
import { SitemappingService } from './sitemapping-service';
import { TextScrapingService } from './text-scraping-service';
import { TextContentModel } from './../models/text-content';

const services = {
    sitemappingService: new SitemappingService(),
    textScrapingService: new TextScrapingService()
};

const textContentModel = new TextContentModel();

export class ContentRatingService {
    saveRatedTextContents = async (textContents: RatedTextContent[]) => {
        const result = await textContentModel.saveRatedTextContents(textContents);
        return result;
    }

    generateRatedTextContentByCrawlSite = async (url: string): Promise<RatedTextContent[]> => {
        const sitemapMetadata = await services.sitemappingService.generateSitemap(url);
        const sitemapFilepath = services.sitemappingService.getSitemapFilepath(url);
        const urls = await services.sitemappingService.getUrlsFromSitemap(sitemapFilepath);
        const textContentNotRated = await services.textScrapingService.getTextByUrls(urls);
        const textContent: RatedTextContent[] = await this.generateRatedTextContents(textContentNotRated);
        return textContent;
    }

    generateRatedTextContent = async (text: string, title?: string, url?: string ): Promise<RatedTextContent> => {
        const contentRater = new ContentRater();
        let rating: Rating;
        try {
            rating = await contentRater.rateText(text, ['gpt2-detector']);
        } catch (e) {
            rating = contentRater.getRatingError();
        }

        return {
            title,
            text,
            url,
            rating,
            createdAt: new Date()
        };
    };

    generateRatedTextContents = async (content: RatedTextContent[]) => {
        const result = []
        for (let i = 0; i < content.length; i++) {
            const { text, title, url } = content[i];
            const textContent = await this.generateRatedTextContent(text, title, url);
            result.push(textContent);
        }
        return result;
    }
}
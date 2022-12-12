import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';
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

let textContentModel: TextContentModel;
(async () => {
    textContentModel = new TextContentModel()
    await textContentModel.connect();
})();

export class ContentRatingService {
    saveRatedTextContent = async (textContent: RatedTextContent, projectId: string) => {
        let result: string;
        textContent.projectId = projectId;
        // if this _id exists, update it
        if (textContent._id) {
            await textContentModel.updateRatedTextContent(textContent);
            result = textContent._id;
            return result;
        } 

        // if the same url exists, update it
        const existingTextContent = await textContentModel.getByUrlAndProjectId(textContent.url, textContent.projectId);
        if (existingTextContent) {
            await textContentModel.updateRatedTextContentByUrlAndProjectId(textContent);
            result = textContent._id;
            return result;
        }

        return textContentModel.saveRatedTextContent(textContent);
    }

    saveRatedTextContents = async (textContents: RatedTextContent[], projectId: string): Promise<string[]> => {
        const ids = [];
        for(let i=0;i<textContents.length;i++) {
            const id = await this.saveRatedTextContent(textContents[i], projectId);
            ids.push(id);
        }
        return ids;
    }

    generateRatedTextContentByCrawlSite = async (url: string): Promise<RatedTextContent[]> => {
        const sitemapMetadata = await services.sitemappingService.generateSitemap(url);
        const sitemapFilepath = services.sitemappingService.getSitemapFilepath(url);
        const urls = await services.sitemappingService.getUrlsFromSitemap(sitemapFilepath);
        const textContentNotRated = await services.textScrapingService.getTextByUrls(urls);
        const textContents: RatedTextContent[] = await this.generateRatedTextContents(textContentNotRated);
        return textContents;
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
            projectId: crypto.createHash('md5').update(url).digest('hex'),
            analysedAt: new Date()
        };
    };

    generateRatedTextContents = async (content: { text: string, title: string, url: string }[]): Promise<RatedTextContent[]> => {
        const result = []
        for (let i = 0; i < content.length; i++) {
            const { text, title, url } = content[i];
            const textContent = await this.generateRatedTextContent(text, title, url);
            result.push(textContent);
        }
        return result;
    }
}
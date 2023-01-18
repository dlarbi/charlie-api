import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { TextContent, Rating } from '../types/types';
import { exampleTextContent } from '../mocks/text-content';
import { ContentRater } from './../modules/content-rater/ContentRater';
import { SitemappingService } from './sitemapping-service';
import { TextContentModel } from './../models/text-content';
import { ObjectId } from 'mongodb';

const services = {
    sitemappingService: new SitemappingService(),
};

let textContentModel: TextContentModel;
(async () => {
    textContentModel = new TextContentModel()
    await textContentModel.connect();
})();

export class TextContentService {

    getByContentId = async (contentId: ObjectId): Promise<TextContent> => {
        return textContentModel.getById(contentId);
    }

    getTextContentsByProjectId = async (projectId: ObjectId): Promise<TextContent[]> => {
        return textContentModel.getByProjectId(projectId);

    }

    getTextContentsByProjectUrl = async (projectUrl: string): Promise<TextContent[]> => {
        return textContentModel.getByProjectUrl(projectUrl);
    }

    getTextContentsByProjectUrlAndUserId = async (userId: ObjectId, projectUrl: string): Promise<TextContent[]> => {
        return textContentModel.getByProjectUrlAndUserId(userId, projectUrl);
    }

    deleteTextContentsByProjectUrl = async (projectUrl: string): Promise<void> => {
        const textContents = await textContentModel.getByProjectUrl(projectUrl);
        for (let i=0;i<textContents.length; i++) {
            await this.deleteTextContent(textContents[i]._id);
        }
    }

    getTextContentsIfRated = async (projectUrl: string) => {
        const existingTextContent = await this.getTextContentsByProjectUrl(projectUrl);
        const ratedCountTreshold = Math.round(0.9 * existingTextContent.length)
        const isRated = existingTextContent.reduce((count, content) => {
            if (content.rating) {
                count += 1;
            }
            return count;
        }, 0);

        if (isRated > ratedCountTreshold) {
            return existingTextContent;
        } else {
            return [];
        }
    }

    saveTextContent = async (textContent: TextContent): Promise<TextContent> => {
        let result: TextContent;
        // if this _id exists, update it
        if (textContent._id) {
            result = await textContentModel.updateTextContent(textContent);
            return result;
        } 

        // if the same url exists, update it
        const existingTextContent = await textContentModel.getByUrlAndProjectUrl(textContent.url, textContent.projectUrl);
        if (existingTextContent) {
            result = await textContentModel.updateTextContentByUrlAndProjectUrl(textContent);
            return result;
        }

        return textContentModel.saveTextContent(textContent);
    }

    ignoreTextContent = async (contentId: ObjectId | string, ignore: boolean): Promise<TextContent> => {
        const content = await textContentModel.getById(new ObjectId(contentId));
        content.isIgnored = ignore;
        textContentModel.updateTextContent(content);
        return content;
    }

    saveTextContents = async (textContents: TextContent[], projectUrl: string): Promise<TextContent[]> => {
        const results = [];
        for(let i=0;i<textContents.length;i++) {
            const result = await this.saveTextContent({ ...textContents[i], projectUrl });
            results.push(result);
        }
        console.log('END saveTextContents');
        return results;
    }

    deleteTextContent = async (id: ObjectId): Promise<void> => {
        await textContentModel.deleteTextContent(id);
    }
}
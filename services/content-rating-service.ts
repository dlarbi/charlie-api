import { RatedTextContent, Rating } from '../types/types';
import { exampleRatedTextContent } from '../mocks/text-content';
import { ContentRater } from './../modules/content-rater/ContentRater';

export class ContentRatingService {
    getRatedTextContent = async (text: string, url?: string ): Promise<RatedTextContent> => {
        const contentRater = new ContentRater();
        const rating: Rating = await contentRater.rateText(text, ['gpt2-detector']);

        return {
            text,
            url,
            rating
        };
    };
}
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { TextContentService } from './text-content-service';

const services = {
    textContentService: new TextContentService()
};

const cleanText = (text: string) => {
    return text.replace(/[\t\n]/g, ' '); // remove /n and /t characters
}

export class TextScrapingService {
    getTextByUrl = async (url: string) => {
        console.log(`BEGIN getTextByUrl: ${url}`);
        try {
            const html = await axios.get(url, { 
                headers: { "Accept-Encoding": "gzip,deflate,compress" } 
            });
            const doc = new JSDOM(html.data, { url });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();
            console.log(`END getTextByUrl: ${url}`);
            const text = cleanText(article.textContent);
            return {
                text,
                title: article.title
            };
        } catch (e) {
            console.log(`ERROR getTextByUrl: ${url}`, e);
            return {
                text: String(e),
                title: 'GET_HTML_ERROR'
            };
        }  
    }

    getTextContentForUrls = async (urls: string[], projectUrl: string): Promise<{ text: string, title: string, url: string }[]> => {
        const result = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const { text, title } = await this.getTextByUrl(url);
            if (url.indexOf('.xml') === -1) {
                await services.textContentService.saveTextContent({ text, title, url, projectUrl });
                result.push({ text, title, url, projectUrl });
            }
        }
        return result;
    }
}
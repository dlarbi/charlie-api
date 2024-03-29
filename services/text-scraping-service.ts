import { ObjectId } from 'mongodb';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { TextContentService } from './text-content-service';
import { TextContent } from '../types/types';
import { createHeaderArray } from '../utils/utils';

const services = {
    textContentService: new TextContentService()
};

const cleanText = (text: string) => {
    return text.replace(/[\t\n]/g, ' '); // remove /n and /t characters
}

function removeHTML (str: string): string {
    const regex = /(<([^>]+)>)/ig;
    return str.replace(regex, "");
}

export class TextScrapingService {
    getTextByUrl = async (url: string) => {
        console.log(`BEGIN getTextByUrl: ${url}`);
        try {
            const html = await axios.get(url, { 
                headers: { "Accept-Encoding": "gzip,deflate,compress" },
                timeout: 5000
            });
            const headers = this.getHeadersFromHtml(html.data);
            const doc = new JSDOM(html.data, { url });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();
            console.log(`END getTextByUrl: ${url}`);
            const text = cleanText(article.textContent);
            return {
                text,
                title: article.title,
                headers
            };
        } catch (e) {
            console.log(`ERROR getTextByUrl: ${url}`, e);
            return {
                text: String(e),
                title: 'GET_HTML_ERROR'
            };
        }  
    }
    
    getHeadersFromHtml = (html: string): string[] => {
        const headerArray = createHeaderArray(html)
            .map((headerStr) => {
                return removeHTML(headerStr);
            });
        
        return headerArray;
    }

    getTextContentForUrls = async (urls: string[], projectUrl: string, projectId: ObjectId): Promise<TextContent[]> => {
        const result = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (url.indexOf('.xml') === -1 && url.indexOf('.pdf') === -1 && url.indexOf('.doc') === -1  && url.indexOf('.jar') === -1 && url.indexOf('.doc') === -1  && url.indexOf('.xls') === -1 && url.indexOf('.csv') === -1) {
                const { text, title, headers } = await this.getTextByUrl(url);
                await services.textContentService.saveTextContent({ text, title, url, projectUrl, projectId, headers });
                result.push({ text, title, url, projectUrl, projectId, headers });
            }
        }
        return result;
    }
}
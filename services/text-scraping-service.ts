import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';

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
            let reader = new Readability(doc.window.document);
            let article = reader.parse();
            console.log(`END getTextByUrl: ${url}`);
            return {
                text: cleanText(article.textContent),
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

    getTextByUrls = async (urls: string[]): Promise<{ text: string, title: string, url: string }[]> => {
        const result = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const { text, title } = await this.getTextByUrl(url);
            result.push({ text, title, url });
        }
        return result;
    }
}
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';

const cleanText = (text: string) => {
    return text.replace(/[\t\n]/g, ' '); // remove /n and /t characters
}

export class TextScrapingService {
    getTextByUrl = async (url: string) => {
        const html = await axios.get(url);
        const doc = new JSDOM(html.data, { url });
        let reader = new Readability(doc.window.document);
        let article = reader.parse();
        return cleanText(article.textContent);
    }
}
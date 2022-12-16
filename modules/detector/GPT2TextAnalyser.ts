import axios from 'axios';
import { GPT2DetectorResult } from '../../types/types';

export class GPT2TextDetector {
    analyse = async (text: string): Promise<GPT2DetectorResult> => {
        console.log(`BEGIN: GPT2TextDetector.analyse`);
        const encodedUrl = encodeURIComponent(text);
        const response = await axios.get(`${process.env.GPT2_DETECTOR_SERVER_URL}/?${encodedUrl}`);
        console.log(`END GPT2TextDetector.analyse`);
        return response.data;
      }
}
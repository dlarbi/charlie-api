import axios from 'axios';
import { GPT2DetectorResult } from '../../types/types';
import { asyncSpawn } from '../../utils/utils';

export class GPT2TextDetector {
    detectorProcess: string;
    connect = async () => {
      console.log(`BEGIN: GPT2TextDetector.connect`);
      this.detectorProcess = await asyncSpawn(
        'python3', 
        ['-m', 'detector.server', 'detector-base.pt'],
        { cwd: '../gpt-2-output-dataset/' }
      )
      console.log(`END: GPT2TextDetector.connect`);
    }
    analyse = async (text: string): Promise<GPT2DetectorResult> => {
        console.log(`BEGIN: GPT2TextDetector.analyse`);
        const encodedUrl = encodeURIComponent(text);
        const response = await axios.get(`${process.env.GPT2_DETECTOR_SERVER_URL}/?${encodedUrl}`);
        console.log(`END GPT2TextDetector.analyse`);
        return response.data;
      }
}
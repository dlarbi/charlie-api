import { v4 as uuid } from 'uuid';
import { GPT2TextDetector } from '../detector/GPT2TextAnalyser';
import { AnalyserScore, AnalyserType, Rating } from '../../types/types';

export class ContentRater {
    gpt2Detector: GPT2TextDetector = new GPT2TextDetector();
    __constructor = () => {
    }

    rateText = async (text: string, analyserTypes: Array<AnalyserType>): Promise<Rating> => {
        const scores: AnalyserScore[] = [];

        if (!analyserTypes) {
            throw new Error('missing argument analyserTypes: Array<AnalyserType>');
        };

        if (analyserTypes.includes('gpt2-detector')) {
            const gpt2DetectorResult = await this.gpt2Detector.analyse(text);
            scores.push({
                real_score: gpt2DetectorResult.real_probability,
                fake_score: gpt2DetectorResult.fake_probability, 
                detectorResult: gpt2DetectorResult,
                analyserType: 'gpt2-detector'
            });
        }
        
        return {
              id: uuid(),
              overall: this.calculateOverallRating(scores),
              scores: scores,
        };
    }

    calculateOverallRating = (scores: Array<AnalyserScore>): number => {
        let overall = 0;
        scores.forEach(object => {
            overall += object.real_score;
        });
        return overall / scores.length;
    }
}
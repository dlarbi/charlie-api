export type RatedTextContent = {
    _id?: string;
    projectId?: string,
    children?: Array<string>;
    title?: string;
    text: string;
    rating: Rating;
    url?: string;
    analysedAt: Date | string;
    createdAt?: Date | string;
};

export type User = {
    _id?: string;
    email: string;
};

export interface Rating {
    id: string;
    contentId?: string;
    overall: number;
    scores: AnalyserScore[];
};

export type GPT2DetectorResult = {
    all_tokens: number;
    used_tokens: number;
    real_probability: number;
    fake_probability: number;
};

export type AnalyserType = "gpt2-detector" | "salesforce-ctrl-detector";

export interface ContentSource {
    type: "text";
    url?: string;
};

export interface AnalyserScore {
    real_score: number;
    fake_score: number;
    analyserType: AnalyserType;
    detectorResult: GPT2DetectorResult;
};
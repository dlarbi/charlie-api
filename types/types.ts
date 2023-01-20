import { ObjectId } from "mongodb";
export type TextContent = {
    _id?: ObjectId;
    projectUrl?: string,
    userId?: ObjectId | string,
    children?: Array<string>;
    title?: string;
    text: string;
    rating?: Rating;
    url?: string;
    analysedAt?: Date | string;
    createdAt?: Date | string;
    isIgnored?: boolean;
    projectId: ObjectId | string;
    headers?: string[];
};

export type User = {
    _id?: ObjectId;
    email: string;
    companyName?: string;
    password?: string;
    roles?: string[];
    token?: string;
    passwordResetToken?: string;
    passwordResetExpiry?: number;
    accountType?: string | AccountType;
    stripeCustomerId?: string;
};

export type AccountType = "free" | "professional" | "enterprise" | "god";

export type Project = {
    _id?: ObjectId;
    url: string;
    userId: ObjectId;
    name: string;
};

export type ProjectMetrics = {
    total: number;
    issues: number;
    score: number;
    analysedAt: Date | string;
    projectStatus: string;
    ratedCount: number;
}

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
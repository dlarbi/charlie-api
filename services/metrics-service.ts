import { ObjectId } from 'mongodb';
import { TextContent, ProjectMetrics } from '../types/types';
import { ProjectService } from './project-service';
import { TextContentService } from './text-content-service';
import { ProjectStatuses, NEGATIVE_THRESHOLD } from "../constants/constants";
const services = {
    textContentService: new TextContentService(),
    projectService: new ProjectService(),
}

const NO_RATING_ERROR_STATUS = -1;

export class MetricsService {
    getProjectMetrics = async (projectId: ObjectId): Promise<ProjectMetrics> => {
        const project = await services.projectService.getProjectById(projectId);
        const textContents = await services.textContentService.getTextContentsByProjectId(project._id);

        return {
            total: textContents.length,
            issues: this.textContentsToIssueCount(textContents),
            score: this.textContentsToOverallScore(textContents),
            projectStatus: this.textContentsToProjectStatus(textContents),
            ratedCount: this.getRatedCount(textContents),
            analysedAt: textContents[0]?.analysedAt
        }
    }

    getRatedCount = (textContents: TextContent[]) => {
        const ratedCount = textContents.reduce((is, textContent) => {
            if (!textContent.rating || textContent.rating?.overall === NO_RATING_ERROR_STATUS || textContent.isIgnored == true) {
                return is;
            }
            if (textContent.rating?.overall !== NO_RATING_ERROR_STATUS) {
                is += 1;
            }
            return is;
        }, 0);
        return ratedCount
    }

    textContentsToProjectStatus = (textContents: TextContent[]) => {
        if (!textContents || !textContents.length) {
            return ProjectStatuses.Crawling;
        }
    
        const ratedCount = this.getRatedCount(textContents)

        if (!ratedCount) {
            return ProjectStatuses.Extracting;
        }
        if ((ratedCount/textContents.length) < .95) {
            return ProjectStatuses.Analysing;
        }
        return ProjectStatuses.Complete;
    }

    textContentsToOverallScore = (textContents: TextContent[]): number => {
        let counted = 0;
        return Number((textContents.reduce((score, textContent) => {
            if (textContent.projectUrl === 'https://www.algrim.co') {
                console.log(score, 'Adding to score');

            }
            if (isNaN(textContent.rating?.overall) || (textContent.rating?.overall === NO_RATING_ERROR_STATUS || textContent.isIgnored == true)) {
                return score;
            }
            score += textContent.rating?.overall;
            counted += 1;
            return score;
        }, 0)/counted).toFixed(3));
    }

    textContentsToIssueCount = (textContents: TextContent[]): number => {
        return textContents.reduce((count, textContent) => {
            if (textContent.rating?.overall < NEGATIVE_THRESHOLD) {
                count += 1;
            }
            return count;
        }, 0);
    }

    getUserUsageMetrics = async (userId: ObjectId): Promise<{countUrls: number, countProjects: number}> => { 
        const projects = await services.projectService.getProjectsByUserId(new ObjectId(userId));
        const textContents = [];
        for (let i=0;i<projects.length;i++) {
            const url = projects[i].url;
            const result = await services.textContentService.getTextContentsByProjectUrl(url);
            textContents.push(...result);
        }
        return {
            countUrls: textContents.length,
            countProjects: projects.length
        }
    }
}
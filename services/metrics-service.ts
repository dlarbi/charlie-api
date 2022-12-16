import { ObjectId } from 'mongodb';
import { TextContent, ProjectMetrics } from '../types/types';
import { ProjectService } from './project-service';
import { TextContentService } from './text-content-service';

const services = {
    textContentService: new TextContentService(),
    projectService: new ProjectService()
}

const NO_RATING_ERROR_STATUS = -1;
export class MetricsService {
    getProjectMetrics = async (projectId: ObjectId): Promise<ProjectMetrics> => {
        const project = await services.projectService.getProjectById(projectId);
        const textContents = await services.textContentService.getTextContentsByProjectUrl(project.url);

        return {
            total: textContents.length,
            issues: this.textContentsToIssueCount(textContents),
            score: this.textContentsToOverallScore(textContents),
            analysedAt: textContents[0]?.analysedAt
        }
    }

    textContentsToOverallScore = (textContents: TextContent[]): number => {
        let counted = 0;
        return Number((textContents.reduce((score, textContent) => {
            if (textContent.rating?.overall === NO_RATING_ERROR_STATUS) {
                return score;
            }
            score += textContent.rating?.overall;
            counted += 1;
            return score;
        }, 0)/counted).toFixed(1));
    }

    textContentsToIssueCount = (textContents: TextContent[]): number => {
        return textContents.reduce((count, textContent) => {
            if (textContent.rating?.overall < .9) {
                count += 1;
            }
            return count;
        }, 0);
    }
}
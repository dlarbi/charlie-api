import { ObjectId } from 'mongodb';
import { Project, Rating } from '../types/types';
import { SitemappingService } from './sitemapping-service';
import { TextScrapingService } from './text-scraping-service';
import { ProjectModel } from '../models/project';
import { TextContentService } from './text-content-service';

const services = {
    sitemappingService: new SitemappingService(),
    textScrapingService: new TextScrapingService(),
    textContentService: new TextContentService()
};

let projectModel: ProjectModel;
(async () => {
    projectModel = new ProjectModel()
    await projectModel.connect();
})();

const noUserIdException = () => {
    return new Error('Cannot save Project without a userId');
  }

export class ProjectService {

    getProjectById = async (id: ObjectId ): Promise<Project> => {
        return projectModel.getById(id);
    }

    getProjectByUrl = async (url: string, userId: ObjectId): Promise<Project> => {
        return projectModel.getByUrlAndUserId(url, userId);
    }

    getProjectsByUserId = async (userId: ObjectId): Promise<Project[]> => {
        return projectModel.getByUserId(userId);
    }

    saveProject = async (project: Project): Promise<Project> => {
        let result: Project;
        if (!project.userId) {
            throw noUserIdException()
        }

        if (project._id) {
            result = await projectModel.updateProject(project);
            return result;
        } 

        return projectModel.saveProject(project);
    }

    deleteProject = async (projectId: ObjectId): Promise<void> => {
        const project = await this.getProjectById(projectId);
        const textContents = await services.textContentService.getTextContentsByProjectUrl(project.url);
        for(let i=0;i<textContents.length;i++) {
            await services.textContentService.deleteTextContent(textContents[i]?._id);
        }
        await projectModel.deleteProject(projectId);
    }
}
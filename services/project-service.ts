import { ObjectId } from 'mongodb';
import { Project, Rating } from '../types/types';
import { SitemappingService } from './sitemapping-service';
import { TextScrapingService } from './text-scraping-service';
import { ProjectModel } from '../models/project';
import { ProjectJobModel } from '../models/project-job';
import { TextContentService } from './text-content-service';

const services = {
    sitemappingService: new SitemappingService(),
    textScrapingService: new TextScrapingService(),
    textContentService: new TextContentService()
};

let projectModel: ProjectModel;
let projectJobModel: ProjectJobModel;
(async () => {
    projectModel = new ProjectModel();
    projectJobModel = new ProjectJobModel();
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

    getProjectsByUserId = async (userId: ObjectId | String): Promise<Project[]> => {
        return projectModel.getByUserId(String(userId));
    }

    saveProject = async (project: Project): Promise<Project> => {
        console.log(`BEGIN saveProject ${project}`)
        let result: Project;
        if (!project.userId) {
            throw noUserIdException()
        }

        if (project._id) {
            result = await projectModel.updateProject(project);
            return result;
        } 

        const saved = await projectModel.saveProject(project);
        console.log(`END saveProject`, JSON.stringify(saved));

        return saved;
    }

    startProjectJob = async (project: Project) => {
        const projectJob = await projectJobModel.save(project);
        // get all conetnt for the project
        const textContents = await services.textContentService.getUnratedTextContentsByProjectId(project._id || projectJob.projectId)
        // start from the last content in the project without a rating
            // if no content -- restatrt
            // if some content rated, start at the last content which is rated + 1
    }

    deleteProject = async (projectId: ObjectId): Promise<void> => {
        const textContents = await services.textContentService.getTextContentsByProjectId(projectId);
        for(let i=0;i<textContents.length;i++) {
            await services.textContentService.deleteTextContent(textContents[i]?._id);
        }
        await projectModel.deleteProject(projectId);
    }
}
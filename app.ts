import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { TextContent } from './types/types';
import { Password } from './modules/password/Password';
import { IGetUserAuthInfoRequest } from './modules/auth-middleware/auth';
import { auth } from './modules/auth-middleware/auth'
import { exampleTextContent } from './mocks/text-content';
import { ContentRatingService } from './services/content-rating-service';
import { TextScrapingService } from './services/text-scraping-service';
import { SitemappingService } from './services/sitemapping-service';
import { TextContentService } from './services/text-content-service';
import { UserService } from './services/user-service';
import { ProjectService } from './services/project-service';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req: express.Request, res: express.Response, next: any) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization");
	next();
});

const services = {
    contentRatingService: new ContentRatingService(),
	textScrapingService: new TextScrapingService(),
	sitemappingService: new SitemappingService(),
	textContentService: new TextContentService(),
	userService: new UserService(),
	projectService: new ProjectService()
};

  app.get('/', (req: express.Request, res: express.Response) => {
	try {
	  res.send('Welome to the Willie API');
	} catch (err) {
	  console.error(err);
	  res.status(500).send('Something went wrong');
	}
  });

  app.get('/project/', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const user = req.user;
		const projects = await services.projectService.getProjectsByUserId(user._id);
		res.json({ projects });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.get('/project/:projectUrl', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { projectUrl } = req.params;
		const user = req.user;
		const response = await services.projectService.getProjectByUrl(projectUrl, user._id);
		res.json({ user: response });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.post('/user', async (req: express.Request, res: express.Response) => {
	try {
		const { email, password } = req.body;
		const hashedPassword = await Password.hashPassword(password);
		const response = await services.userService.createUser(email, hashedPassword);
		res.json({ user: response });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.post('/user/login', async (req: express.Request, res: express.Response) => {
	try {
		const { email, password } = req.body;
		const token = await services.userService.auth(email, password);
		res.json({ token });
	} catch (err) {
		console.error(err);
		res.status(401).send(`Login error ${err}`);
	}
  });
  
  app.post('/rating/url', async (req: express.Request, res: express.Response) => {
	  try {
		  const { url } = req.body; 
		  const { text, title } = await services.textScrapingService.getTextByUrl(url);
		  const textContent: TextContent = await services.contentRatingService.rateTextContent({ text, title, url });
		  res.json({content: textContent });
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/text', async (req: express.Request, res: express.Response) => {
	  try {
		  const { text } = req.body;		  
		  const textContent: TextContent = await services.contentRatingService.rateTextContent({ text });
		  res.json({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/website', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	  try {
		const { url, count } = req.body;
		const user = req.user;
		// @TODO Move this functionality of getting existing.  The logic should still exist somewhere, but 
		// this specific POST /rating/website route should always re-rate the URLS for a project
		const existingTextContent = await services.textContentService.getTextContentsIfRated(url);
		if (existingTextContent.length) {
			res.json({
				results: existingTextContent
			})
			return;
		}

		// TODO: Make this a job that kicks off later	
		await services.projectService.saveProject({ url, userId: user._id });
		const textContent: TextContent[] = await services.contentRatingService.rateTextContentByCrawlSite(url);
		res.json({ results: textContent });
	  } catch (err) {
		  console.error('ERROR: POST /rating/website', err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.get('/rating/text/:contentId', (req: express.Request, res: express.Response) => {
	  try {
		  const { contentId } = req.params;
		  
		  // Fetch content from DB
		  const textContent: TextContent = exampleTextContent;
		  
		  res.send({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.get('/rating/:ratingId', (req: express.Request, res: express.Response) => {
	  try {
		  const { ratingId } = req.params;
		  
		  // Fetch content from DB
		  const textContent: TextContent = exampleTextContent;
  
		  res.send({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
import * as dotenv from 'dotenv';
dotenv.config();
import { ObjectId } from 'mongodb';
import * as express from 'express';
import { StripePaymentProcessor } from './modules/stripe/stripe-payment-processor'
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
import { MetricsService } from './services/metrics-service';
import { getHostname } from './utils/utils';
import { UNDEFINED_PROJECT_URL } from './constants/constants';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req: express.Request, res: express.Response, next: any) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization");
	next();
});

const services = {
    contentRatingService: new ContentRatingService(),
	textScrapingService: new TextScrapingService(),
	sitemappingService: new SitemappingService(),
	textContentService: new TextContentService(),
	userService: new UserService(),
	projectService: new ProjectService(),
	metricsService: new MetricsService()
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

  app.get('/project/:projectId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { projectId } = req.params;
		const user = req.user;
		const project = await services.projectService.getProjectById(new ObjectId(projectId));
		res.json({ project });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.delete('/project/:projectId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { projectId } = req.params;
		await services.projectService.deleteProject(new ObjectId(projectId));
		res.status(204).send(`Deleted ${projectId}`);
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.get('/metrics/:projectId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { projectId } = req.params;
		const metrics = await services.metricsService.getProjectMetrics(new ObjectId(projectId));
		res.json({ metrics });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.get('/metrics/user/:userId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { userId } = req.params;
		const metrics = await services.metricsService.getUserUsageMetrics(new ObjectId(userId));
		res.json({ metrics });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.get('/content/:contentId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { contentId } = req.params;
		const content = await services.textContentService.getByContentId(new ObjectId(contentId));
		res.json({ content });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.post('/content', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { content } = req.body;
		const user = req.user;

		const result = await services.textContentService.saveTextContent(content);
		res.json({ result });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.post('/content/:contentId/ignore', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { contentId } = req.params;
		const user = req.user;

		const result = await services.textContentService.ignoreTextContent(contentId);
		res.json({ result });
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

  app.post('/request-reset-password', async (req: express.Request, res: express.Response) => {
	try {
		const { email } = req.body;
		const response = await services.userService.requestResetPassword(email);
		res.json({ message: `Request reset password sent to ${email}` });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
  });

  app.post('/reset-password', async (req: express.Request, res: express.Response) => {
	try {
		const { token, email, password, password2 } = req.body;
		const response = await services.userService.resetPassword(token, email, password, password2);
		res.json({ response });
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

  app.put('/user', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	const authUser = req.user;
	const { user } = req.body;
	
	try {
		const result = await services.userService.updateUser(user);
		res.json({ user: result });
	} catch (err) {
		console.error(err);
		res.status(401).send(`Login error ${err}`);
	}
  });

  app.post('/auth/token', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const userId = req.user._id;
		const user = await services.userService.findUserById(new ObjectId(userId));
		res.json({ user });
	} catch (err) {
		console.error(err);
		res.status(401).send(`Login error ${err}`);
	}
  });

  app.get('/text-content/:projectId', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { projectId } = req.params;		
		const userId = req.user._id;

		const textContent = await services.textContentService.getTextContentsByProjectId(new ObjectId(projectId));

		res.json({ results: textContent });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
});

app.post('/rating/text', async (req: express.Request, res: express.Response) => {
	try {
		const { content } = req.body;		  
		const textContent: TextContent = await services.contentRatingService.getRatingForTextContent(content);
		res.json({ content: textContent });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
});
  
app.post('/rating/website', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
	const { url, name } = req.body;
	const user = req.user;
	const project = await services.projectService.saveProject({ url, userId: user._id, name });
	// TODO: Make this a job that kicks off later	
	services.contentRatingService.rateTextContentByCrawlSite(url, project._id);
	res.json({ project });
	} catch (err) {
		console.error('ERROR: POST /rating/website', err);
		res.status(500).send('Something went wrong');
	}
});

app.post('/rating/refresh-website', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
	const { url, projectId } = req.body;
	const user = req.user;

	// TODO: Make this a job that kicks off later	
	const results = await services.contentRatingService.unrateFailedTextContents(new ObjectId(projectId));
	services.contentRatingService.rateTextContents(results);
	res.json({ results });
	} catch (err) {
		console.error('ERROR: POST /rating/website', err);
		res.status(500).send('Something went wrong');
	}
});

app.post('/rating/refresh-content', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { url, projectUrl, projectId } = req.body; 
		const user = req.user;
		const { text, title } = await services.textScrapingService.getTextByUrl(url);
		const textContent: TextContent = await services.contentRatingService.rateTextContent({ text, title, userId: user._id, url, projectUrl, isIgnored: false, projectId: new ObjectId(projectId) });
		res.json({ results: textContent });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
})

app.post('/rating/url', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { url } = req.body; 
		const user = req.user;
		const { text, title } = await services.textScrapingService.getTextByUrl(url);
		const textContent: TextContent = await services.contentRatingService.rateTextContent({ text, title, userId: user._id, url, projectUrl: UNDEFINED_PROJECT_URL, projectId: UNDEFINED_PROJECT_URL });
		res.json({ results: textContent });
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
});


app.post('/payment/create-user', async (req: express.Request, res: express.Response) => {
	try {
		const { email } = req.body;
		const stripe = new StripePaymentProcessor();
		const customer = await stripe.createCustomer({ email });
		res.status(200).json({
		  message: `User created with email ${email}`,
		  customer
		});
	  } catch (err) {
		console.log(err);
		res.status(400).json({
		  message: "There was an error creating the user.",
		  error: err,
		});
	  }
});

app.post('/payment/add-method', async (req: express.Request, res: express.Response) => {
	try {
		const { customerId, paymentMethodId } = req.body;
		const stripe = new StripePaymentProcessor();
		const attachedPaymentMethod = await stripe.attachPaymentMethodToCustomer(customerId, paymentMethodId);
		res.status(200).json({
		  message: `Payment method attached to ${customerId}`,
		  attachedPaymentMethod
		});
	  } catch (err) {
		console.log(err);
		res.status(400).json({
		  message: "There was an error creating the user.",
		  error: err,
		});
	  }
});

app.get('/payment/methods/:customerId', async (req: express.Request, res: express.Response) => {
	try {
		const { customerId } = req.params;
		const stripe = new StripePaymentProcessor();
		const paymentMethods = await stripe.getCustomerPaymentMethods(customerId);
		res.status(200).json({
			paymentMethods
		});
	  } catch (err) {
		console.log(err);
		res.status(400).json({
		  message: "There was an error getting payment methods for this user",
		  error: err,
		});
	  }
});

app.delete('/payment/methods/:paymentMethodId', async (req: express.Request, res: express.Response) => {
	try {
		const { paymentMethodId } = req.params;
		const stripe = new StripePaymentProcessor();
		const paymentMethods = await stripe.deletePaymentMethod(paymentMethodId);
		res.status(200).send('Deleted successfully');
	  } catch (err) {
		console.log(err);
		res.status(400).json({
		  message: "There was an error deleting a payment method for this user",
		  error: err,
		});
	  }
})

app.post('/payment/subscribe', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const { accountType } = req.body;
		const user = req.user;
		const updated = await services.userService.changeAccountType(new ObjectId(user._id), accountType);

		res.status(200).json({
		  message: `${user.email} upgraded to ${accountType}`,
		  user: updated,
		});
	  } catch (err) {
		console.log(String(err));
		res.status(400).json({
		  message: "There was an error creating the subscriber.",
		  error: String(err),
		});
	  }
});

app.post('/payment/cancel', auth, async (req: IGetUserAuthInfoRequest, res: express.Response) => {
	try {
		const user = req.user;
		const updated = await services.userService.changeAccountType(new ObjectId(user._id), 'free');

		res.status(200).json({
		  message: `${user.email} upgraded moved to free account`,
		  user: updated,
		});
	  } catch (err) {
		console.log(err);
		res.status(400).json({
		  message: "There was an error cancelling the subscriber.",
		  error: err,
		});
	  }
});

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
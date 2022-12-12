import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { RatedTextContent } from './types/types';
import { exampleRatedTextContent } from './mocks/text-content';
import { ContentRatingService } from './services/content-rating-service';
import { TextScrapingService } from './services/text-scraping-service';
import { SitemappingService } from './services/sitemapping-service';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req: express.Request, res: express.Response, next: any) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

const services = {
    contentRatingService: new ContentRatingService(),
	textScrapingService: new TextScrapingService(),
	sitemappingService: new SitemappingService()
};

app.get('/', (req: express.Request, res: express.Response) => {
	try {
	  res.send('Welome to the Charlie API');
	} catch (err) {
	  console.error(err);
	  res.status(500).send('Something went wrong');
	}
  });
  
  app.post('/rating/url', async (req: express.Request, res: express.Response) => {
	  try {
		  const { url } = req.body;
		  console.log(req.body)
		  
		  const { text, title } = await services.textScrapingService.getTextByUrl(url);
		  const textContent: RatedTextContent = await services.contentRatingService.generateRatedTextContent(text, title, url);
		  
		  res.json({content: textContent });
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/text', async (req: express.Request, res: express.Response) => {
	  try {
		  const { text } = req.body;
		  
		  const textContent: RatedTextContent = await services.contentRatingService.generateRatedTextContent(text);
		  res.json({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/website', async (req: express.Request, res: express.Response) => {
	  try {
		  const { url, count } = req.body;
		  if (count && count <= 20) {
			  const urls = await services.sitemappingService.getUrlsFromParentUrl(url, count);			  
			  const textContentNotRated = await services.textScrapingService.getTextByUrls(urls);
			  const textContent: RatedTextContent[] = await services.contentRatingService.generateRatedTextContents(textContentNotRated);
			  await services.contentRatingService.saveRatedTextContents(textContent); 
			  res.json({ results: textContent });
		  } else {			  
			  // TODO: Make this a job that kicks off later			  
			  const textContent: RatedTextContent[] = await services.contentRatingService.generateRatedTextContentByCrawlSite(url);
			  await services.contentRatingService.saveRatedTextContents(textContent);
			  res.json({ results: textContent });
		  }
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.get('/rating/text/:contentId', (req: express.Request, res: express.Response) => {
	  try {
		  const { contentId } = req.params;
		  
		  // Fetch content from DB
		  const textContent: RatedTextContent = exampleRatedTextContent;
		  
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
		  const textContent: RatedTextContent = exampleRatedTextContent;
  
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
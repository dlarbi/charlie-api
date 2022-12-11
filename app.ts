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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
		  
		  const text = await services.textScrapingService.getTextByUrl(url);
		  const textContent: RatedTextContent = await services.contentRatingService.getRatedTextContent(text, url);
		  
		  res.json({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/text', async (req: express.Request, res: express.Response) => {
	  try {
		  const { text } = req.body;
		  
		  const textContent: RatedTextContent = await services.contentRatingService.getRatedTextContent(text);
		  res.json({content: textContent});
	  } catch (err) {
		  console.error(err);
		  res.status(500).send('Something went wrong');
	  }
  });
  
  app.post('/rating/website', async (req: express.Request, res: express.Response) => {
	  try {
		  const { url, count } = req.body;
		  if (count && count < 10) {
			  const urls = await services.sitemappingService.getUrlsFromParentUrl(url, count);
			  
			  const results = [];
			  for (let i = 0; i < urls.length; i++) {
				const url = urls[i];
				const text = await services.textScrapingService.getTextByUrl(url);
				const textContent: RatedTextContent = await services.contentRatingService.getRatedTextContent(text, url);
				results.push(textContent);	
			  }

			  res.json({ results });
		  } else {
			  // This operation will take too long (crawl full site and analyze), so we use a queue
			  
			  // Generate and save sitemap to a filepath
			  const sitemapMetadata = await services.sitemappingService.generateSitemap(url);
			  
			  // Publish the sitemap to a queue for later analysis

			  res.json({
				  message: `Ratings are being generated for the sitemap at ${url}`,
				  sitemapPath: sitemapMetadata.filepath
			  });
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
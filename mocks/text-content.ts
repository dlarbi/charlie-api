import { RatedTextContent } from "../types/types";
export const exampleRatedTextContent: RatedTextContent = {
    _id: '12345',
    children: ['abc', 'def', 'ghi'],
    text: 'This is an example text content object.',
    title: 'This is a title',
    createdAt: new Date(),
    url: 'https://thoughtcatalog.com/daniell-koepke/2022/02/stop-apologizing-for-having-to-take-care-of-yourself-right-now/',
    rating: {
      id: '56789',
      contentId: '12345',
      overall: 0.7,
      scores: [
        {
          real_score: 0.7,
          fake_score: .3,
          analyserType: 'gpt2-detector',
          detectorResult: {
            all_tokens: 1,
            used_tokens: 1,
            real_probability: 1,
            fake_probability: 1,
          }
        },
        {
          real_score: 0.7,
          fake_score: .3,
          analyserType: 'salesforce-ctrl-detector',
          detectorResult: {
            all_tokens: 1,
            used_tokens: 1,
            real_probability: 1,
            fake_probability: 1
          }
        }
      ]
    }
  };
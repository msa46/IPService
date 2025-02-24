import { Elysia } from 'elysia';
import { RateLimitService } from './database';

const app = new Elysia();
const ratelimit = 20;
const rateLimitService = new RateLimitService(ratelimit); // Reset after 60 minutes

app
  .get('/', async ({ request }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { count, isLimited } = await rateLimitService.recordRequest(ip);
    
    if (isLimited) {
      return {
        error: 'Rate limit exceeded',
        count,
        status: 429
      };
    }

    return {
      message: 'Request recorded',
      count,
      status: 200
    };
  })
  .get('/stats/:ip', async ({ params: { ip } }) => {
    const stats = await rateLimitService.getStats(ip);
    if (stats.count < ratelimit) {
      return {
        message: 'Rate limit not exceeded',
        status: 200
      };
    } else {
      return {
        message: 'Rate limit exceeded',
        status: 429
      };
    }
    
  })
  .listen(3000);

console.log('Server running at http://localhost:3000');

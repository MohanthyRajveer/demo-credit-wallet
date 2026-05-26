import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

export class AdjutorService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.ADJUTOR_BASE_URL || 
        'https://adjutor.lendsqr.com/v2',
      headers: {
        Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async isBlacklisted(identity: string): Promise<boolean> {
    try {
      const response = await this.client.get(
        `/verification/karma/${identity}`
      );
      return response.status === 200 && !!response.data?.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // 404 means identity is NOT on the blacklist — user is clean
        if (error.response?.status === 404) {
          return false;
        }
        logger.error('Adjutor Karma API error', {
          status: error.response?.status,
          message: error.message,
          identity,
        });
      }
      // If API is unreachable, fail open (allow user) but log it
      logger.warn('Adjutor API unreachable, proceeding anyway', {
        identity,
      });
      return false;
    }
  }
}

export default new AdjutorService();
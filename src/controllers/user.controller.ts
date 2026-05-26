import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../types';
import { successResponse, errorResponse } from '../utils/helpers';
import { validateCreateUser } from '../utils/validators';
import logger from '../utils/logger';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateUserDto = req.body;

      // Validate incoming data first
      const validation = validateCreateUser(dto);
      if (!validation.isValid) {
        res.status(400).json(
          errorResponse(
            'Validation failed',
            validation.errors.join('; ')
          )
        );
        return;
      }

      const result = await this.userService.createUser(dto);

      res.status(201).json(
        successResponse('Account created successfully', {
          user: {
            id: result.user.id,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            email: result.user.email,
            phone: result.user.phone,
          },
          wallet: {
            id: result.wallet.id,
            balance: result.wallet.balance,
            currency: result.wallet.currency,
          },
          // This is the faux auth token — just the user's ID
          auth_token: result.user.id,
          note: 'Use auth_token as your Bearer token for authenticated requests',
        })
      );
    } catch (error) {
      logger.error('Create user error', { error });
      const message =
        error instanceof Error ? error.message : 'Failed to create user';

      if (
        message.includes('blacklist') ||
        message.includes('already exists')
      ) {
        res.status(409).json(errorResponse(message));
        return;
      }

      res.status(500).json(errorResponse('Failed to create account'));
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.userService.getUserWithWallet(userId);

      if (!profile) {
        res.status(404).json(errorResponse('User not found'));
        return;
      }

      const { wallet, ...user } = profile;

      res.json(
        successResponse('Profile retrieved', {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
          },
          wallet: {
            id: wallet.id,
            balance: wallet.balance,
            currency: wallet.currency,
          },
        })
      );
    } catch (error) {
      logger.error('Get profile error', { error });
      res.status(500).json(errorResponse('Failed to retrieve profile'));
    }
  };
}
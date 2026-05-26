import { Knex } from 'knex';
import { User, Wallet, CreateUserDto } from '../types';
import { generateId } from '../utils/helpers';
import adjutorService from './adjutor.service';
import logger from '../utils/logger';

export class UserService {
  constructor(private readonly db: Knex) {}

  async createUser(
    dto: CreateUserDto
  ): Promise<{ user: User; wallet: Wallet }> {
    // 1. Check blacklist for BVN, email and phone
    const identities = [dto.bvn, dto.email, dto.phone];
    for (const identity of identities) {
      const blacklisted = await adjutorService.isBlacklisted(identity);
      if (blacklisted) {
        logger.warn('Blacklisted identity tried to onboard', {
          identity,
        });
        throw new Error(
          'User cannot be onboarded due to Karma blacklist restrictions'
        );
      }
    }

    // 2. Check for duplicate email, phone or BVN
    const existingUser = await this.db<User>('users')
      .where({ email: dto.email })
      .orWhere({ phone: dto.phone })
      .orWhere({ bvn: dto.bvn })
      .first();

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new Error('A user with this email already exists');
      }
      if (existingUser.phone === dto.phone) {
        throw new Error('A user with this phone number already exists');
      }
      throw new Error('A user with this BVN already exists');
    }

    // 3. Create user and wallet together in one transaction
    return await this.db.transaction(async (trx) => {
      const userId = generateId();
      const walletId = generateId();

      const newUser: User = {
        id: userId,
        first_name: dto.first_name.trim(),
        last_name: dto.last_name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        bvn: dto.bvn.trim(),
      };

      await trx<User>('users').insert(newUser);

      const newWallet: Wallet = {
        id: walletId,
        user_id: userId,
        balance: 0,
        currency: 'NGN',
      };

      await trx<Wallet>('wallets').insert(newWallet);

      logger.info('User and wallet created', { userId, walletId });

      return { user: newUser, wallet: newWallet };
    });
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.db<User>('users').where({ id }).first();
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.db<User>('users')
      .where({ email: email.toLowerCase() })
      .first();
  }

  async getUserWithWallet(
    userId: string
  ): Promise<(User & { wallet: Wallet }) | undefined> {
    const user = await this.db<User>('users')
      .where({ id: userId })
      .first();
    if (!user) return undefined;

    const wallet = await this.db<Wallet>('wallets')
      .where({ user_id: userId })
      .first();
    if (!wallet) return undefined;

    return { ...user, wallet };
  }
}
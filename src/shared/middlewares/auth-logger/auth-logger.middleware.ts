import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../../user/entities/user.entity';
import { UserRepository } from '../../../user/repositories/user.repository';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

const clerk = CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: CLERK_SECRET_KEY })
  : null;

const getClerkScalar = (
  value: string | null | undefined,
  fallback = '',
): string => value?.trim() || fallback;

const syncClerkUser = async (
  req: Request,
  userRepo?: UserRepository,
): Promise<void> => {
  const auth = req.headers.authorization ?? null;
  console.log('Auth middleware received', {
    method: req.method,
    url: req.originalUrl,
    authorization: auth,
    userAgent: req.headers['user-agent'] ?? null,
  });

  if (!auth) {
    return;
  }

  if (!CLERK_SECRET_KEY) {
    console.log('CLERK_SECRET_KEY not configured; cannot use Clerk SDK');
    return;
  }

  if (!clerk) {
    console.log('Clerk backend client could not be initialized');
    return;
  }

  try {
    const token = String(auth).startsWith('Bearer ')
      ? String(auth).slice(7)
      : String(auth);

    const verifiedToken = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
    });

    const clerkUserId = verifiedToken.sub;
    if (!clerkUserId) {
      console.log('Could not determine user id from Clerk token response', verifiedToken);
      return;
    }

    const clerkUser = await clerk.users.getUser(clerkUserId);
    console.log('Clerk user data (SDK)', clerkUser);

    if (!userRepo) {
      console.log('No UserRepository provided to AuthLoggerMiddleware; skipping DB sync');
      return;
    }

    let appUser = await userRepo.findOne({
      where: { clerkId: clerkUserId },
    });

    if (!appUser) {
      const newUuid = uuidv4();
      const username =
        getClerkScalar((clerkUser as any).username) ||
        getClerkScalar((clerkUser as any).emailAddresses?.[0]?.emailAddress) ||
        clerkUserId;
      const email =
        getClerkScalar((clerkUser as any).emailAddresses?.[0]?.emailAddress);
      const firstName = getClerkScalar((clerkUser as any).firstName);
      const fullName = getClerkScalar((clerkUser as any).fullName);

      appUser = userRepo.create({
        name: firstName || fullName || username,
        password: '',
        username,
        roles: ['user'],
        isAccountDisabled: false,
        email,
        uuid: newUuid,
        clerkId: clerkUserId,
      } as unknown as User);

      appUser = await userRepo.save(appUser);
      console.log('Created local user for clerkId', clerkUserId);
    }

    req.userId = appUser.uuid;
  } catch (e) {
    console.log('Failed to fetch or sync Clerk user (SDK)', {
      error: e?.toString?.() ?? e,
    });
  }
};

export const createAuthLoggerMiddleware = (userRepo?: UserRepository) => {
  return (req: Request, _res: Response, next: () => void): void => {
    void syncClerkUser(req, userRepo).finally(() => next());
  };
};

export const AuthLoggerMiddleware = createAuthLoggerMiddleware();

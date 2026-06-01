import 'express';

import { ROLE } from '../../auth/constants/role.constant';
import { User as AppUserEntity } from '../../user/entities/user.entity';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      roles: ROLE[];
    }

    interface Request {
      userId?: string;
      user?: User;
      appUser?: AppUserEntity;
    }
  }
}

export {};

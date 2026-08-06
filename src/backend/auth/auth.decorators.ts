import { SetMetadata } from '@nestjs/common';
import { UserRole } from './roles.guard';

export const Public = () => SetMetadata('isPublic', true);

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

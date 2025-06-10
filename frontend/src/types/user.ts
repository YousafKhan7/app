/**
 * User-related type definitions
 */
import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  name: string;
  email: string;
  active: boolean;
}

export interface UserCreate {
  name: string;
  email: string;
  active: boolean;
}

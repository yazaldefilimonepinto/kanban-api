import { userStoreType } from '~/domain/user/dtos';

export interface IUserRepository {
  sign: (data: userStoreType) => Promise<{ id: string }>;
  getId: ({ id }: { id: string }) => Promise<Omit<userStoreType, 'password'> | null>;
  getEmail: ({ email }: { email: string }) => Promise<userStoreType | null>;
  getName: ({ name }: { name: string }) => Promise<Omit<userStoreType, 'password'>[] | null>;
  getAll: () => Promise<Omit<userStoreType, 'password'>[]>;
}

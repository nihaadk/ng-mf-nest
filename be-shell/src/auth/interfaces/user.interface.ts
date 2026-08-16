export interface MockUser {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export type PublicUser = Omit<MockUser, 'password'>;

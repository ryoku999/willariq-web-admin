import type { UserProfile } from "../entities/users.entity";

export interface UsersRepository {
  userProfile: () => Promise<UserProfile>;
}

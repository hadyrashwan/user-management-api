export interface IUser {
  readonly id: number;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly avatar: string;
}

export interface IUserAvatar {
  readonly userId: string;
  readonly hash: string;
  readonly imagePath: string;
}

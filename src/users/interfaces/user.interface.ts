export interface IUser {
  readonly id: number;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly avatar: string;
}

export interface IUserAvatar {
  readonly id: string;
  readonly hash: string;
  readonly imagePath: string;
  readonly image: Buffer;
}

export interface IFindAvatar {
  found: boolean;
  image?: string;
}

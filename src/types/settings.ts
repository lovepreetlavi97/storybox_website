export interface ISettings {
  _id?: string;
  appTitle: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  supportText?: string;
  updatedAt?: string;
}

export interface IAdmin {
  username: string;
}

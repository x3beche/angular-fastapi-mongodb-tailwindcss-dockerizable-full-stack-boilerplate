export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  status: string;
  activated?: boolean;
  pp?: string;
}

export interface UserRegister {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  re_password: string;
}

export interface UserSettingsProfileCredentials {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  process: boolean;
}

export interface UserSettingsPasswordCredentials {
  current_password: string;
  password: string;
  re_password: string;
  process: boolean;
}

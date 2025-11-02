import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    username: string;
    role: 'user' | 'technician' | 'admin';
    name: string;
    email?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData & {
        cookie: any;
      };
    }
  }
}

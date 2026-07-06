import type { Request, Response, NextFunction } from 'express';

/** Basic auth gate for Swagger UI in production. */
export function swaggerBasicAuth(user: string, pass: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (header?.startsWith('Basic ')) {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const sep = decoded.indexOf(':');
      const login = decoded.slice(0, sep);
      const password = decoded.slice(sep + 1);
      if (login === user && password === pass) {
        next();
        return;
      }
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="DevForge API Docs"');
    res.status(401).send('Authentication required');
  };
}

export function isSwaggerPath(path: string): boolean {
  return path === '/api/docs' || path.startsWith('/api/docs/') || path === '/api/docs-json';
}

import express, { Express, NextFunction, Request, Response } from 'express';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';
import { errorEnvelope, ValidationError } from './util/validate';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/tasks', tasksRouter);
  app.use('/users', usersRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Route not found'));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    console.error(err);
    res.status(500).json(errorEnvelope('INTERNAL_ERROR', 'Something went wrong'));
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, () => {
    console.log(`TaskFlow API listening on port ${port}`);
  });
}

import Fastify from 'fastify';
import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default('0.0.0.0'),
});

const environment = environmentSchema.parse(process.env);
const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok', service: 'clipper-api' }));

const start = async () => {
  try {
    await app.listen({ port: environment.PORT, host: environment.HOST });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};

void start();

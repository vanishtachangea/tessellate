// @flow

import koaStatic from 'koa-static';
import kcors from 'kcors';
import logger from './logger';
import bundleEpic from './epics/bundles';
import { TessellateServer } from 'tessellate-server';
import nconf, { getFileSystemPublishTarget } from './nconf';

const log = logger('server');

export function init(): TessellateServer {
  const server = new TessellateServer();

  server.use(kcors());

  const fileSystemPublishTarget = getFileSystemPublishTarget();
  if (fileSystemPublishTarget) {
    log.info('Serving files from %s', fileSystemPublishTarget);
    server.app.use(koaStatic(fileSystemPublishTarget, { defer: true, gzip: true }));
  }

  server.router.get('/health', o => o.mapTo('OK'));
  server.router.post('/bundles/:domain/:name', bundleEpic);

  return server;
}

export async function start(
  port: number | string = nconf.get('APP_PORT')
): Promise<TessellateServer> {
  const server = await init().start(parseInt(port));
  log.info('listening on port %d', port);
  return server;
}

export function main() {
  start().catch(log.error);
}

if (require.main === module) {
  main();
}

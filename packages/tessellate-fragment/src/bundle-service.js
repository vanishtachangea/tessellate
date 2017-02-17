// @flow

import url from 'url'
import request from 'request-promise-native'
import logger from './logger'
import { Problem } from './error'

export type Bundle = {
  source: string;
  links: {
    js: string;
    css: string;
  };
}

const log = logger('bundle-service')

class BundleProblem extends Problem {
  constructor(detail: string) {
    super({title: 'Bundle error.', detail, status: 404})
  }
}

export async function fetchBundle(sources: Object): Promise<Bundle> {
  const uri = url.parse(sources.bundles.src)

  if ((uri.protocol === 'http:' || uri.protocol === 'https:') && uri.hostname) {
    const baseURL = url.format({
      protocol: uri.protocol,
      hostname: uri.hostname,
      port: uri.port,
      pathname: sources.bundles.path
    })
    return await fetchBundleFromHTTPSource(baseURL)
  } else {
    throw new BundleProblem(`Illegal bundle source ${uri.href}`)
  }
}

async function fetchBundleFromHTTPSource(baseURL: string): Promise<Bundle> {
  const jsURL = `${baseURL}/index.js`
  const cssURL =  `${baseURL}/index.css`

  log.debug('Fetch bundle %s', jsURL)
  const source = await request(jsURL)
  return {source, links: {js: jsURL, css: cssURL}}
}

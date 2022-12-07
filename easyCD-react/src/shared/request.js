// Modules
import qs from 'querystring';

// Lodash
import get from 'lodash/get';

// Config
import config from '@src/config';

const { API_BASE } = config;

const defaultHeaders = {
  Accept: 'application/json'
};

// Grab the opo
function getHeaders ( options ) {
  const { body } = options;
  const headers = { ...defaultHeaders, ...options.headers };
  const isJson = Object.prototype.toString.call(body) === '[object Object]';
  if (isJson) {
    headers[ 'Content-Type' ] = 'application/json';
  }
  return headers;
}

function getOpts (options ) {
  return {
    headers: getHeaders(options),
    body: get(options, 'body') || undefined,
    method: get(options, 'method')
  };
}

// Get the path sent, and build it with the existent query params
function getPath (path, options) {
  const query = get(options, 'query') || {};
  const queryString = qs.stringify(query, {
    addQueryPrefix: true,
    arrayFormat: 'comma'
  });
  return path + queryString;
}

// All get request need to have query prop
// All POST, PUT and DELETE can have body
async function request (path, options) {
  const opts = getOpts(options);
  const _path = getPath(path, options);
  const requestUrl = `${ API_BASE }/api/${ _path }`;

  const response = await fetch(requestUrl, opts);
  return response;
}

export default request;

// Modules
import qs from 'querystring';

// Lodash
import get from 'lodash/get';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';

// Config
import config from '@src/config';

const { API_BASE } = config;

const defaultHeaders = {
  Accept: 'application/json'
};

// Grab the opo
function getHeaders (options) {
  const { body } = options;
  const headers = { ...defaultHeaders, ...options.headers };
  const isJson = Object.prototype.toString.call(body) === '[object Object]';
  if (isJson) {
    headers[ 'Content-Type' ] = 'application/json';
  }
  return headers;
}

function getBody (options){
  const body = get(options, 'body');
  return JSON.stringify(body);
}

function getOpts (options ) {
  return {
    headers: getHeaders(options),
    body: getBody(options),
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
async function _request (path, options) {
  const opts = getOpts(options);
  const _path = getPath(path, options);
  const requestUrl = `${ API_BASE }/api/${ _path }`;

  const response = await fetch(requestUrl, opts);
  return response;
}

async function request (path, options){
  const response = await _request(path, options);

  const json = options.asRaw || response.status === 204 ? response : await jsonBody(response);

  if(!get(response,'okay')){
    return createError(json);
  }

  return json;
}

function createError (data) {
  if (isString(data.message)) {
    return data.message;
  } else if (isObject(data.error)) {
    return data.error.message;
  } else if (isString(data.error)) {
    return data.error;
  } else {
    return 'Unexpected error';
  }
}

const jsonBody = async (response) => {
  try {
    return response.json();
  } catch (err) {
    console.warn('The server did not send a JSON response', err);
    return {};
  }
};

export default request;

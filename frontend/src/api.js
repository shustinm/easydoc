
export const BASE_URI = process.env.NODE_ENV == 'production' ? process.env.BACKEND_URL : 'http://localhost:5000';

export const API = '/api';

export const QUERY_API = API + '/search';
export const CREATE_API = API + '/create';

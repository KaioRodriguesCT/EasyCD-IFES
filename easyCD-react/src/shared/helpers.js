import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
export const isAdmin = (user) => isEqual(get(user,'role'),'admin');
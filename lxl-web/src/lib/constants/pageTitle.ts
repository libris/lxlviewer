import { env } from '$env/dynamic/public';

export const TITLE_SEPARATOR = ' | ';
export const TITLE_SUFFIX = env.PUBLIC_SERVICE_NAME || 'Libris';
export const TITLE_MAX_LENGTH = 64;

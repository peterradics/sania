import PocketBase from 'pocketbase';

export const createPocketBase = () => new PocketBase('http://127.0.0.1:8090');

// 1. Add 'Functions' to your Appwrite import line
import { Client, Databases, Account, Functions } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

// 2. Instantiate and export the Functions service instance
export const functions = new Functions(client); 

export { client };

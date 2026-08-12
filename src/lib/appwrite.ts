import { Client, Databases, Functions } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "project-nyc-6a53db7d001a48dac20e");

export const databases = new Databases(client);
export const functions = new Functions(client);
export { client };

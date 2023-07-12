import *  as dotenv from "dotenv";
dotenv.config();

function getEnvironmentVariable(environmentVariable: string): string {
    const validEnvironmentVariable = process.env[environmentVariable];
    if (!validEnvironmentVariable) {
        throw new Error(`Environment variable ${environmentVariable} is not set.`);
    }
    return validEnvironmentVariable;
}

// this way build will break immediately if env variables are not set
export const ENV = {
    PUBLIC_SUPABASE_ANON_KEY: getEnvironmentVariable("PUBLIC_SUPABASE_ANON_KEY"),
    PUBLIC_SUPABASE_URL: getEnvironmentVariable("PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: getEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY"),
    SUPABASE_DB_URL: getEnvironmentVariable("SUPABASE_DB_URL"),
}
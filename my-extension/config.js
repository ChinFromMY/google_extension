//configuration file for API keys and constants
//dont commit this file to version control
//add config.js to .gitignore


const CONFIG = {
    //supabase public key is sage for client-side (it is public)
    SUPABASE_URL: "https://soaffzwvtqlhnotthlqu.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYWZmend2dHFsaG5vdHRobHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjY3MTUsImV4cCI6MjA3NTU0MjcxNX0.Nyn13z_UcUAMx96NKBmHKWpdxyBOSQAZAk-yH3Kx2AQ"
};

//supabase anon public key is SAFE to expose because:
// 1. It's read-only by default
// 2. Row Level Security (RLS) policies protect your data
// 3. Supabase rate limits prevent abuse
// 4. It's designed to be public

//but OPENAI API KEY is not included here
//it is handled securely by supabase edge function instead
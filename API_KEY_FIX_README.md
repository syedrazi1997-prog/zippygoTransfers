# PayFlow API Key Generation Fix

The error shown in the browser is caused by two overloaded PostgreSQL functions named
`create_api_key`. PostgREST cannot choose between them when the frontend supplies the
three named arguments.

Run `supabase/migrations/20260809140000_fix_create_api_key_overload.sql` in the Supabase
SQL Editor. It removes both overloads and creates exactly one three-argument function.

Then redeploy PayFlow.

Environment:
VITE_SUPABASE_URL=https://lxbvechmapkaedahbwlv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SB_PUBLISHABLE_KEY

The frontend also supports the legacy VITE_SUPABASE_ANON_KEY variable.

Do not put a Supabase secret/service-role key in the frontend.

Test:
Settings -> API Keys -> Create API Key -> name -> Test/Live -> Generate.

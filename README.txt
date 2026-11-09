movies.net - upload this whole folder (not the zip) to a static host.

Cloudflare Pages: Workers & Pages > Create > Pages > Upload assets > drag this folder > Deploy.
Then Custom domains > add your domain.

After you have the domain, in Supabase: Authentication > URL Configuration
  Site URL = https://your-domain
  Redirect URLs = https://your-domain/**

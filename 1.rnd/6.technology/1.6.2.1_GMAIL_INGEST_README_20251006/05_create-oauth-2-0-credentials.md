#### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Desktop app**
   - Name: "Gmail Ingestion Pipeline"
   - Click "Create"
5. Download JSON credentials
6. Save as:
   - `gmail_credentials_jessen.json` for <jesseniesen@gmail.com>
   - `gmail_credentials_high.json` for <high@reggieanddro.com>

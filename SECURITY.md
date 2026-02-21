# Security Policy

## 🔐 Security Best Practices

### API Key Management

**CRITICAL: Never commit your `.env.local` file to version control!**

1. **Get an API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the `.env.example` to `.env.local`
   - Replace the placeholder with your actual key

2. **API Key Restrictions:**
   - Set HTTP referrer restrictions in Google Cloud Console
   - Limit the API key to only Gemini API access
   - Regularly rotate your API keys
   - Monitor usage in the Google Cloud Console

### Known Limitations

⚠️ **Client-Side API Key Exposure:**
- This app stores the API key in browser localStorage
- Users can inspect the code and extract the key
- **For production:** Implement a backend proxy to hide the API key

### Recommended Production Architecture

```
User Browser → Your Backend API → Google Gemini API
              (with auth)        (key hidden)
```

### Security Features Implemented

✅ PDF file validation (type and size)
✅ Input sanitization via ReactMarkdown
✅ No SQL injection risk (no database)
✅ HTTPS recommended for deployment
✅ Environment variable management

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainer directly instead of creating a public issue.

### Security Checklist Before Deployment

- [ ] API key stored in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] API key restrictions set in Google Cloud Console
- [ ] HTTPS enabled on hosting platform
- [ ] Regular dependency updates (`npm audit fix`)
- [ ] Content Security Policy headers configured
- [ ] Rate limiting enabled (if using backend)

### Security Dependencies

Run regular security audits:
```bash
npm audit
npm audit fix
```

Update dependencies regularly:
```bash
npm update
npm outdated
```

## 🚨 If Your API Key Was Exposed

1. **Immediately revoke** the exposed key at https://console.cloud.google.com/apis/credentials
2. Generate a new API key
3. Add restrictions to the new key
4. Update your `.env.local` file
5. If pushed to GitHub, consider the key permanently compromised
6. Check your API usage for any unauthorized activity

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [React Security Best Practices](https://react.dev/learn/security)

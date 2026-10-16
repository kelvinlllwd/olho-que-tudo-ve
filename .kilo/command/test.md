# Run Tests

There are no automated tests configured for this project. Manual verification is done via curl:

## API Tests

```
# Login and get auth cookie
echo {"email":"demo@olho.com","password":"demo123"} > login.json
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d @login.json

# Test all pages
curl -b cookies.txt -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard
curl -b cookies.txt -o /dev/null -w "%{http_code}" http://localhost:3000/accounts
curl -b cookies.txt -o /dev/null -w "%{http_code}" http://localhost:3000/analytics
curl -b cookies.txt -o /dev/null -w "%{http_code}" http://localhost:3000/calendar
curl -b cookies.txt -o /dev/null -w "%{http_code}" http://localhost:3000/settings

# Test API endpoints
curl -b cookies.txt http://localhost:3000/api/accounts
curl -b cookies.txt "http://localhost:3000/api/metrics?days=30"
curl -b cookies.txt http://localhost:3000/api/analytics
curl -b cookies.txt http://localhost:3000/api/posts
curl -b cookies.txt http://localhost:3000/api/daily-activity
curl -b cookies.txt http://localhost:3000/api/ip
```

## Seeding

```
curl http://localhost:3000/api/seed
```
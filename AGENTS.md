#!/usr/bin/env node

# AGENTS.md - Instructions for AI agents working on this project

## Live URL
https://olho-publico.loca.lt

## Commands

### Run dev server
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
cd C:\Users\kelvi\AppData\Local\Temp\kilo\olho-build
npm run dev
```

### Run Prisma studio
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
npx prisma studio
```

### Generate Prisma client
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
npx prisma generate
```

### Push database schema
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
npx prisma db push
```

### Seed database
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
curl http://localhost:3000/api/seed
```

### Login to get auth cookie
```bash
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
echo {"email":"demo@olho.com","password":"demo123"} > /tmp/login.json && curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d @/tmp/login.json
```

## Node.js Path
Always prepend `C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64` to PATH before running npm/node commands.

## Port
Default port: 3000
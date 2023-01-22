## Cerebro-api

Express backend for cerebro project.

## Installation

```cmd
yarn install
```

### .env
Root `.env` file is for prisma and connection string.

`env/.env.development` is for all else env variables.

`env/.env.production` is for prod.

## Development

Pull and run docker sql image with command
```cmd
yarn db:dev
yarn start:dev
```

## Database changes

After making changes to schema file:
```bash
prisma migrate dev
```

When db is empty: (creates bare necessities)
```bash
prisma db seed
```

other usefull:

```bash
prisma validate
```
```bash
prisma format
```

## Helper Powershell commands
```powershell
Get-ChildItem I:\dir -Recurse -Include *.mp4, *.webm | measure -Property Length -sum
```

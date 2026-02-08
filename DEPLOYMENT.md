# 🚀 DEPLOYMENT GUIDE - ResultMA

## 📋 Pre-Deployment Checklist

### ✅ Code Cleanup
- [x] Remove all debug console.log statements
- [x] Remove emoji logs from production code
- [x] Optimize imports and remove unused code
- [x] Check for any hardcoded credentials

### ✅ Environment Configuration
- [ ] Set up production environment variables
- [ ] Configure MongoDB connection string
- [ ] Set JWT_SECRET to a strong random value
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production

### ✅ Database
- [ ] Create production MongoDB database
- [ ] Run database indexes: `npm run create-indexes`
- [ ] Create admin user: `npm run create-admin`
- [ ] Initialize roles: `npm run init-roles`

### ✅ Security
- [ ] Enable HTTPS/SSL
- [ ] Configure rate limiting
- [ ] Set secure cookie options
- [ ] Review CORS settings
- [ ] Enable helmet middleware

---

## 🔧 Environment Variables

### Server (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://your-production-db-url/resultma

# Security
JWT_SECRET=your-very-strong-random-secret-key-here

# File Upload
UPLOAD_DIR=uploads

# Logging
LOG_LEVEL=ERROR

# Groq API (for AI test parsing)
GROQ_API_KEY=your-groq-api-key

# Redis (optional, for caching)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# Cache
NODE_CACHE_ENABLED=true
```

### Client (.env)
```bash
VITE_API_URL=https://your-api-domain.com/api
```

---

## 📦 Build Process

### 1. Install Dependencies
```bash
# Root
npm install

# Install all workspaces
npm run install:all

# Python dependencies (for OMR)
npm run setup:python
```

### 2. Build Client
```bash
cd client
npm run build
# Output: client/dist/
```

### 3. Build Server
```bash
cd server
npm run build
# Output: server/dist/
```

---

## 🌐 Deployment Options

### Option 1: VPS (Ubuntu/Debian)

#### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Install MongoDB
```bash
# Follow official MongoDB installation guide
# https://www.mongodb.com/docs/manual/installation/
```

#### 3. Install Python & Dependencies
```bash
sudo apt-get install python3 python3-pip
cd server/python
pip3 install -r requirements.txt
```

#### 4. Install PM2
```bash
sudo npm install -g pm2
```

#### 5. Deploy Application
```bash
# Clone repository
git clone your-repo-url
cd resultMA

# Install dependencies
npm run install:all

# Build
cd client && npm run build
cd ../server && npm run build

# Setup environment
cp server/.env.example server/.env
# Edit server/.env with production values

# Initialize database
cd server
npm run create-indexes
npm run create-admin
npm run init-roles

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 6. Setup Nginx
```bash
sudo apt-get install nginx

# Copy nginx.conf to /etc/nginx/sites-available/resultma
sudo cp nginx.conf /etc/nginx/sites-available/resultma
sudo ln -s /etc/nginx/sites-available/resultma /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Setup SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: Docker

#### 1. Create Dockerfile (Server)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install
RUN cd server && npm install

COPY . .

RUN cd server && npm run build

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=resultma

  server:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/resultma
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    volumes:
      - ./server/uploads:/app/server/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./client/dist:/usr/share/nginx/html
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - server

volumes:
  mongodb_data:
```

#### 3. Deploy
```bash
docker-compose up -d
```

---

### Option 3: Cloud Platforms

#### Vercel (Client only)
```bash
cd client
vercel --prod
```

#### Railway / Render (Full Stack)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

---

## 🔍 Post-Deployment Checks

### 1. Health Checks
```bash
# API Health
curl https://your-domain.com/api/health

# Database Connection
curl https://your-domain.com/api/health/db
```

### 2. Test Core Features
- [ ] User login
- [ ] Test import
- [ ] Block test creation
- [ ] Student management
- [ ] OMR scanning
- [ ] Report generation

### 3. Monitor Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 4. Performance
- [ ] Check page load times
- [ ] Test API response times
- [ ] Monitor memory usage
- [ ] Check database query performance

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm run install:all

# Build
cd client && npm run build
cd ../server && npm run build

# Restart
pm2 restart all
```

### Database Backup
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/resultma" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/resultma" /backup/20250208
```

### Monitor with PM2
```bash
pm2 status
pm2 monit
pm2 logs
```

---

## 🚨 Troubleshooting

### Server won't start
1. Check environment variables
2. Verify MongoDB connection
3. Check port availability
4. Review logs: `pm2 logs`

### Client build fails
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check TypeScript errors: `npm run build`
3. Verify environment variables

### Database connection issues
1. Check MongoDB is running: `sudo systemctl status mongod`
2. Verify connection string in .env
3. Check firewall rules
4. Test connection: `mongosh "your-connection-string"`

### High memory usage
1. Check for memory leaks in logs
2. Restart PM2: `pm2 restart all`
3. Increase server resources
4. Enable caching: `NODE_CACHE_ENABLED=true`

---

## 📊 Monitoring

### Setup Monitoring Tools
- PM2 Plus: https://pm2.io/
- MongoDB Atlas Monitoring
- Nginx access logs
- Application logs

### Key Metrics to Monitor
- API response times
- Database query performance
- Memory usage
- CPU usage
- Error rates
- User activity

---

## 🔐 Security Best Practices

1. **Never commit .env files**
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable HTTPS** everywhere
4. **Regular security updates**: `npm audit fix`
5. **Backup database** regularly
6. **Monitor logs** for suspicious activity
7. **Rate limiting** on API endpoints
8. **Input validation** on all forms
9. **CORS** properly configured
10. **File upload** size limits

---

## 📞 Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact development team

---

**Last Updated:** 2025-02-08
**Version:** 1.0.0

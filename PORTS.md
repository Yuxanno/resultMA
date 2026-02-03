# 🔌 Port Configuration - MathAcademy

## Port Allocation

| Service | Port | Description | Access |
|---------|------|-------------|--------|
| **Backend API** | 9999 | Node.js/Express server | Internal (localhost) |
| **Frontend** | 9998 | React static files (optional) | Internal (localhost) |
| **HTTP** | 80 | Nginx HTTP (redirects to HTTPS) | Public |
| **HTTPS** | 443 | Nginx HTTPS (main entry) | Public |
| **MongoDB** | 27017 | Database | Internal (localhost) |
| **Redis** | 6379 | Cache (optional) | Internal (localhost) |

## Architecture

```
Internet (Port 443/80)
         ↓
    Nginx (Reverse Proxy)
         ↓
    ┌────────────────┐
    │                │
    ↓                ↓
Backend (9999)   Frontend (9998)
    ↓                ↓
MongoDB (27017)  Static Files
```

## URL Structure

- **Main Website:** `https://mathacademy.biznesjon.uz`
- **API Endpoint:** `https://mathacademy.biznesjon.uz/api`
- **Uploads:** `https://mathacademy.biznesjon.uz/uploads`
- **Health Check:** `https://mathacademy.biznesjon.uz/health`

## Internal Access

### Backend API (Port 9999)
```bash
# Health check
curl http://localhost:9999/api/health

# Test endpoint
curl http://localhost:9999/api/test
```

### Frontend (Port 9998) - Optional
```bash
# If serving frontend separately
curl http://localhost:9998/health
```

## Firewall Rules

### Required Open Ports (Public)
```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (for management)
```

### Internal Ports (No firewall rules needed)
- 9999 (Backend) - Only accessible via localhost
- 9998 (Frontend) - Only accessible via localhost
- 27017 (MongoDB) - Only accessible via localhost
- 6379 (Redis) - Only accessible via localhost

## Port Conflicts

### Check if ports are available
```bash
# Check backend port
sudo lsof -i :9999

# Check frontend port
sudo lsof -i :9998

# Check all listening ports
sudo netstat -tuln | grep LISTEN
```

### Kill process on port (if needed)
```bash
# Find process
sudo lsof -i :9999

# Kill process
sudo kill -9 <PID>
```

## Configuration Files

### Backend Port (ecosystem.config.js)
```javascript
env: {
  PORT: 9999
}
```

### Backend Port (.env)
```env
PORT=9999
```

### Nginx Proxy (nginx.conf)
```nginx
# API proxy
location /api {
    proxy_pass http://localhost:9999;
}
```

## Testing Ports

### After Deployment
```bash
# Test backend
curl http://localhost:9999/api/health

# Test through Nginx
curl https://mathacademy.biznesjon.uz/api/health

# Check listening ports
sudo netstat -tuln | grep -E ':(9999|9998|80|443)'
```

## Troubleshooting

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :9999

# Kill the process
sudo kill -9 <PID>

# Or restart PM2
pm2 restart mathacademy-server
```

### Cannot bind to port
```bash
# Check if port is privileged (<1024)
# Ports 9999 and 9998 are not privileged

# Check permissions
ls -la /var/www/mathacademy

# Check PM2 logs
pm2 logs mathacademy-server
```

### Nginx cannot connect to backend
```bash
# Check if backend is running
pm2 status

# Check if port is listening
sudo netstat -tuln | grep 9999

# Check Nginx error logs
sudo tail -f /var/log/nginx/mathacademy-error.log
```

## Security Notes

1. **Backend (9999)** - Not exposed to internet, only accessible via Nginx proxy
2. **Frontend (9998)** - Optional, can serve directly from Nginx
3. **MongoDB (27017)** - Only accessible from localhost
4. **Redis (6379)** - Only accessible from localhost

## Port Changes

If you need to change ports:

1. Update `ecosystem.config.js`
2. Update `server/.env.production`
3. Update `nginx.conf`
4. Update `deploy.sh`
5. Restart services:
   ```bash
   pm2 restart mathacademy-server
   sudo systemctl reload nginx
   ```

---

**Note:** Ports 9999 and 9998 are chosen to avoid conflicts with other common services and are high enough to not require root privileges.

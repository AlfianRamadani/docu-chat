# MongoDB Connection Troubleshooting Guide

## Current Issue
Your MongoDB connection is failing with an SSL/TLS error. This is a common issue with MongoDB Atlas connections.

## Error Details
```
SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

## Troubleshooting Steps

### 1. Check MongoDB Atlas Network Access
1. Log into your MongoDB Atlas dashboard
2. Go to "Network Access" in the left sidebar
3. Ensure your current IP address is whitelisted
4. If not sure, temporarily add `0.0.0.0/0` (allow all IPs) for testing
5. Save and wait 2-3 minutes for changes to propagate

### 2. Verify Database User Permissions
1. Go to "Database Access" in MongoDB Atlas
2. Ensure user `alfianr792` exists and has proper permissions
3. User should have at least "readWrite" access to the `docu-chat` database
4. If needed, create a new user with proper permissions

### 3. Test Connection from Different Network
The SSL/TLS error often indicates network-level blocking:
- Try connecting from a different WiFi network
- Use mobile hotspot to test
- Try from a different computer/location

### 4. Alternative Connection Methods

#### Option A: Use Standard Connection String
Replace your current MONGODB_URI with:
```
mongodb://alfianr792:Alfian103.@cluster0-shard-00-00.wjfdvx2.mongodb.net:27017,cluster0-shard-00-01.wjfdvx2.mongodb.net:27017,cluster0-shard-00-02.wjfdvx2.mongodb.net:27017/docu-chat?ssl=true&replicaSet=atlas-abc123-shard-0&authSource=admin&retryWrites=true&w=majority
```

#### Option B: Disable SSL for Testing (NOT recommended for production)
```
mongodb+srv://alfianr792:Alfian103.@cluster0.wjfdvx2.mongodb.net/docu-chat?retryWrites=true&w=majority&ssl=false
```

### 5. Check Firewall Settings
- Ensure your firewall allows outbound connections on port 27017
- Check if your ISP blocks MongoDB connections
- Try disabling firewall temporarily for testing

### 6. Use MongoDB Compass for Testing
1. Download MongoDB Compass (official GUI tool)
2. Try connecting with the same connection string
3. If Compass works, the issue is in the Node.js driver configuration

## Current Configuration Status

### Environment Variables ✅
- MONGODB_URI is properly set
- Connection string format is correct

### Application Setup ✅
- MongoDB service is properly configured
- Chat persistence is implemented
- Health check endpoints are available

### Health Check Endpoints
Once the connection is working, you can monitor services at:
- http://localhost:3000/api/health - All services status
- http://localhost:3000/api/health/mongodb - MongoDB specific status

## Next Steps
1. Try the MongoDB Atlas network access fix first
2. Test with a different network if possible
3. If still failing, we can implement a fallback local MongoDB setup for development
4. Once connected, all chat functionality will work automatically

## Contact MongoDB Support
If none of these steps work, the issue might be:
- MongoDB Atlas cluster configuration
- Regional network restrictions
- ISP-level blocking

You can contact MongoDB Atlas support with this error code for assistance.
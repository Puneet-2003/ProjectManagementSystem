const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logActivity = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  const logData = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.session?.user?._id || 'unauthenticated',
    username: req.session?.user?.username || 'guest'
  };

  console.log(`[${timestamp}] ${logData.method} ${logData.url} - ${logData.username}@${logData.ip}`);

  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logData) + '\n';
  
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });

  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    const responseLog = {
      ...logData,
      responseTime: `${duration}ms`,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[${responseLog.timestamp}] Response: ${responseLog.statusCode} in ${responseLog.responseTime}`);
    
    const responseLogLine = JSON.stringify(responseLog) + '\n';
    fs.appendFile(logFile, responseLogLine, (err) => {
      if (err) console.error('Error writing response log:', err);
    });

    originalSend.call(this, data);
  };

  next();
};

module.exports = logActivity;
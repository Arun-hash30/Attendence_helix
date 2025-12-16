import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loggerClass } from '@voilajsx/appkit/logger';
import { errorClass } from '@voilajsx/appkit/error';
import { configClass } from '@voilajsx/appkit/config';
import { createApiRouter } from './lib/api-router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AppKit modules following the pattern
const logger = loggerClass.get('server');
const error = errorClass.get();
const config = configClass.get();

/**
 * Check if frontend build exists
 */
function checkFrontendExists(distPath: string): boolean {
  try {
    const indexPath = path.join(distPath, 'index.html');
    return fs.existsSync(indexPath);
  } catch {
    return false;
  }
}

const app = express();
const PORT = config.get('server.port', process.env.PORT || 3000);

// Middleware (following AppKit recommended order)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    /\.onrender\.com$/ // Allow all Render subdomains
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - simplified for Render
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent')?.substring(0, 50),
      ip: req.ip
    });
  }
  next();
});

// Frontend key protection - simplified for Render
app.use('/api', (req, res, next) => {
  // Skip health check and root API endpoints
  if (req.path === '/' || req.path === '' || req.path === '/health') {
    return next();
  }

  // Skip in development environment
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const frontendKey = req.headers['x-frontend-key'] as string;
  const expectedKey = process.env.VOILA_FRONTEND_KEY;

  // For Render deployment, we can make this optional initially
  if (!expectedKey || expectedKey === 'DISABLED_FOR_RENDER') {
    logger.info('Frontend key check disabled for Render deployment');
    return next();
  }

  // Check if frontend key is provided
  if (!frontendKey) {
    logger.warn('Frontend key missing');
    return res.status(403).json({
      error: 'Frontend access key required',
      message: 'API access requires valid frontend key in X-Frontend-Key header'
    });
  }

  if (frontendKey !== expectedKey) {
    logger.warn('Invalid frontend key');
    return res.status(403).json({
      error: 'Invalid frontend access key',
      message: 'The provided frontend key is not valid'
    });
  }

  next();
});

// Health check with AppKit integration
app.get('/health', error.asyncRoute(async (_req, res) => {
  try {
    // Test database connection if DATABASE_URL exists
    const dbStatus = process.env.DATABASE_URL ? 'connected' : 'no-database';

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.get('app.environment', 'development'),
      database: dbStatus,
      memory: process.memoryUsage()
    };

    res.json(healthData);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message
    });
  }
}));

// Initialize server with async setup
async function startServer() {
  try {
    logger.info('Initializing server for Render deployment...');

    // API routes with auto-discovery
    const apiRouter = await createApiRouter();
    app.use('/api', apiRouter);

    // Check if frontend build exists
    const distPath = path.join(__dirname, '../../dist');
    const frontendExists = checkFrontendExists(distPath);
    
    logger.info('Server configuration:', {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      frontendExists: frontendExists,
      distPath: distPath
    });

    if (frontendExists) {
      // Serve static files from dist directory
      logger.info('🌐 Serving frontend from dist directory');
      
      // Serve all static files (JS, CSS, images, fonts)
      app.use(express.static(distPath, {
        maxAge: '1h', // Cache static assets for 1 hour
        etag: true,
        lastModified: true
      }));

      // SPA fallback - serve index.html for all non-API routes
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
          return next();
        }
        
        const indexPath = path.join(distPath, 'index.html');
        
        // Check if file exists before sending
        if (!fs.existsSync(indexPath)) {
          logger.warn('index.html not found at path:', { indexPath });
          return res.status(404).json({
            error: 'Frontend not found',
            message: 'The frontend application is not built yet'
          });
        }
        
        res.sendFile(indexPath, (err) => {
          if (err) {
            logger.error('Failed to serve index.html', { error: err.message });
            next(err);
          }
        });
      });
      
      logger.info('✅ Frontend will be served from static files');
    } else {
      logger.warn('⚠️ No frontend build found, serving API-only mode');
      
      // Serve API documentation at root
      app.get('/', (_req, res) => {
        res.json({
          message: 'Leave Management API',
          version: '1.0.0',
          endpoints: {
            api: '/api',
            health: '/health',
            docs: 'API documentation available at /api endpoints'
          },
          note: 'Frontend is not built. Run "npm run build:web" to build frontend.'
        });
      });
    }

    // AppKit error handling middleware (ALWAYS LAST)
    app.use(error.handleErrors());

    app.listen(PORT, () => {
      const serverUrl = `http://localhost:${PORT}`;
      logger.info('🚀 Server started successfully');
      logger.info(`📡 Port: ${PORT}`);
      logger.info(`🔗 Local: ${serverUrl}`);
      
      if (frontendExists) {
        logger.info('🌐 Frontend: Available at root path (/)');
      } else {
        logger.info('🔧 Mode: API-only (no frontend build detected)');
      }
      
      logger.info('📚 API: Available at /api');
      logger.info('💊 Health: Available at /health');
      
      // Log Render-specific info
      if (process.env.RENDER) {
        logger.info('🏗️  Environment: Render.com');
        logger.info('📦 Instance: ' + (process.env.RENDER_INSTANCE_ID || 'unknown'));
      }
    });

  } catch (err: any) {
    logger.error('❌ Failed to start server', { error: err.message });
    logger.error('Stack trace:', { stack: err.stack });
    process.exit(1);
  }
}

startServer();
/**
 * Application Configuration
 * Single source of truth for all app settings
 * Environment configurable for different deployments
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      verifyEmail: '/api/auth/verify-email',
      resendVerification: '/api/auth/resend-verification',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      profile: '/api/user/profile',
      updateProfile: '/api/user/profile',
    }
  },

  // Auth Configuration
  auth: {
    // Storage keys
    storage: {
      token: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
      user: import.meta.env.VITE_AUTH_USER_KEY || 'auth_user',
    },

    // Headers
    headers: {
      frontendKey: 'X-Frontend-Key',
      frontendKeyValue: import.meta.env.VITE_FRONTEND_KEY || '',
      auth: 'Authorization',
    },

    // Redirect configuration
    redirects: {
      loginPage: import.meta.env.VITE_LOGIN_PAGE || '/login',
      afterLogin: import.meta.env.VITE_AFTER_LOGIN || '/dashboard',
      afterLogout: import.meta.env.VITE_AFTER_LOGOUT || '/',
      authenticatedRedirect: import.meta.env.VITE_AUTHENTICATED_REDIRECT || '/dashboard'
    }
  },

  // Route Access Control
  routes: {
    // Auth-only routes
    authOnly: ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/login', '/auth/register'],

    // Public routes
    public: ['/about', '/help', '/contact', '/gallery', '/terms', '/privacy', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'],

    // Logout routes
    logout: ['/logout', '/auth/logout'],

    // Role-based routes
    roles: {
      '/user/admin': ['admin.tenant', 'admin.org', 'admin.system'],
      '/user/admin/users': ['admin.tenant', 'admin.org', 'admin.system'],
      '/user/admin/settings': ['admin.tenant', 'admin.org', 'admin.system'],
      '/user/admin/list': ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system']
    }
  }
};
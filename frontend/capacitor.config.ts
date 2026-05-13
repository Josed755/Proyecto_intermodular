import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cafesapp',
  appName: 'CafES App',
  webDir: 'build',
  server: {
    allowNavigation: ['js.stripe.com', 'm.stripe.network', 'hooks.stripe.com']
  }
};

export default config;

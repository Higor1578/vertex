import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vertex.app',
  appName: 'VERTEX',
  webDir: 'dist',
  plugins: { LocalNotifications: { iconColor: '#0f766e' } }
};

export default config;

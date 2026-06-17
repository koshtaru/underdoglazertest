import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // listen on 0.0.0.0 so external hosts can reach dev server
    port: 5173,          // keep your usual port (optional)
    allowedHosts: [
      'crawfordigital.com',  // your root domain
      '.crawfordigital.com'  // any sub-domain (e.g. www.crawfordigital.com)
    ]
    // If you ever need to disable the check entirely:
    // allowedHosts: true
  }
});

import { defineConfig } from 'jsrepo';

export default defineConfig({
  registries: [
    "github:davidhdev/react-bits"
  ],
  paths: {
    "**/*": "./src/components/ui"
  },
});
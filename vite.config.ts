import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        articles: "articles.html",
        internalChangeExternalChange: "articles/internal-change-external-change.html",
        modernSocialSyndrome: "articles/modern-social-syndrome.html",
        partyPoliticsLowDimensionalFunction: "articles/party-politics-low-dimensional-function.html",
        proceduralAccountabilityOrganizedPower: "articles/procedural-accountability-organized-power.html",
        trappedByProcess: "articles/trapped-by-process.html",
      },
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});

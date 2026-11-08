import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   images: {
    remotePatterns: [
	
	   //freeimage.host => copy the Direct links/Image URL by clicking the image : https://iili.io/nrivWJ9.jpg 
      //don't copy the Image address by right click : https://iili.io/nrivWJ9.md.jpg)
      {
        protocol: "https",
        hostname: "iili.io",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // https://i.ibb.co.com/mCp4Bz2c/image4.png
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
        pathname: "/**",
      },

    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

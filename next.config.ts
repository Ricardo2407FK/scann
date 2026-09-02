import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'pdf2json',
    'mammoth',
    'natural',
    'jsdom',
    'cheerio',
    'axios',
    '@mozilla/readability',
  ],
  allowedDevOrigins: ['[::1]'],
};

export default nextConfig;

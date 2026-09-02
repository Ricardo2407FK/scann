import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf2json', 'mammoth'],
  allowedDevOrigins: ['[::1]'],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "server.copdcalendar.com",
        pathname: "/download/media/**",
      },
    ],
  },
  serverExternalPackages: ["jspdf", "fflate"],
};

export default nextConfig;

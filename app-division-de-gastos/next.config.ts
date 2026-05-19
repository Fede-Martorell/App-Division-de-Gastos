import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/groups/create',
        destination: '/dashboard/groups/create',
        permanent: true,
      },
      {
        source: '/groups/:id',
        destination: '/dashboard/groups/:id',
        permanent: true,
      },
      {
        source: '/groups/:id/expense/create',
        destination: '/dashboard/groups/:id/expense/create',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

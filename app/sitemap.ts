import { MetadataRoute } from 'next';
import { services, industries, locations } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://elsxglobal.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Service pages
  Object.values(services).forEach((service) => {
    routes.push({
      url: `${baseUrl}${service.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  // Industry pages
  Object.values(industries).forEach((industry) => {
    routes.push({
      url: `${baseUrl}${industry.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // Location pages
  Object.values(locations).forEach((location) => {
    routes.push({
      url: `${baseUrl}${location.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // VaultHost specific pages
  const vaultHostRoutes = [
    '/vaulthost/pricing',
    '/vaulthost/shared',
    '/vaulthost/vps',
    '/vaulthost/cloud',
    '/vaulthost/dedicated',
    '/vaulthost/wordpress',
  ];

  vaultHostRoutes.forEach((route) => {
    routes.push({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route.includes('pricing') ? 'daily' : 'weekly',
      priority: route.includes('pricing') ? 0.8 : 0.9,
    });
  });

  return routes;
}

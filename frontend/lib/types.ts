export interface Service {
  id: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  price: string; // Decimal Prisma → string en JSON
}

export interface Project {
  id: string;
  title: string;
  summary: string | null;
  year: number | null;
  images: { image: { imageUrl: string; altText: string | null } }[];
  services: { service: { title: string } }[];
}

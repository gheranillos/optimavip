import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { UserRole } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ZONES: { name: string; region: string }[] = [
  { name: "Lechería", region: "Anzoátegui" },
  { name: "El Tigre", region: "Anzoátegui" },
  { name: "Barcelona", region: "Anzoátegui" },
  { name: "Puerto La Cruz", region: "Anzoátegui" },
];

const AMENITIES: { name: string; icon?: string }[] = [
  { name: "Cámaras de seguridad", icon: "cctv" },
  { name: "Aire acondicionado", icon: "air-vent" },
  { name: "Maletero", icon: "package" },
  { name: "Áreas sociales", icon: "users" },
  { name: "Acceso a playa", icon: "waves" },
  { name: "Ascensor", icon: "arrow-up-down" },
  { name: "Caney", icon: "tent" },
  { name: "Cerco eléctrico", icon: "zap" },
  { name: "Jacuzzi", icon: "bath" },
  { name: "Gimnasio", icon: "dumbbell" },
  { name: "Planta eléctrica", icon: "battery-charging" },
  { name: "Vigilancia", icon: "shield" },
  { name: "Salón de fiestas", icon: "party-popper" },
  { name: "Tanque de agua", icon: "droplet" },
  { name: "Servicios generales", icon: "wrench" },
];

async function main() {
  console.log("Seeding zones...");
  for (const zone of ZONES) {
    const slug = slugify(zone.name);
    await prisma.zone.upsert({
      where: { slug },
      update: { name: zone.name, region: zone.region },
      create: { name: zone.name, slug, region: zone.region },
    });
  }

  console.log("Seeding amenities...");
  for (const amenity of AMENITIES) {
    const slug = slugify(amenity.name);
    await prisma.amenity.upsert({
      where: { slug },
      update: { name: amenity.name, icon: amenity.icon },
      create: { name: amenity.name, slug, icon: amenity.icon },
    });
  }

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@optimavip.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrador OPTIMA VIP";

  if (adminPassword) {
    console.log(`Seeding developer user (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: UserRole.DEVELOPER,
        realtorStatus: null,
        isActive: true,
      },
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: UserRole.DEVELOPER,
        isActive: true,
      },
    });
  } else {
    console.warn("SEED_ADMIN_PASSWORD not set — skipping developer creation.");
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

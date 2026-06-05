import { prisma } from '../models/client.js';

async function main() {

    console.log('🌱 Début du seeding...');

    // ── 1. Nettoyage (ordre inverse des dépendances) ──
    await prisma.projectImage.deleteMany();
    await prisma.projectService.deleteMany();
    await prisma.requestService.deleteMany();
    await prisma.message.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.image.deleteMany();
    await prisma.service.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Tables nettoyées');

    // ── 2. Admin ──────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            email: 'deborah@qualisite.fr',
            passwordHash: 'placeholder_a_remplacer_sprint2',
            role: 'ADMIN',
        },
    });

    console.log('👤 Admin créé');

    // ── 3. Services ───────────────────────────────────
    const service1 = await prisma.service.create({
        data: {
            title: 'Site Vitrine',
            description: 'Un site professionnel pour présenter votre activité et attirer de nouveaux clients.',
            price: 1200,
            order: 1,
        },
    });

    const service2 = await prisma.service.create({
        data: {
            title: 'Site E-commerce',
            description: 'Une boutique en ligne complète pour vendre vos produits 24h/24.',
            price: 2500,
            order: 2,
        },
    });

    const service3 = await prisma.service.create({
        data: {
            title: 'Application Web',
            description: 'Une application web sur mesure adaptée à vos besoins métier.',
            price: 4000,
            order: 3,
        },
    });

    console.log('🛠️ Services créés');

    // ── 4. Images ─────────────────────────────────────
    const image1 = await prisma.image.create({
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
            altText: 'Site vitrine moderne',
        },
    });

    const image2 = await prisma.image.create({
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
            altText: 'Boutique e-commerce',
        },
    });

    console.log('🖼️ Images créées');

    // ── 5. Projets ────────────────────────────────────
    const project1 = await prisma.project.create({
        data: {
            createdBy: admin.id,
            title: 'Boulangerie Artisanale Martin',
            summary: 'Refonte complète du site vitrine avec prise de commande en ligne.',
            year: 2025,
            isPublished: true,
        },
    });

    const project2 = await prisma.project.create({
        data: {
            createdBy: admin.id,
            title: 'Cabinet Vétérinaire Dupont',
            summary: 'Site vitrine avec prise de rendez-vous intégrée.',
            year: 2026,
            isPublished: true,
        },
    });

    console.log('📁 Projets créés');

    // ── 6. Liaisons projets ↔ images ──────────────────
    await prisma.projectImage.create({
        data: {
            projectId: project1.id,
            imageId: image1.id,
            isCover: true,
            order: 1,
        },
    });

    await prisma.projectImage.create({
        data: {
            projectId: project2.id,
            imageId: image2.id,
            isCover: true,
            order: 1,
        },
    });

    // ── 7. Liaisons projets ↔ services ────────────────
    await prisma.projectService.create({
        data: { projectId: project1.id, serviceId: service1.id },
    });

    await prisma.projectService.create({
        data: { projectId: project2.id, serviceId: service1.id },
    });

    console.log('🔗 Relations créées');
    console.log('✅ Seeding terminé !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
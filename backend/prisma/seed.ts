import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoriesData = [
  { slug: "north-america", name: "US North America", flag: "🇺🇸", displayOrder: 1 },
  { slug: "europe", name: "Europe", flag: "🇪🇺", displayOrder: 2 },
  { slug: "india", name: "India", flag: "🇮🇳", displayOrder: 3 },
  { slug: "singapore", name: "Asia Pacific", flag: "🇸🇬", displayOrder: 4 },
  { slug: "japan", name: "Japan", flag: "🇯🇵", displayOrder: 5 },
  { slug: "korea", name: "Korea", flag: "🇰🇷", displayOrder: 6 },
  { slug: "middle-east", name: "Middle East", flag: "🇦🇪", displayOrder: 7 },
  { slug: "africa", name: "Africa", flag: "🇿🇦", displayOrder: 8 },
  { slug: "south-america", name: "South America", flag: "🇧🇷", displayOrder: 9 },
  { slug: "australia", name: "Australia", flag: "🇦🇺", displayOrder: 10 },
];

const regionsData = [
  {
    awsRegionCode: "us-east-1",
    name: "US East (N. Virginia)",
    regionCode: "US",
    latitude: 8,
    longitude: -97,
    categorySlug: "north-america",
    flag: "🇺🇸",
    infrastructureDescription: "One of the oldest and largest AWS regions, containing multiple massive data centers and Availability Zones.",
    services: [
      "Compute workloads",
      "Advanced AI/ML services",
      "Enterprise database platforms",
      "Global content delivery (CloudFront)"
    ],
    benefits: [
      "Sub-millisecond local latency",
      "Massive resource capacity",
      "First-tier service rollouts"
    ]
  },
  {
    awsRegionCode: "us-west-2",
    name: "US West (Oregon)",
    regionCode: "US",
    latitude: 10,
    longitude: -144,
    categorySlug: "north-america",
    flag: "🇺🇸",
    infrastructureDescription: "A major US West Coast hub powered largely by renewable energy, supporting massive scalable compute grids.",
    services: [
      "GPU Compute Clusters",
      "High-performance storage",
      "E-commerce scale computing",
      "Serverless orchestration"
    ],
    benefits: [
      "Eco-friendly energy grid",
      "Lower regional operating costs",
      "High availability on the West Coast"
    ]
  },
  {
    awsRegionCode: "ca-central-1",
    name: "Canada (Central)",
    regionCode: "CA",
    latitude: 45.4,
    longitude: -75.7,
    categorySlug: "north-america",
    flag: "🇨🇦",
    infrastructureDescription: "AWS central Canada region designed to meet strict local data sovereignty and security regulations.",
    services: [
      "Cloud hosting",
      "Secure public sector storage",
      "Data warehouse indexing"
    ],
    benefits: [
      "Canadian compliance alignment",
      "Low latency for Canadian users",
      "Robust disaster recovery options"
    ]
  },
  {
    awsRegionCode: "eu-west-1",
    name: "Europe (Ireland)",
    regionCode: "IE",
    latitude: 24,
    longitude: -20,
    categorySlug: "europe",
    flag: "🇮🇪",
    infrastructureDescription: "AWS's primary European region, providing a huge footprint of compute, storage, and networking capacity.",
    services: [
      "Core cloud computing",
      "E-commerce backends",
      "Big data pipelines",
      "Financial transaction hosting"
    ],
    benefits: [
      "GDPR residency support",
      "Ultra-low latency across Ireland/UK",
      "High density of local direct connects"
    ]
  },
  {
    awsRegionCode: "eu-central-1",
    name: "Europe (Germany)",
    regionCode: "DE",
    latitude: 18,
    longitude: -8,
    categorySlug: "europe",
    flag: "🇩🇪",
    infrastructureDescription: "Highly secure region based in Frankfurt, complying with Germany's strict federal data security regulations.",
    services: [
      "Compliant secure storage",
      "Industrial IoT backends",
      "Automotive simulation grids"
    ],
    benefits: [
      "DGSVO / GDPR conformity",
      "Central European geographic hub",
      "Extremely secure environments"
    ]
  },
  {
    awsRegionCode: "eu-south-1",
    name: "Europe (Italy)",
    regionCode: "IT",
    latitude: 45.4,
    longitude: 9.1,
    categorySlug: "europe",
    flag: "🇮🇹",
    infrastructureDescription: "Local Italian region providing highly performant resources to Southern European markets.",
    services: [
      "Microservices API hosting",
      "Disaster recovery targets",
      "Local edge processing"
    ],
    benefits: [
      "Data sovereignty for Italian enterprises",
      "Sub-10ms response times locally",
      "High availability clustering"
    ]
  },
  {
    awsRegionCode: "eu-north-1",
    name: "Europe (Sweden)",
    regionCode: "SE",
    latitude: 59.3,
    longitude: 18.0,
    categorySlug: "europe",
    flag: "🇸🇪",
    infrastructureDescription: "Nordic region designed for high efficiency and sustainability, matching local green energy initiatives.",
    services: [
      "High-efficiency compute",
      "Real-time streaming backends",
      "Analytics platforms"
    ],
    benefits: [
      "Low carbon footprint operations",
      "Fast access for Baltic and Nordic users",
      "Strong compliance standards"
    ]
  },
  {
    awsRegionCode: "ap-south-1",
    name: "India (Mumbai)",
    regionCode: "IN",
    latitude: -6,
    longitude: 68,
    categorySlug: "india",
    flag: "🇮🇳",
    infrastructureDescription: "A key South Asian region supporting millions of digital developers, startups, and enterprise companies.",
    services: [
      "Mobile application backends",
      "E-commerce databases",
      "SaaS infrastructure scaling",
      "AdTech processing systems"
    ],
    benefits: [
      "Sovereign Indian data hosting",
      "Fast local load times",
      "Reduced routing latency"
    ]
  },
  {
    awsRegionCode: "ap-south-2",
    name: "India (Hyderabad)",
    regionCode: "IN",
    latitude: -9,
    longitude: 73,
    categorySlug: "india",
    flag: "🇮🇳",
    infrastructureDescription: "AWS's second region in India, offering redundancy, backup targets, and low latency for Central/Southern India.",
    services: [
      "Regional database replication",
      "Enterprise analytics pipelines",
      "Disaster recovery solutions"
    ],
    benefits: [
      "Intra-country disaster recovery",
      "High compliance alignment",
      "Enhanced local routing speeds"
    ]
  },
  {
    awsRegionCode: "ap-southeast-1",
    name: "Singapore",
    regionCode: "SG",
    latitude: -20.4,
    longitude: 99,
    categorySlug: "singapore",
    flag: "🇸🇬",
    infrastructureDescription: "The primary Southeast Asian hub, acting as the gateway for regional web, mobile, and SaaS delivery.",
    services: [
      "FinTech processing gateways",
      "SaaS multi-tenant clusters",
      "Dynamic content delivery"
    ],
    benefits: [
      "Gateway to ASEAN markets",
      "High density global connections",
      "Ultra-fast trans-pacific routes"
    ]
  },
  {
    awsRegionCode: "ap-southeast-2",
    name: "Sydney",
    regionCode: "AU",
    latitude: -46,
    longitude: 148,
    categorySlug: "australia",
    flag: "🇦🇺",
    infrastructureDescription: "AWS region in Australia ensuring high-speed local data residency and compliance for Oceania.",
    services: [
      "Enterprise web systems",
      "Mining and industrial analytics",
      "Media streaming backends"
    ],
    benefits: [
      "Oceania data sovereignty",
      "Sub-15ms local latency",
      "Subsea fiber connectivity"
    ]
  },
  {
    awsRegionCode: "ap-northeast-1",
    name: "Tokyo",
    regionCode: "JP",
    latitude: 7,
    longitude: 138,
    categorySlug: "japan",
    flag: "🇯🇵",
    infrastructureDescription: "One of the busiest Asian regions, running highly automated services for Japanese and East Asian consumer grids.",
    services: [
      "Gaming platform hosting",
      "Financial processing backends",
      "AI/ML model processing"
    ],
    benefits: [
      "Ultra-low latency for East Asia",
      "Massive network throughput",
      "Disaster resilient design"
    ]
  },
  {
    awsRegionCode: "ap-northeast-2",
    name: "Seoul",
    regionCode: "KR",
    latitude: 7,
    longitude: 125,
    categorySlug: "korea",
    flag: "🇰🇷",
    infrastructureDescription: "State-of-the-art data centers in South Korea supporting gaming, mobile AdTech, and e-commerce.",
    services: [
      "High-speed game backends",
      "IoT telemetry collectors",
      "E-commerce databases"
    ],
    benefits: [
      "Extremely low latency for South Korea",
      "Optimized regional fiber peering",
      "Korea ISMS certification support"
    ]
  },
  {
    awsRegionCode: "me-central-1",
    name: "UAE",
    regionCode: "AE",
    latitude: -4,
    longitude: 44.3,
    categorySlug: "middle-east",
    flag: "🇦🇪",
    infrastructureDescription: "Expanding cloud footprint in the UAE, powering smart city initiatives and public sector digital transformation.",
    services: [
      "Smart city data platforms",
      "Government portal backends",
      "Secure localized enterprise databases"
    ],
    benefits: [
      "Middle East data residency conformity",
      "Enhanced GCC routing latency",
      "Localized compliance frameworks"
    ]
  },
  {
    awsRegionCode: "af-south-1",
    name: "South Africa",
    regionCode: "ZA",
    latitude: -45,
    longitude: 18,
    categorySlug: "africa",
    flag: "🇿🇦",
    infrastructureDescription: "The primary AWS gateway for the African continent, supporting regional cloud growth.",
    services: [
      "Cloud migrations",
      "Regional web hosting",
      "Data indexing pipelines"
    ],
    benefits: [
      "Sovereign African data hosting",
      "Lower latency across Sub-Saharan regions",
      "Development support"
    ]
  },
  {
    awsRegionCode: "sa-east-1",
    name: "Brazil",
    regionCode: "BR",
    latitude: -30,
    longitude: -60,
    categorySlug: "south-america",
    flag: "🇧🇷",
    infrastructureDescription: "The key AWS region for South America, serving major enterprises, FinTechs, and government agencies.",
    services: [
      "Financial application backends",
      "Dynamic database hosting",
      "Global caching"
    ],
    benefits: [
      "Local latency reduction for South America",
      "Brazilian tax/regulatory compliance support",
      "High availability redundancy"
    ]
  }
];

const regionalSpecs: Record<string, any> = {
  "us-east-1": {
    zones: 6,
    launchYear: 2006,
    primaryLocation: "Virginia, USA",
    compliance: "FedRAMP, HIPAA, SOC, ISO",
    totalServices: "250+",
    aimlServices: "40+",
    analyticsServices: "30+",
    networkingServices: "25+",
    edgeLocations: "100+",
    directConnect: "Available",
    reach: "Global",
    latency: "Ultra-low across North America"
  },
  "us-west-2": {
    zones: 4,
    launchYear: 2011,
    primaryLocation: "Oregon, USA",
    compliance: "SOC, ISO, HIPAA",
    totalServices: "240+",
    aimlServices: "40+",
    analyticsServices: "28+",
    networkingServices: "24+",
    edgeLocations: "90+",
    directConnect: "Available",
    reach: "Americas & Asia Pacific",
    latency: "Optimized West Coast access"
  },
  "ca-central-1": {
    zones: 3,
    launchYear: 2016,
    primaryLocation: "Montreal",
    compliance: "Canadian Data Residency",
    totalServices: "200+",
    aimlServices: "25+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Canada & North America",
    latency: "Optimized for Canadian users"
  },
  "eu-west-1": {
    zones: 3,
    launchYear: 2007,
    primaryLocation: "Dublin",
    compliance: "GDPR, ISO, SOC",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "30+",
    directConnect: "Available",
    reach: "Europe & Global",
    latency: "Ultra-low across Ireland and UK"
  },
  "eu-central-1": {
    zones: 3,
    launchYear: 2014,
    primaryLocation: "Frankfurt",
    compliance: "GDPR, BSI Standards",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "35+",
    directConnect: "Available",
    reach: "Central Europe",
    latency: "Sub-15ms across major EU markets"
  },
  "eu-south-1": {
    zones: 3,
    launchYear: 2020,
    primaryLocation: "Milan",
    compliance: "GDPR",
    totalServices: "190+",
    aimlServices: "25+",
    analyticsServices: "20+",
    networkingServices: "18+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Southern Europe",
    latency: "Optimized Mediterranean connectivity"
  },
  "eu-north-1": {
    zones: 3,
    launchYear: 2018,
    primaryLocation: "Stockholm",
    compliance: "GDPR, Nordic Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "12+",
    directConnect: "Available",
    reach: "Nordic & Baltic Regions",
    latency: "Low-latency Northern Europe access"
  },
  "ap-south-1": {
    zones: 3,
    launchYear: 2016,
    primaryLocation: "Mumbai",
    compliance: "India Data Residency",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "South Asia",
    latency: "Optimized for India-wide access"
  },
  "ap-south-2": {
    zones: 3,
    launchYear: 2022,
    primaryLocation: "Hyderabad",
    compliance: "India Data Residency",
    totalServices: "200+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "Central & Southern India",
    latency: "Enhanced intra-country routing"
  },
  "ap-southeast-1": {
    zones: 3,
    launchYear: 2010,
    primaryLocation: "Singapore",
    compliance: "ASEAN Regulations",
    totalServices: "230+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "25+",
    directConnect: "Available",
    reach: "Southeast Asia",
    latency: "Regional ASEAN gateway"
  },
  "ap-southeast-2": {
    zones: 3,
    launchYear: 2012,
    primaryLocation: "Sydney",
    compliance: "Australian Government Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Australia & New Zealand",
    latency: "Low-latency Oceania access"
  },
  "ap-northeast-1": {
    zones: 4,
    launchYear: 2011,
    primaryLocation: "Tokyo",
    compliance: "Financial & Government Standards",
    totalServices: "230+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "East Asia",
    latency: "Ultra-low for Japan"
  },
  "ap-northeast-2": {
    zones: 4,
    launchYear: 2016,
    primaryLocation: "Seoul",
    compliance: "ISMS, Korean Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "10+",
    directConnect: "Available",
    reach: "South Korea",
    latency: "Extremely low for local users"
  },
  "me-central-1": {
    zones: 3,
    launchYear: 2022,
    primaryLocation: "Abu Dhabi",
    compliance: "UAE Data Regulations",
    totalServices: "180+",
    aimlServices: "20+",
    analyticsServices: "18+",
    networkingServices: "16+",
    edgeLocations: "10+",
    directConnect: "Available",
    reach: "GCC & Middle East",
    latency: "Optimized Gulf connectivity"
  },
  "af-south-1": {
    zones: 3,
    launchYear: 2020,
    primaryLocation: "Cape Town",
    compliance: "POPIA",
    totalServices: "180+",
    aimlServices: "20+",
    analyticsServices: "18+",
    networkingServices: "16+",
    edgeLocations: "8+",
    directConnect: "Available",
    reach: "African Continent",
    latency: "Reduced Sub-Saharan latency"
  },
  "sa-east-1": {
    zones: 3,
    launchYear: 2011,
    primaryLocation: "São Paulo",
    compliance: "LGPD",
    totalServices: "200+",
    aimlServices: "25+",
    analyticsServices: "20+",
    networkingServices: "18+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Latin America",
    latency: "Optimized South American performance"
  }
};

async function main() {
  console.log("Purging existing database tables...");
  await prisma.regionBenefit.deleteMany({});
  await prisma.regionService.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Seeding categories...");
  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        flag: cat.flag,
        displayOrder: cat.displayOrder,
      },
    });
    categories[cat.slug] = createdCat;
  }

  console.log("Seeding regions and nested specifications...");
  for (const r of regionsData) {
    const spec = regionalSpecs[r.awsRegionCode] || {
      zones: 3,
      launchYear: 2026,
      primaryLocation: "Unknown",
      compliance: "ISO",
      totalServices: "150+",
      aimlServices: "10+",
      analyticsServices: "10+",
      networkingServices: "10+",
      edgeLocations: "5+",
      directConnect: "Available",
      reach: "Local",
      latency: "Under evaluation"
    };

    const category = categories[r.categorySlug];
    if (!category) {
      console.warn(`Category slug '${r.categorySlug}' not found for region '${r.awsRegionCode}'. Skipping.`);
      continue;
    }

    const createdRegion = await prisma.region.create({
      data: {
        awsRegionCode: r.awsRegionCode,
        name: r.name,
        regionCode: r.regionCode,
        flag: r.flag,
        latitude: r.latitude,
        longitude: r.longitude,
        categoryId: category.id,
        infrastructureDescription: r.infrastructureDescription,
        availabilityZones: spec.zones,
        launchYear: spec.launchYear,
        primaryLocation: spec.primaryLocation,
        compliance: spec.compliance,
        totalServices: spec.totalServices,
        aimlServices: spec.aimlServices,
        analyticsServices: spec.analyticsServices,
        networkingServices: spec.networkingServices,
        edgeLocations: spec.edgeLocations,
        directConnect: spec.directConnect,
        reach: spec.reach,
        latency: spec.latency,
        createdBy: "system-seed",
        updatedBy: "system-seed",
      },
    });

    // Seed services
    for (const serviceName of r.services) {
      await prisma.regionService.create({
        data: {
          name: serviceName,
          regionId: createdRegion.id,
        },
      });
    }

    // Seed benefits
    for (const benefitDesc of r.benefits) {
      await prisma.regionBenefit.create({
        data: {
          description: benefitDesc,
          regionId: createdRegion.id,
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

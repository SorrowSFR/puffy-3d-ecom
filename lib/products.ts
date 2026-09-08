export interface Product {
  id: string;
  name: string;
  tagline: string;
  edition: string;
  price: number;
  colorHex: string;
  accentHex: string;
  modelUrl: string;
  imageUrl: string;
  badge: string;
  description: string;
  specs: {
    warmth: string;
    insulation: string;
    shell: string;
    hardware: string;
  };
  sizes: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "purple-lumi",
    name: "Lumi Purple Puffer",
    tagline: "Iconic Violet Chroma & Deep Ultraviolet",
    edition: "Hero Art Direction 01",
    price: 420,
    colorHex: "#B57CFF",
    accentHex: "#2A084E",
    modelUrl: "/assets/models/puffer-purple-lumi.glb",
    imageUrl: "/assets/products/jacket-purple-lumi.png",
    badge: "Hero Edition",
    description: "Designed for those who wear their dreams out loud. Sculpted with high-loft iridescent chambering and our proprietary violet reflection matrix.",
    specs: {
      warmth: "-25°C Sub-Zero Squish Warmth",
      insulation: "Cloud-Loft™ 900 Recycled Down",
      shell: "Iridescent Nano-Ripstop with Hydrophobic Glaze",
      hardware: "Signature Star Zipper in Chrome Alloy"
    },
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "moonbeam",
    name: "Moonbeam Prism Puffer",
    tagline: "Prismatic Liquid Mirror Finish",
    edition: "Spectrum Series No. 2",
    price: 450,
    colorHex: "#E2E8F0",
    accentHex: "#64748B",
    modelUrl: "/assets/models/puffer-moonbeam.glb",
    imageUrl: "/assets/products/jacket-silver-iridescent.png",
    badge: "High Reflective",
    description: "Captures ambient daylight and shimmers with pearlescent rainbow hues. The ultimate futuristic shield against the cold.",
    specs: {
      warmth: "-30°C Glacial Climate Shield",
      insulation: "Double-Chamber Micro-Baffle Down",
      shell: "Mirror Prismatic Polyurethane Composite",
      hardware: "Cold-Touch Aluminum Star Slider"
    },
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "pink-bubblegum",
    name: "Neon Bubblegum Puffer",
    tagline: "Electric Candy Gloss & Squishy Comfort",
    edition: "Pop Euphoria Release",
    price: 390,
    colorHex: "#FF4FD8",
    accentHex: "#7A0A62",
    modelUrl: "/assets/models/puffer-pink-bubblegum.glb",
    imageUrl: "/assets/products/jacket-pink-bubblegum.png",
    badge: "Most Loved",
    description: "Pure dopamine outerwear. Engineered with oversized bouncy baffles and an ultra-plush collar that feels like an embrace.",
    specs: {
      warmth: "-20°C All-Day Winter Comfort",
      insulation: "Zero-Gravity Air Baffle System",
      shell: "High-Gloss Bubble Gum Polymer",
      hardware: "Magnetic Storm Flap & Dual Star Zip"
    },
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "blue-aurora",
    name: "Electric Aurora Puffer",
    tagline: "Cyan Wave Luminescence",
    edition: "Atmosphere Drop 04",
    price: 410,
    colorHex: "#00D9FF",
    accentHex: "#004766",
    modelUrl: "/assets/models/puffer-electric-aurora.glb",
    imageUrl: "/assets/products/jacket-blue-aurora.png",
    badge: "Limited Run",
    description: "Inspired by nocturnal polar skies. Radiates vibrant cyan energy across light-responsive reflective chambers.",
    specs: {
      warmth: "-22°C Alpine Expedition Grade",
      insulation: "Thermal-Loom Sustainable Fill",
      shell: "Cyan Wave Laminated Weave",
      hardware: "Reinforced Water-Sealed Star Zip"
    },
    sizes: ["XS", "S", "M", "L", "XL"]
  }
];

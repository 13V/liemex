// Everything on the site that is a fact about Liemex lives here, taken from liemex.com.au (Nov 2026).
// Change it here, run `node build.mjs`, commit the regenerated pages.

export const site = {
  name: "Liemex",
  trading: "Baltic Pine & European Timber",
  tagline: "The solid timber specialists",
  url: "https://liemex.com.au",
  phone: "(08) 8444 1800",
  phoneHref: "tel:+61884441800",
  email: "admin@liemex.com.au",
  street: "1 Bedford Street",
  suburb: "Port Adelaide",
  state: "SA",
  postcode: "5015",
  maps: "https://www.google.com/maps/search/?api=1&query=Liemex+1+Bedford+Street+Port+Adelaide+SA+5015",
  facebook: "https://www.facebook.com/BalticPineAU/",
  instagram: "https://www.instagram.com/balticpineeuropeantimber/",
  hours: [
    ["Monday to Friday", "9am – 5pm"],
    ["Saturday", "10am – 11am"],
    ["Sunday", "Closed"],
  ],
};

export const nav = [
  ["Products", "/products"],
  ["Timber species", "/timber-species"],
  ["Gallery", "/gallery"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

// `count` is the number of products listed in that category on the current site.
export const categories = [
  {
    slug: "flooring", name: "Flooring", count: 135, img: "cat-flooring",
    alt: "Australian chestnut solid timber floor in an open living room",
    blurb: "Solid tongue and groove boards, overlay and parquetry, in Australian hardwoods, oak and traditional 152 × 22 Baltic pine.",
    items: ["Tasmanian oak", "Jarrah", "Spotted gum", "Blackbutt", "Australian chestnut", "Victorian ash", "Red ironbark", "Baltic pine"],
  },
  {
    slug: "doors", name: "Doors", count: 44, img: "cat-doors",
    alt: "Solid timber double entrance doors with leadlight glass",
    blurb: "Solid timber internal and external doors, a range unique to Liemex. Made to order, to your sizes, and supplied pre-hung if you need them ready to install.",
    items: ["4 panel Victorian with bolection mould", "Bungalow", "Broome", "1, 4 and 10 light glazed", "Baltic barn doors", "Baltic fly screen doors"],
  },
  {
    slug: "cladding", name: "Cladding and lining", count: 83, img: "cat-cladding",
    alt: "Timber cladding on a garden studio",
    blurb: "Shiplap, V-joint and matchboard profiles for walls and ceilings, inside and out.",
    items: ["Larch cladding and shiplap", "Blackwood cladding and V-joint", "Baltic pine V-joint 140 × 19", "Red Baltic shiplap 90 × 12", "Radiata pine matchboard", "Skip dressed jarrah"],
  },
  {
    slug: "mouldings", name: "Mouldings", count: 79, img: "cat-mouldings",
    alt: "A line-up of Baltic pine skirting and architrave profiles",
    blurb: "Architraves, skirtings and second-fix profiles, run on our own moulders. We match heritage profiles and machine to an architect's drawing.",
    items: ["Skirtings", "Architraves", "Door frames and door stops", "Staircase components", "Custom profiles to order"],
  },
  {
    slug: "decking", name: "Decking", count: 6, img: "cat-decking",
    alt: "Hardwood decking laid in a mitred corner",
    blurb: "Durable hardwood decking boards for South Australian weather.",
    items: ["Jarrah 65 × 20", "Kapur 90 × 18", "Karri 85 × 19", "Larch 90 × 20", "Merbau 140 × 19", "Spotted gum 86 × 19"],
  },
  {
    slug: "screens", name: "Lattice and screens", count: 4, img: "cat-screens",
    alt: "Painted timber lattice screen above a garden wall",
    blurb: "Made-to-measure lattice, pickets and battens for fences, screens and verandahs.",
    items: ["Made-to-measure lattice", "Jarrah pickets, square and gothic", "Karri pickets 65 × 20", "Victorian ash battens 38 × 38"],
  },
  {
    slug: "stairs", name: "Stairs", count: 5, img: "cat-stairs",
    alt: "Open timber stair treads above a spotted gum floor",
    blurb: "Solid stair treads in jarrah and red gum, with staircase components to match.",
    items: ["Jarrah treads 285 × 35", "Jarrah treads 300 × 38", "Red gum treads 285 × 32", "Red gum treads 285 × 35", "Red gum treads 290 × 40"],
  },
];

export const productTotal = categories.reduce((n, c) => n + c.count, 0);

export const species = [
  { slug: "tasmanian-oak", name: "Tasmanian oak", type: "Hardwood", text: "Elegant and durable, at home in both modern and classic interiors.", uses: ["Flooring", "Skirting", "Architraves"] },
  { slug: "baltic-pine", name: "Baltic pine", type: "Softwood", text: "Light-coloured softwood with a smooth finish. The traditional Adelaide floorboard.", uses: ["Flooring", "Lining", "Joinery"] },
  { slug: "spotted-gum", name: "Spotted gum", type: "Hardwood", text: "High-strength timber with lively natural colour variation.", uses: ["Decking", "Flooring", "Structural"] },
  { slug: "jarrah", name: "Jarrah", type: "Hardwood", text: "Dense West Australian hardwood in deep reds, supplied as flooring, decking and stair treads.", uses: ["Flooring", "Decking", "Stairs"] },
  { slug: "victorian-ash", name: "Victorian ash", type: "Hardwood", text: "Clean, consistent appearance and a fine grain. Machines and finishes well.", uses: ["Flooring", "Stairs", "Joinery"] },
  { slug: "australian-chestnut", name: "Australian chestnut", type: "Hardwood", text: "Light to medium hardwood that is easy to work and finishes well.", uses: ["Flooring", "Interiors"] },
  { slug: "redgum", name: "Red gum", type: "Hardwood", text: "Deep red hardwood, durable and suited to structural work.", uses: ["Stairs", "Benchtops", "Furniture"] },
  { slug: "tasmanian-blackwood", name: "Tasmanian blackwood", type: "Hardwood", text: "Dark hardwood with a striking grain for high-end joinery.", uses: ["Joinery", "Furniture", "Cladding"] },
  { slug: "marri", name: "Marri", type: "Hardwood", text: "Medium hardwood with rich tones and plenty of feature.", uses: ["Flooring", "Furniture"] },
  { slug: "karri", name: "Karri", type: "Hardwood", text: "Strong, durable hardwood with reddish hues.", uses: ["Decking", "Flooring", "Structural"] },
  { slug: "kapur", name: "Kapur", type: "Hardwood", text: "Dense hardwood for decking and heavy-use applications.", uses: ["Decking", "Posts", "Beams"] },
  { slug: "silvertop-ash", name: "Silvertop ash", type: "Hardwood", text: "Light hardwood with a smooth finish, excellent for joinery.", uses: ["Cladding", "Joinery", "Flooring"] },
  { slug: "flooded-gum", name: "Flooded gum", type: "Hardwood", text: "Also sold as rose gum. Light timber with natural character.", uses: ["Flooring", "Joinery"] },
  { slug: "brush-box", name: "Brush box", type: "Hardwood", text: "Heavy hardwood with a fine grain.", uses: ["Stair treads", "Furniture", "Joinery"] },
  { slug: "maranti", name: "Meranti", type: "Hardwood", text: "Rich reddish-brown tones, from the mahogany family.", uses: ["Furniture", "Joinery"] },
  { slug: "cypress-pine", name: "Cypress pine", type: "Softwood", text: "Durable softwood, resistant to termites and decay.", uses: ["Posts", "Fencing", "Cladding"] },
  { slug: "radiata-pine", name: "Radiata pine", type: "Softwood", text: "Plantation softwood, light and easy to work with.", uses: ["Framing", "Lining", "Interiors"] },
];

// Google reviews shown on the current site. Quoted word for word, shortened only at sentence breaks.
export const reviews = [
  {
    name: "Dave Kavanagh",
    quote: "I contacted Reni about a solid wooden door and within 2 hours after normal shops closed, he sent through the quote and all relevant information. The door was cut to size the next day. The entire process from beginning to end was brilliant.",
  },
  {
    name: "Justdoit Adelaide",
    quote: "Reni was very diligent and honest with his supply of Oak timber flooring. He even checked the quality / moisture once installed on a Saturday night. The oak was perfect and the quality control was super important.",
  },
  {
    name: "Ian Wilson",
    quote: "Excellent advice and products everything from my Blackwood floors, Red Gum bench tops and my Kauri door frames supplied by Peter and Reni at BalticPine and European Timber.",
  },
];

export const catalogues = [
  { name: "Architraves, mouldings and skirtings", note: "Solid timber moulding profiles", size: "PDF, 2.3 MB", href: "https://liemex.com.au/wp-content/uploads/2025/08/mould-cat-240120-FINAL.pdf" },
  { name: "Doors, door frames and door stops", note: "Internal and external solid timber doors", size: "PDF, 17 MB", href: "https://liemex.com.au/wp-content/uploads/2025/07/Baltic-PIne-door-catalogue.pdf" },
  { name: "Lattice, pickets, fencing and decking", note: "Lattice styles and made-to-measure lattice", size: "PDF, 13.6 MB", href: "https://liemex.com.au/wp-content/uploads/2024/09/Liemex-Lattice-Booklet-2014-HQ.pdf" },
];

export const services = [
  ["Machining and profiling", "Hardwood and softwood run to standard or custom profiles on our own moulders."],
  ["Doors to spec", "From a single leaf to a pre-assembled set, ready to install."],
  ["Timber laminating", "Benchtops, posts and oversize sections laminated to order."],
  ["Lacquer finishing", "Profiles finished to an architect's specification before they leave the yard."],
  ["Sawn timber", "Sawn Baltic and Nordic pine, and green or kiln-dried Australian hardwood."],
];

const g = (cat, n, w, h, alt) => ({ cat, src: `gallery/${cat}-${n}`, w, h, alt });
export const gallery = [
  g("flooring", 1, 1400, 929, "Australian chestnut floor in an open-plan living and dining room"),
  g("doors", 1, 1400, 933, "Solid timber double entrance doors with leadlight glass"),
  g("flooring", 11, 900, 1200, "Feature-grade chestnut floor running through a galley kitchen"),
  g("flooring", 3, 1400, 1050, "Wormy chestnut floor in a new kitchen and living area"),
  g("decking", 1, 1024, 683, "Hardwood decking laid in a mitred corner"),
  g("doors", 2, 1400, 1050, "Slatted timber pivot entrance door"),
  g("flooring", 4, 1080, 1080, "Dark hardwood floor beside a dining table"),
  g("joinery", 1, 683, 435, "Solid timber laundry benchtop"),
  g("flooring", 13, 1400, 932, "Parquetry floor in an entrance hall with a curved staircase"),
  g("doors", 3, 900, 1200, "Baltic pine glazed double doors"),
  g("flooring", 5, 1080, 1080, "Pale hardwood floor in a living room"),
  g("decking", 2, 500, 332, "Hardwood deck beside a lap pool"),
  g("flooring", 12, 900, 1200, "Timber floor in a hallway with an open stair"),
  g("joinery", 2, 364, 482, "Floating solid timber vanity with twin basins"),
  g("flooring", 6, 1079, 1079, "Blonde hardwood floor in a white kitchen"),
  g("doors", 4, 1080, 1080, "Baltic pine French doors with coloured glass"),
  g("flooring", 7, 1079, 1079, "Hardwood floor in an open dining area"),
  g("decking", 3, 500, 332, "Curved hardwood path through a courtyard garden"),
  g("flooring", 8, 1080, 1080, "Parquetry floor laid in a basket-weave pattern"),
  g("joinery", 3, 500, 375, "Baltic pine vanity with a turned-leg frame"),
  g("flooring", 9, 1080, 1080, "Feature-grade hardwood floor in a living room"),
  g("flooring", 14, 794, 1200, "Polished Baltic pine floor in a villa hallway"),
  g("joinery", 4, 500, 375, "Timber fireplace surround with a cast-iron insert"),
  g("flooring", 10, 1079, 1079, "Pale timber floor beside a chest of drawers"),
  g("decking", 4, 500, 375, "Hardwood slat screen and decking in a side courtyard"),
  g("flooring", 2, 800, 533, "Chestnut floor in a dining room with a view"),
  g("joinery", 5, 375, 500, "Solid timber dining setting and sideboard"),
  g("decking", 5, 500, 375, "Covered hardwood deck with an outdoor table"),
  g("joinery", 6, 500, 328, "Solid timber kitchen island and bar"),
];

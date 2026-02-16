export const COMPANY = {
  name: "Qanzak Global Properties",
  tagline: "Your Trusted Real Estate Partner in Islamabad & Lahore",
  address: "House 66, F-11/1, Islamabad, Pakistan",
  phone: "+92 331 1479800",
  email: "info@qanzakglobal.com",
  whatsapp: "923311479800",
  whatsappMessage: "Hi, I'm interested in learning more about your real estate services",
  hours: "Mon - Sat: 9:00 AM - 6:00 PM",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.8!2d73.0287!3d33.6944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQxJzQwLjAiTiA3M8KwMDEnNDMuMiJF!5e0!3m2!1sen!2s!4v1700000000000",
  stats: [
    { label: "Properties Sold", value: 500 },
    { label: "Happy Clients", value: 1000 },
    { label: "Years Experience", value: 15 },
    { label: "Active Listings", value: 200 },
  ],
  social: {
    facebook: "https://facebook.com/qanzakglobal",
    instagram: "https://instagram.com/qanzakglobal",
    linkedin: "https://linkedin.com/company/qanzakglobal",
  },
};

export const SERVICES = [
  {
    id: "sales",
    title: "Property Sales",
    description: "Find your dream home or investment property with our extensive portfolio of residential and commercial properties across Islamabad and Lahore.",
    icon: "Home",
  },
  {
    id: "rentals",
    title: "Property Rentals",
    description: "Browse our curated selection of rental homes, apartments, and commercial spaces. Flexible terms and competitive rates to suit every need.",
    icon: "Key",
  },
  {
    id: "maintenance",
    title: "Property Maintenance",
    description: "Complete property care including repairs, renovations, and routine maintenance. Keep your investment in pristine condition year-round.",
    icon: "Wrench",
  },
  {
    id: "management",
    title: "Property Management",
    description: "Full-service property management solutions. From tenant screening to rent collection, we handle everything so you don't have to.",
    icon: "Building2",
  },
  {
    id: "consultation",
    title: "Real Estate Consultation",
    description: "Expert guidance on property investments, market analysis, and strategic planning. Make informed decisions backed by years of industry expertise.",
    icon: "MessageSquare",
  },
  {
    id: "investment",
    title: "Investment Opportunities",
    description: "Access exclusive investment properties with high returns. Our team identifies the best opportunities in Pakistan's growing real estate market.",
    icon: "TrendingUp",
  },
];

export const TEAM = [
  {
    name: "Ahmed Khan",
    role: "CEO & Founder",
    bio: "With over 20 years in real estate, Ahmed leads Qanzak Global with a vision for excellence.",
  },
  {
    name: "Sara Malik",
    role: "Director of Sales",
    bio: "Sara brings strategic insight and market knowledge to every client interaction.",
  },
  {
    name: "Omar Rashid",
    role: "Property Manager",
    bio: "Omar ensures every managed property meets our highest standards of quality.",
  },
  {
    name: "Fatima Noor",
    role: "Client Relations",
    bio: "Fatima builds lasting relationships through exceptional service and care.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Asad Mehmood",
    role: "Homeowner",
    text: "Qanzak Global made buying our dream home in F-11 an absolute pleasure. Professional service from start to finish.",
    rating: 5,
  },
  {
    name: "Hina Tariq",
    role: "Property Investor",
    text: "Their investment guidance helped me build a strong property portfolio. Returns have exceeded my expectations.",
    rating: 5,
  },
  {
    name: "Bilal Ahmad",
    role: "Business Owner",
    text: "Finding the perfect commercial space for my business was effortless with Qanzak Global's expert team.",
    rating: 5,
  },
];

export const PROPERTY_TYPES = ["House", "Apartment", "Penthouse", "Commercial", "Townhouse", "Villa"] as const;
export const PROPERTY_STATUSES = ["For Sale", "For Rent"] as const;
export const CITIES = ["Islamabad", "Lahore"] as const;
export const LOCATIONS = [
  "F-7, Islamabad",
  "F-10, Islamabad",
  "F-11, Islamabad",
  "DHA, Islamabad",
  "Bahria Town, Islamabad",
  "DHA, Lahore",
  "Gulberg, Lahore",
  "Bahria Town, Lahore",
] as const;

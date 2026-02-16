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
    image: "/images/services/sales.jpg",
    badge: "Most Popular",
  },
  {
    id: "rentals",
    title: "Property Rentals",
    description: "Browse our curated selection of rental homes, apartments, and commercial spaces. Flexible terms and competitive rates to suit every need.",
    icon: "Key",
    image: "/images/services/rentals.jpg",
    badge: "Flexible Terms",
  },
  {
    id: "maintenance",
    title: "Property Maintenance",
    description: "Complete property care including repairs, renovations, and routine maintenance. Keep your investment in pristine condition year-round.",
    icon: "Wrench",
    image: "/images/services/maintenance.jpg",
    badge: "24/7 Support",
  },
  {
    id: "management",
    title: "Property Management",
    description: "Full-service property management solutions. From tenant screening to rent collection, we handle everything so you don't have to.",
    icon: "Building2",
    image: "/images/services/management.jpg",
    badge: "Full Service",
  },
  {
    id: "consultation",
    title: "Real Estate Consultation",
    description: "Expert guidance on property investments, market analysis, and strategic planning. Make informed decisions backed by years of industry expertise.",
    icon: "MessageSquare",
    image: "/images/services/consultation.jpg",
    badge: "Expert Advice",
  },
  {
    id: "investment",
    title: "Investment Opportunities",
    description: "Access exclusive investment properties with high returns. Our team identifies the best opportunities in Pakistan's growing real estate market.",
    icon: "TrendingUp",
    image: "/images/services/investment.jpg",
    badge: "High Returns",
  },
];

export const TEAM = [
  {
    name: "Muhammad Naushad Anjum",
    role: "CEO & Founder",
    department: "Executive Leadership",
    specialization: "Strategic Planning, Business Development, Real Estate Investment",
    bio: "Muhammad Naushad Anjum is the visionary founder and CEO of Qanzak Global Properties. With extensive experience in the real estate industry, he has built Qanzak Global into a trusted name in Islamabad and Lahore's property market.",
    shortBio: "Visionary leader driving Qanzak Global's success with a commitment to excellence and client satisfaction.",
    email: "naushad@qanzakglobal.com",
    phone: "+92 331 1479800",
    whatsapp: "923311479800",
    photo: "/images/team/naushad.png",
    order: 1,
  },
  {
    name: "Shahzad Ahmad",
    role: "Director of Sales",
    department: "Sales & Marketing",
    specialization: "Property Sales, Client Acquisition, Market Analysis, Commercial Properties",
    bio: "Shahzad Ahmad serves as the Director of Sales at Qanzak Global Properties, bringing years of expertise in property sales and client relations. His deep understanding of the Islamabad and Lahore real estate markets has helped countless clients find their dream properties.",
    shortBio: "Expert in property sales with deep market knowledge across Islamabad and Lahore.",
    email: "shahzad@qanzakglobal.com",
    phone: "+92 331 1479800",
    whatsapp: "923311479800",
    photo: "/images/team/shahzad.png",
    order: 2,
  },
  {
    name: "Adeel",
    role: "Property Manager",
    department: "Property Management & Maintenance",
    specialization: "Property Maintenance, Tenant Relations, Property Inspections, Facility Management",
    bio: "Adeel is the Property Manager at Qanzak Global Properties, responsible for ensuring all properties under management are maintained to the highest standards. His meticulous attention to detail ensures exceptional service for property owners and tenants.",
    shortBio: "Dedicated property manager ensuring the highest standards of maintenance and quality.",
    email: "adeel@qanzakglobal.com",
    phone: "+92 331 1479800",
    whatsapp: "923311479800",
    photo: "/images/team/adeel.png",
    order: 3,
  },
  {
    name: "Fatima",
    role: "Client Relations Manager",
    department: "Customer Service & Client Relations",
    specialization: "Customer Service, Client Communication, Inquiry Management, After-Sales Support",
    bio: "Fatima is the Client Relations Manager at Qanzak Global Properties, dedicated to providing exceptional service to every client. Her warm approach and professional expertise ensure that clients feel valued and supported throughout their property journey.",
    shortBio: "Building lasting relationships through exceptional service and client care.",
    email: "fatima@qanzakglobal.com",
    phone: "+92 331 1479800",
    whatsapp: "923311479800",
    photo: "/images/team/fatima.png",
    order: 4,
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

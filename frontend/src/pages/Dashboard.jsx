import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../utils/soundEffects";
import {
  Sparkles,
  Heart,
  Activity,
  Camera,
  Clock,
  ArrowRight,
  Check,
  Award,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  Star,
  MessageSquareQuote,
  TrendingDown
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [latestConsultation, setLatestConsultation] = useState(null);
  const [latestProgress, setLatestProgress] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSuggesterTab, setActiveSuggesterTab] = useState("acne");
  const [activeBudget, setActiveBudget] = useState("medium"); // 'low', 'medium', 'high'

  // Reminder States
  const [remindersEnabled, setRemindersEnabled] = useState(localStorage.getItem("reminders-enabled") === "true");
  const [amTime, setAmTime] = useState(localStorage.getItem("reminder-am-time") || "08:00");
  const [pmTime, setPmTime] = useState(localStorage.getItem("reminder-pm-time") || "21:00");

  // Load completed steps from localStorage on mount (scoped to the current date)
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`routine-${today}`);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  // Request Notification Permission and Toggle Reminders
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      toggleRemindersState();
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Lumora AI 💜", {
        body: "Notifications enabled! Annu will remind you when it's time for your routines.",
        icon: "/annu_avatar.jpg"
      });
      toggleRemindersState();
    } else {
      alert("Notification permission denied. Please enable notifications in your browser settings.");
    }
  };

  const toggleRemindersState = () => {
    const nextState = !remindersEnabled;
    setRemindersEnabled(nextState);
    localStorage.setItem("reminders-enabled", String(nextState));
  };

  const handleTimeChange = (type, val) => {
    if (type === "am") {
      setAmTime(val);
      localStorage.setItem("reminder-am-time", val);
    } else {
      setPmTime(val);
      localStorage.setItem("reminder-pm-time", val);
    }
  };

  // Background check interval for scheduled notifications
  useEffect(() => {
    if (!remindersEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHours}:${currentMinutes}`;

      if (currentTime === amTime) {
        new Notification("Lumora AM Routine Reminder ☀️", {
          body: `${user?.name || "Manthan"}, it's time for your morning routine steps! Keep glowing! 💜`,
          icon: "/annu_avatar.jpg"
        });
      } else if (currentTime === pmTime) {
        new Notification("Lumora PM Routine Reminder 🌙", {
          body: `${user?.name || "Manthan"}, it's time for your night routine steps! Don't skip your skin repair! 💜`,
          icon: "/annu_avatar.jpg"
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [remindersEnabled, amTime, pmTime, user]);

  // Expanded database featuring globally reputed brands categorized by budget
  const productSuggestions = {
    acne: {
      low: [
        {
          name: "Clear Face Cleansing Foam",
          brand: "Sebamed",
          ingredients: "Montaline C40, Panthenol",
          priceAmazon: "₹580",
          priceNykaa: "₹630",
          bestDeal: "amazon",
          rating: 4.5,
          reviews: 12450,
          feedback: "Super gentle on active acne, maintains pH 5.5 and doesn't strip skin.",
          amazonLink: "https://www.amazon.in/s?k=Sebamed+Clear+Face+Foam",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Sebamed+Clear+Face"
        },
        {
          name: "Salicylic Acid 2% Face Serum",
          brand: "The Derma Co",
          ingredients: "Salicylic Acid 2%, Witch Hazel",
          priceAmazon: "₹449",
          priceNykaa: "₹499",
          bestDeal: "amazon",
          rating: 4.4,
          reviews: 9850,
          feedback: "Extremely budget-friendly. Helps clear whiteheads and blackheads quickly.",
          amazonLink: "https://www.amazon.in/s?k=Derma+Co+Salicylic+Acid",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Derma+Co+Salicylic"
        },
        {
          name: "Green Tea Pore Cleansing Face Wash",
          brand: "Plum",
          ingredients: "Green Tea Extract, Glycolic Acid",
          priceAmazon: "₹349",
          priceNykaa: "₹349",
          bestDeal: "equal",
          rating: 4.5,
          reviews: 15420,
          feedback: "Mild exfoliating wash that clears clogged pores and removes excess oil.",
          amazonLink: "https://www.amazon.in/s?k=Plum+Green+Tea+Face+Wash",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Plum+Green+Tea"
        },
        {
          name: "Oil-Free Acne Wash",
          brand: "Neutrogena",
          ingredients: "Salicylic Acid 2%, Chamomile",
          priceAmazon: "₹650",
          priceNykaa: "₹675",
          bestDeal: "amazon",
          rating: 4.3,
          reviews: 28450,
          feedback: "Classic dermatologist-recommended wash for oily and acne-prone skin.",
          amazonLink: "https://www.amazon.in/s?k=Neutrogena+Oil+Free+Acne+Wash",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Neutrogena+Acne"
        }
      ],
      medium: [
        {
          name: "Niacinamide 10% + Zinc 1%",
          brand: "The Ordinary",
          ingredients: "Niacinamide, Zinc PCA",
          priceAmazon: "₹599",
          priceNykaa: "₹650",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 45120,
          feedback: "Controls sebum production like a dream. Highly recommended for oily/acne skin.",
          amazonLink: "https://www.amazon.in/s?k=The+Ordinary+Niacinamide+10%25",
          nykaaLink: "https://www.nykaa.com/search/result/?q=The+Ordinary+Niacinamide"
        },
        {
          name: "Acne Pimple Master Patch",
          brand: "COSRX",
          ingredients: "Hydrocolloid AD Technology",
          priceAmazon: "₹280",
          priceNykaa: "₹299",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 32450,
          feedback: "Sucks out all the gunk from whiteheads overnight. Incredibly satisfying.",
          amazonLink: "https://www.amazon.in/s?k=COSRX+Acne+Pimple+Master+Patch",
          nykaaLink: "https://www.nykaa.com/search/result/?q=COSRX+Pimple+Patch"
        },
        {
          name: "2% Salicylic Acid Serum",
          brand: "Minimalist",
          ingredients: "Salicylic Acid 2%, LHA",
          priceAmazon: "₹549",
          priceNykaa: "₹549",
          bestDeal: "equal",
          rating: 4.6,
          reviews: 24510,
          feedback: "Excellent daily exfoliant that reduces blackheads and refines skin texture.",
          amazonLink: "https://www.amazon.in/s?k=Minimalist+Salicylic+Acid",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Minimalist+Salicylic"
        },
        {
          name: "Tea Tree Spanish Blemish Gel",
          brand: "Pilgrim",
          ingredients: "Tea Tree, Cica, Salicylic Acid",
          priceAmazon: "₹450",
          priceNykaa: "₹495",
          bestDeal: "amazon",
          rating: 4.4,
          reviews: 8750,
          feedback: "Fast-absorbing spot treatment gel that dries out pimples without irritation.",
          amazonLink: "https://www.amazon.in/s?k=Pilgrim+Tea+Tree+Gel",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Pilgrim+Tea+Tree"
        }
      ],
      high: [
        {
          name: "Skin Perfecting 2% BHA Liquid Exfoliant",
          brand: "Paula's Choice",
          ingredients: "Salicylic Acid (BHA) 2%, Green Tea",
          priceAmazon: "₹1,200",
          priceNykaa: "₹1,350",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 74210,
          feedback: "The internet's absolute favorite BHA. Shrinks pores and clears blackheads in a week!",
          amazonLink: "https://www.amazon.in/s?k=Paulas+Choice+2%25+BHA+Liquid+Exfoliant",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Paula%27s+Choice+2%25+BHA"
        },
        {
          name: "Effaclar Duo(+) Dual Action Acne Treatment",
          brand: "La Roche-Posay",
          ingredients: "Benzoyl Peroxide 5.5%, LHA",
          priceAmazon: "₹1,850",
          priceNykaa: "₹1,950",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 14120,
          feedback: "A dermatological staple. Fights inflammatory acne and prevents new breakouts.",
          amazonLink: "https://www.amazon.in/s?k=La+Roche+Posay+Effaclar+Duo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=La+Roche+Posay"
        },
        {
          name: "Clog Fighter 2% BHA Gel Exfoliant",
          brand: "Dr. Sheth's",
          ingredients: "Salicylic Acid 2%, Neem, Tea Tree",
          priceAmazon: "₹950",
          priceNykaa: "₹999",
          bestDeal: "amazon",
          rating: 4.5,
          reviews: 3120,
          feedback: "Formulated specifically for Indian skin types. Reduces active acne and controls oil.",
          amazonLink: "https://www.amazon.in/s?k=Dr+Sheths+Clog+Fighter",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Dr+Sheth%27s"
        }
      ]
    },
    dry: {
      low: [
        {
          name: "Gentle Skin Cleanser",
          brand: "Cetaphil",
          ingredients: "Niacinamide, Panthenol, Glycerin",
          priceAmazon: "₹399",
          priceNykaa: "₹425",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 54120,
          feedback: "The gold standard for dry, sensitive skin. Cleanse without stripping moisture.",
          amazonLink: "https://www.amazon.in/s?k=Cetaphil+Gentle+Skin+Cleanser",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Cetaphil+Cleanser"
        },
        {
          name: "Daily Intense Moisturising Cream",
          brand: "Cetaphil",
          ingredients: "Sweet Almond Oil, Shea Butter, Vitamin E",
          priceAmazon: "₹499",
          priceNykaa: "₹480",
          bestDeal: "nykaa",
          rating: 4.6,
          reviews: 32150,
          feedback: "Extremely gentle, fragrance-free cream. Ideal for dry, sensitive, or eczema skin.",
          amazonLink: "https://www.amazon.in/s?k=Cetaphil+Moisturising+Cream",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Cetaphil+Moisturising+Cream"
        },
        {
          name: "Hello Aloe Caring Day Moisturizer",
          brand: "Plum",
          ingredients: "Aloe Vera Juice, Vitamin E",
          priceAmazon: "₹380",
          priceNykaa: "₹380",
          bestDeal: "equal",
          rating: 4.4,
          reviews: 9850,
          feedback: "Lightweight hydrating moisturizer that calms dry patches and redness.",
          amazonLink: "https://www.amazon.in/s?k=Plum+Hello+Aloe+Moisturizer",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Plum+Hello+Aloe"
        },
        {
          name: "Ceramide & Hyaluronic Acid Moisturizer",
          brand: "The Derma Co",
          ingredients: "Ceramides, Hyaluronic Acid",
          priceAmazon: "₹349",
          priceNykaa: "₹399",
          bestDeal: "amazon",
          rating: 4.5,
          reviews: 14250,
          feedback: "Locks in moisture and repairs the skin barrier. Perfect for dry skin.",
          amazonLink: "https://www.amazon.in/s?k=Derma+Co+Ceramide+Moisturizer",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Derma+Co+Ceramide"
        }
      ],
      medium: [
        {
          name: "Daily Moisturizing Cream",
          brand: "CeraVe",
          ingredients: "Ceramides 1, 3, 6-II, Hyaluronic Acid",
          priceAmazon: "₹1,199",
          priceNykaa: "₹1,299",
          bestDeal: "amazon",
          rating: 4.9,
          reviews: 98120,
          feedback: "Dermatologist recommended. Restores the protective skin barrier and hydrates all day.",
          amazonLink: "https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream",
          nykaaLink: "https://www.nykaa.com/search/result/?q=CeraVe+Moisturizing+Cream"
        },
        {
          name: "Advanced Snail 96 Mucin Power Essence",
          brand: "COSRX",
          ingredients: "Snail Secretion Filtrate 96.3%",
          priceAmazon: "₹1,199",
          priceNykaa: "₹1,450",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 58940,
          feedback: "The ultimate K-Beauty glow. Deeply hydrating, soothing, and repairing.",
          amazonLink: "https://www.amazon.in/s?k=COSRX+Snail+Mucin+96+Essence",
          nykaaLink: "https://www.nykaa.com/search/result/?q=COSRX+Snail+Mucin"
        },
        {
          name: "Squalane 100% Face Oil",
          brand: "Minimalist",
          ingredients: "Squalane 100% (Olive derived)",
          priceAmazon: "₹699",
          priceNykaa: "₹699",
          bestDeal: "equal",
          rating: 4.6,
          reviews: 7420,
          feedback: "Super lightweight oil that mimics skin's natural moisture. Adds instant glow.",
          amazonLink: "https://www.amazon.in/s?k=Minimalist+Squalane+Oil",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Minimalist+Squalane"
        },
        {
          name: "Squalane Glow Moisturizer",
          brand: "Pilgrim",
          ingredients: "Squalane, Kakadu Plum, Vitamin C",
          priceAmazon: "₹550",
          priceNykaa: "₹550",
          bestDeal: "equal",
          rating: 4.5,
          reviews: 11240,
          feedback: "Adds a beautiful dewy finish while repairing dry, flaky skin cells.",
          amazonLink: "https://www.amazon.in/s?k=Pilgrim+Squalane+Moisturizer",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Pilgrim+Squalane"
        }
      ],
      high: [
        {
          name: "Ultra Facial Cream",
          brand: "Kiehl's",
          ingredients: "Glacial Glycoprotein, Squalane",
          priceAmazon: "₹2,850",
          priceNykaa: "₹2,950",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 15420,
          feedback: "Super rich yet lightweight. Keeps skin hydrated for 24 hours in dry weather.",
          amazonLink: "https://www.amazon.in/s?k=Kiehls+Ultra+Facial+Cream",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Kiehl%27s+Ultra+Facial"
        },
        {
          name: "Water Sleeping Mask",
          brand: "Laneige",
          ingredients: "Hydro Ionized Mineral Water, Evening Primrose",
          priceAmazon: "₹1,850",
          priceNykaa: "₹1,850",
          bestDeal: "equal",
          rating: 4.7,
          reviews: 24510,
          feedback: "Wake up with plump, bouncy, and hydrated glass skin. Best overnight mask.",
          amazonLink: "https://www.amazon.in/s?k=Laneige+Water+Sleeping+Mask",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Laneige+Water+Sleeping"
        },
        {
          name: "Moisture Surge 100H Hydrator",
          brand: "Clinique",
          ingredients: "Aloe Bio-ferment, Hyaluronic Acid",
          priceAmazon: "₹2,700",
          priceNykaa: "₹2,700",
          bestDeal: "equal",
          rating: 4.7,
          reviews: 19850,
          feedback: "Gel-cream formula that penetrates 10 layers deep for intense hydration.",
          amazonLink: "https://www.amazon.in/s?k=Clinique+Moisture+Surge+100H",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Clinique+Moisture+Surge"
        }
      ]
    },
    pigmentation: {
      low: [
        {
          name: "15% Vitamin C Glow Face Serum",
          brand: "Plum",
          ingredients: "Ethyl Ascorbic Acid 15%, Mandarin Orange",
          priceAmazon: "₹550",
          priceNykaa: "₹590",
          bestDeal: "amazon",
          rating: 4.4,
          reviews: 12150,
          feedback: "A stable Vitamin C serum that brightens skin and boosts radiance.",
          amazonLink: "https://www.amazon.in/s?k=Plum+Vitamin+C+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Plum+Vitamin+C"
        },
        {
          name: "2% Kojic Acid Face Serum",
          brand: "The Derma Co",
          ingredients: "Kojic Acid 2%, Alpha Arbutin 1%",
          priceAmazon: "₹499",
          priceNykaa: "₹499",
          bestDeal: "equal",
          rating: 4.3,
          reviews: 14250,
          feedback: "Specifically formulated to fade dark spots, acne marks, and melasma.",
          amazonLink: "https://www.amazon.in/s?k=Derma+Co+Kojic+Acid",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Derma+Co+Kojic+Acid"
        },
        {
          name: "10% Niacinamide Face Serum",
          brand: "The Derma Co",
          ingredients: "Niacinamide 10%, Zinc 1%",
          priceAmazon: "₹499",
          priceNykaa: "₹499",
          bestDeal: "equal",
          rating: 4.4,
          reviews: 16540,
          feedback: "Improves skin tone, fades blemishes, and controls excess sebum.",
          amazonLink: "https://www.amazon.in/s?k=Derma+Co+Niacinamide+10%25",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Derma+Co+Niacinamide"
        }
      ],
      medium: [
        {
          name: "Alpha Arbutin 2% + HA",
          brand: "The Ordinary",
          ingredients: "Alpha Arbutin 2%, Hyaluronic Acid",
          priceAmazon: "₹750",
          priceNykaa: "₹799",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 18420,
          feedback: "Extremely effective at fading acne scars and post-inflammatory pigmentation.",
          amazonLink: "https://www.amazon.in/s?k=The+Ordinary+Alpha+Arbutin",
          nykaaLink: "https://www.nykaa.com/search/result/?q=The+Ordinary+Alpha+Arbutin"
        },
        {
          name: "Melano CC Vitamin C Essence",
          brand: "Rohto Mentholatum",
          ingredients: "Pure Vitamin C, Vitamin E",
          priceAmazon: "₹1,250",
          priceNykaa: "₹1,350",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 11420,
          feedback: "The cult-favorite Japanese Vitamin C. Very stable, fades spots rapidly.",
          amazonLink: "https://www.amazon.in/s?k=Melano+CC+Vitamin+C+Essence",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Melano+CC"
        },
        {
          name: "Alpha Arbutin 2% + Hyaluronic Acid",
          brand: "Minimalist",
          ingredients: "Alpha Arbutin 2%, Hyaluronic Acid",
          priceAmazon: "₹549",
          priceNykaa: "₹549",
          bestDeal: "equal",
          rating: 4.5,
          reviews: 21540,
          feedback: "An advanced depigmenting serum that inhibits melanin production safely.",
          amazonLink: "https://www.amazon.in/s?k=Minimalist+Alpha+Arbutin",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Minimalist+Alpha+Arbutin"
        },
        {
          name: "Spanish Vine Red Wine Face Serum",
          brand: "Pilgrim",
          ingredients: "Red Wine Extracts, Vitamin C, Peptide",
          priceAmazon: "₹650",
          priceNykaa: "₹650",
          bestDeal: "equal",
          rating: 4.4,
          reviews: 9840,
          feedback: "Reduces pigmentation, fights fine lines, and boosts cellular regeneration.",
          amazonLink: "https://www.amazon.in/s?k=Pilgrim+Red+Wine+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Pilgrim+Red+Wine"
        }
      ],
      high: [
        {
          name: "Clinical 20% Niacinamide Treatment",
          brand: "Paula's Choice",
          ingredients: "Niacinamide 20%, Acetyl Glucosamine",
          priceAmazon: "₹4,200",
          priceNykaa: "₹4,450",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 8420,
          feedback: "Fades stubborn dark spots, tightens stretched pores, and evens skin tone.",
          amazonLink: "https://www.amazon.in/s?k=Paulas+Choice+20%25+Niacinamide",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Paula%27s+Choice+20%25+Niacinamide"
        },
        {
          name: "C-Firma Fresh Day Vitamin C Serum",
          brand: "Drunk Elephant",
          ingredients: "L-Ascorbic Acid 15%, Ferulic Acid 1%",
          priceAmazon: "₹6,800",
          priceNykaa: "₹7,200",
          bestDeal: "amazon",
          rating: 4.5,
          reviews: 4120,
          feedback: "Highly potent Vitamin C that brightens skin and reverses sun damage.",
          amazonLink: "https://www.amazon.in/s?k=Drunk+Elephant+Vitamin+C",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Drunk+Elephant"
        },
        {
          name: "Clearly Corrective Dark Spot Solution",
          brand: "Kiehl's",
          ingredients: "Activated C, White Birch, Peony",
          priceAmazon: "₹4,850",
          priceNykaa: "₹4,950",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 12450,
          feedback: "Fades dark spots, hyperpigmentation, and acne scars for extreme clarity.",
          amazonLink: "https://www.amazon.in/s?k=Kiehls+Dark+Spot+Solution",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Kiehl%27s+Clearly+Corrective"
        }
      ]
    },
    hairfall: {
      low: [
        {
          name: "Ginseng Root Hair Growth Scalp Serum",
          brand: "Plum",
          ingredients: "Ginseng Extract, Baicapil 3%",
          priceAmazon: "₹550",
          priceNykaa: "₹550",
          bestDeal: "equal",
          rating: 4.3,
          reviews: 6540,
          feedback: "Extremely budget-friendly scalp serum that activates hair follicles.",
          amazonLink: "https://www.amazon.in/s?k=Plum+Ginseng+Hair+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Plum+Ginseng"
        },
        {
          name: "Multi-Peptide Hair Growth Serum",
          brand: "The Derma Co",
          ingredients: "Multi-Peptides 3%, Procapil",
          priceAmazon: "₹599",
          priceNykaa: "₹599",
          bestDeal: "equal",
          rating: 4.4,
          reviews: 8450,
          feedback: "Nourishes the hair shaft and prevents breakage at the roots.",
          amazonLink: "https://www.amazon.in/s?k=Derma+Co+Hair+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Derma+Co+Hair"
        },
        {
          name: "Hair Health Gummies",
          brand: "Be Bodywise",
          ingredients: "Biotin, Keratin, Zinc, Multivitamins",
          priceAmazon: "₹499",
          priceNykaa: "₹499",
          bestDeal: "equal",
          rating: 4.3,
          reviews: 16540,
          feedback: "Tasty nutritional gummies that support hair root strength from within.",
          amazonLink: "https://www.amazon.in/s?k=Bodywise+Hair+Gummies",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Bodywise+Gummies"
        }
      ],
      medium: [
        {
          name: "Rosemary Scalp & Hair Strengthening Oil",
          brand: "Mielle Organics",
          ingredients: "Rosemary Oil, Mint, Biotin, 30+ Essential Oils",
          priceAmazon: "₹950",
          priceNykaa: "₹999",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 84250,
          feedback: "The viral rosemary oil. Stimulates follicles and triggers rapid hair growth.",
          amazonLink: "https://www.amazon.in/s?k=Mielle+Rosemary+Mint+Oil",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Mielle+Rosemary"
        },
        {
          name: "Multi-Peptide Serum for Hair Density",
          brand: "The Ordinary",
          ingredients: "Redensyl 1%, Procapil, Capixyl",
          priceAmazon: "₹2,000",
          priceNykaa: "₹2,050",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 18450,
          feedback: "A lightweight, non-greasy daily serum. Makes hair visibly thicker and denser.",
          amazonLink: "https://www.amazon.in/s?k=The+Ordinary+Hair+Density+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=The+Ordinary+Hair+Density"
        },
        {
          name: "Spanish Rosemary & Biotin Hair Serum",
          brand: "Pilgrim",
          ingredients: "Spanish Rosemary, Biotin, Redensyl",
          priceAmazon: "₹650",
          priceNykaa: "₹650",
          bestDeal: "equal",
          rating: 4.5,
          reviews: 12450,
          feedback: "A highly-rated Spanish rosemary formulation that stops hair thinning.",
          amazonLink: "https://www.amazon.in/s?k=Pilgrim+Rosemary+Hair+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Pilgrim+Rosemary"
        }
      ],
      high: [
        {
          name: "Genesis Serum Fortifiant Hair Serum",
          brand: "Kérastase",
          ingredients: "Aminexil 1.5%, Edelweiss Cells, Ginger Root",
          priceAmazon: "₹4,200",
          priceNykaa: "₹4,400",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 9540,
          feedback: "Luxury scalp treatment. Reduces hair fall from the roots within a month.",
          amazonLink: "https://www.amazon.in/s?k=Kerastase+Genesis+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Kerastase+Genesis"
        },
        {
          name: "Aminexil Advanced Anti-Thinning Programme",
          brand: "L'Oreal Professionnel",
          ingredients: "Aminexil, Omega 6",
          priceAmazon: "₹2,850",
          priceNykaa: "₹2,950",
          bestDeal: "amazon",
          rating: 4.5,
          reviews: 3120,
          feedback: "Professional salon treatment. Restores hair density and prevents root thinning.",
          amazonLink: "https://www.amazon.in/s?k=LOreal+Professional+Aminexil",
          nykaaLink: "https://www.nykaa.com/search/result/?q=L%27Oreal+Professional+Aminexil"
        }
      ]
    },
    dandruff: {
      low: [
        {
          name: "Scalpe Pro Daily Anti-Dandruff Shampoo",
          brand: "Scalpe Pro",
          ingredients: "Climbazole, ZPTO",
          priceAmazon: "₹290",
          priceNykaa: "₹310",
          bestDeal: "amazon",
          rating: 4.3,
          reviews: 9850,
          feedback: "A budget shampoo that clears mild dandruff flakes without drying the hair.",
          amazonLink: "https://www.amazon.in/s?k=Scalpe+Pro+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Scalpe+Pro"
        },
        {
          name: "Selsun Suspension Anti-Dandruff Shampoo",
          brand: "Selsun",
          ingredients: "Selenium Sulfide 2.5%",
          priceAmazon: "₹350",
          priceNykaa: "₹375",
          bestDeal: "amazon",
          rating: 4.4,
          reviews: 14250,
          feedback: "A medical-grade dandruff cleanser that stops itching instantly.",
          amazonLink: "https://www.amazon.in/s?k=Selsun+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Selsun"
        },
        {
          name: "Tea Tree Dandruff Control Shampoo",
          brand: "Plum",
          ingredients: "Tea Tree Oil, Willow Bark",
          priceAmazon: "₹349",
          priceNykaa: "₹349",
          bestDeal: "equal",
          rating: 4.4,
          reviews: 6540,
          feedback: "Soothes irritated scalps and prevents dandruff flakes naturally.",
          amazonLink: "https://www.amazon.in/s?k=Plum+Tea+Tree+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Plum+Tea+Tree+Shampoo"
        }
      ],
      medium: [
        {
          name: "Nizoral A-D Anti-Dandruff Shampoo",
          brand: "Nizoral",
          ingredients: "Ketoconazole 1%",
          priceAmazon: "₹1,250",
          priceNykaa: "₹1,390",
          bestDeal: "amazon",
          rating: 4.8,
          reviews: 64120,
          feedback: "Dermatologist recommended. Completely eliminates the yeast that causes dandruff.",
          amazonLink: "https://www.amazon.in/s?k=Nizoral+Anti+Dandruff+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Nizoral"
        },
        {
          name: "Clinical Strength Dandruff Shampoo",
          brand: "Head & Shoulders",
          ingredients: "Selenium Sulfide 1%",
          priceAmazon: "₹950",
          priceNykaa: "₹999",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 42150,
          feedback: "Clears even the most stubborn seborrheic dermatitis and oily flakes.",
          amazonLink: "https://www.amazon.in/s?k=Head+and+Shoulders+Clinical+Strength",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Head+%26+Shoulders+Clinical"
        },
        {
          name: "Tea Tree & Rosemary Dandruff Hair Serum",
          brand: "Pilgrim",
          ingredients: "Tea Tree, Rosemary, Salicylic Acid",
          priceAmazon: "₹450",
          priceNykaa: "₹450",
          bestDeal: "equal",
          rating: 4.5,
          reviews: 7850,
          feedback: "A leave-on scalp serum that controls flakes and itching without being greasy.",
          amazonLink: "https://www.amazon.in/s?k=Pilgrim+Dandruff+Serum",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Pilgrim+Dandruff"
        }
      ],
      high: [
        {
          name: "T/Sal Therapeutic Shampoo",
          brand: "Neutrogena",
          ingredients: "Salicylic Acid 3%",
          priceAmazon: "₹1,450",
          priceNykaa: "₹1,499",
          bestDeal: "amazon",
          rating: 4.6,
          reviews: 18450,
          feedback: "Breaks down thick crusty scalp buildup and flakes. Fragrance-free.",
          amazonLink: "https://www.amazon.in/s?k=Neutrogena+T+Sal+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=Neutrogena+T%2FSal"
        },
        {
          name: "Scalp Advanced Anti-Dandruff Cleansing Cream",
          brand: "L'Oreal Professional",
          ingredients: "Piroctone Olamine",
          priceAmazon: "₹820",
          priceNykaa: "₹850",
          bestDeal: "amazon",
          rating: 4.7,
          reviews: 3150,
          feedback: "Keeps the scalp clean, eliminates flakes, and leaves hair silky soft.",
          amazonLink: "https://www.amazon.in/s?k=LOreal+Professional+Scalp+Shampoo",
          nykaaLink: "https://www.nykaa.com/search/result/?q=L%27Oreal+Professional+Scalp"
        }
      ]
    }
  };

  const skincareTips = [
    "UV rays penetrate windows! Always apply SPF 30+ even when staying indoors. 💜",
    "Apply your skincare products from thinnest consistency (toners, serums) to thickest (creams, oils).",
    "Avoid washing your face with hot water. Lukewarm water is gentler on your skin barrier.",
    "Pat your face dry with a clean towel instead of rubbing to avoid micro-tears.",
    "Healthy hair starts at the scalp! Massage your scalp for 2 minutes daily to stimulate hair follicles."
  ];
  const [activeTip, setActiveTip] = useState(skincareTips[0]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      const randomTip = skincareTips[Math.floor(Math.random() * skincareTips.length)];
      setActiveTip(randomTip);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [consultationRes, progressRes] = await Promise.all([
        api.get("/consultations/latest"),
        api.get("/progress")
      ]);
      
      setLatestConsultation(consultationRes.data.consultation);
      if (progressRes.data.entries.length > 0) {
        setLatestProgress(progressRes.data.entries[0]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompleted = (stepId) => {
    playSound("click");
    const today = new Date().toDateString();
    let updated;
    if (completedSteps.includes(stepId)) {
      updated = completedSteps.filter((id) => id !== stepId);
    } else {
      updated = [...completedSteps, stepId];
    }
    setCompletedSteps(updated);
    localStorage.setItem(`routine-${today}`, JSON.stringify(updated));
  };

  const morningRoutine = latestConsultation?.recommendedRoutine?.filter(s => s.timeOfDay === "morning") || [];
  const nightRoutine = latestConsultation?.recommendedRoutine?.filter(s => s.timeOfDay === "night") || [];
  const totalSteps = morningRoutine.length + nightRoutine.length;
  const completedPercentage = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 1. Welcoming Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-brand-violet/25 bg-gradient-to-r from-brand-purple/20 via-brand-pink/5 to-transparent glow-violet flex justify-between items-center"
      >
        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="inline-flex items-center space-x-1.5 bg-brand-violet/15 text-brand-violet px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-violet/20">
            <Sparkles size={12} />
            <span>AI Care Platform</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            Welcome, <span className="bg-gradient-to-r from-brand-violet via-brand-pink to-brand-blue bg-clip-text text-transparent">{user?.name}</span> 💜
          </h2>
          <p className="text-base text-dark-muted leading-relaxed font-medium">
            Your personalized skincare dashboard is ready. Meet **Annu 💜**, your friendly AI companion who is ready to optimize your skin and hair care routines.
          </p>
        </div>
        <img
          src="/annu_avatar.jpg"
          alt="Annu"
          className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-2 border-brand-violet/35 glow-violet hidden md:block"
        />
      </motion.div>

      {/* 2. Rotating Tip Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-5 border border-brand-violet/15 bg-brand-purple/5 flex items-center space-x-4 text-brand-violet"
      >
        <div className="p-2.5 bg-brand-violet/10 rounded-xl">
          <BookOpen size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-pink block mb-0.5">Annu's Daily Tip</span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {activeTip}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 rounded-3xl shimmer" />)}
        </div>
      ) : (
        <>
          {/* 3. Bento Grid Layout */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* BENTO CARD 1: Skin Profile */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between h-72 gradient-border-hover"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand-violet">
                  <Heart size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Skin Profile</span>
                </div>
                <h4 className="text-2xl font-bold text-white capitalize">
                  {user?.skinProfile?.skinType === "unknown" ? "Configure Profile" : `${user?.skinProfile?.skinType} Skin`}
                </h4>
                <p className="text-sm text-dark-muted leading-relaxed font-medium">
                  {user?.skinProfile?.concerns?.length > 0
                    ? `Logged concerns: ${user.skinProfile.concerns.join(", ")}.`
                    : "No concerns logged yet. Start a consultation to analyze your skin type."}
                </p>
              </div>
              {user?.skinProfile?.skinType === "unknown" ? (
                <button
                  onClick={() => navigate("/consultation")}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-brand-violet hover:bg-brand-purple text-white font-bold py-4 rounded-xl text-xs transition-all"
                >
                  <span>Start Consultation</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="text-xs text-dark-muted font-bold uppercase tracking-wider">Status: Optimized</div>
              )}
            </motion.div>

            {/* BENTO CARD 2: Hair Profile */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between h-72 gradient-border-hover"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand-pink">
                  <Activity size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Hair Profile</span>
                </div>
                <h4 className="text-2xl font-bold text-white capitalize">
                  {user?.hairProfile?.hairType === "unknown" ? "Configure Profile" : `${user?.hairProfile?.hairType} Hair`}
                </h4>
                <p className="text-sm text-dark-muted leading-relaxed font-medium">
                  {user?.hairProfile?.concerns?.length > 0
                    ? `Logged concerns: ${user.hairProfile.concerns.join(", ")}.`
                    : "No concerns logged yet. Start a consultation to analyze your hair type."}
                </p>
              </div>
              {user?.hairProfile?.hairType === "unknown" ? (
                <button
                  onClick={() => navigate("/consultation")}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-brand-pink hover:bg-brand-purple text-white font-bold py-4 rounded-xl text-xs transition-all"
                >
                  <span>Start Consultation</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="text-xs text-dark-muted font-bold uppercase tracking-wider">Status: Optimized</div>
              )}
            </motion.div>

            {/* BENTO CARD 3: Daily Progress Ring */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between h-72 gradient-border-hover"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand-blue">
                  <Award size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">Daily Progress</span>
                </div>
                <h4 className="text-2xl font-bold text-white">Routine Check-In</h4>
                <p className="text-xs text-dark-muted font-medium">
                  Complete all morning and night steps to maintain your skin consistency streak.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#1F1A3A" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#8B5CF6"
                      strokeWidth="4.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - completedPercentage / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-white">{completedPercentage}%</span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">{completedSteps.length} of {totalSteps} steps</h5>
                  <span className="text-xs text-dark-muted block mt-0.5 font-medium">Completed today</span>
                </div>
              </div>

              {/* Reminders Row */}
              <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    remindersEnabled
                      ? "bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald"
                      : "bg-white/5 border-white/5 text-dark-muted hover:text-white"
                  }`}
                >
                  <Clock size={10} />
                  <span>{remindersEnabled ? "Reminders On" : "Set Reminders"}</span>
                </button>
                {remindersEnabled && (
                  <div className="flex space-x-1 text-[10px] font-bold text-white items-center">
                    <span className="text-[9px] text-dark-muted font-bold">AM</span>
                    <input
                      type="time"
                      value={amTime}
                      onChange={(e) => handleTimeChange("am", e.target.value)}
                      className="bg-dark-deep border border-dark-border rounded px-1 text-[9px] outline-none w-14 text-center text-white"
                      title="AM Routine Time"
                    />
                    <span className="text-[9px] text-dark-muted font-bold">PM</span>
                    <input
                      type="time"
                      value={pmTime}
                      onChange={(e) => handleTimeChange("pm", e.target.value)}
                      className="bg-dark-deep border border-dark-border rounded px-1 text-[9px] outline-none w-14 text-center text-white"
                      title="PM Routine Time"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* BENTO CARD 4: Custom Routine Stack (Col Span 2) */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/40 md:col-span-2 space-y-6 gradient-border-hover"
            >
              <div className="flex justify-between items-center border-b border-dark-border pb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Clock size={22} className="text-brand-violet" />
                  <span>Active Daily Routine</span>
                </h3>
                <span className="text-[10px] bg-brand-violet/10 text-brand-violet px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                  {latestConsultation ? "Generated by Annu" : "No Routine"}
                </span>
              </div>

              {!latestConsultation ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-dark-muted font-medium">No active routine. Complete a consultation to generate one.</p>
                  <Link to="/consultation" className="text-xs font-bold text-brand-violet hover:underline inline-flex items-center space-x-1">
                    <span>Start Consultation</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Morning Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-brand-violet uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
                      <span>Morning Steps</span>
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {morningRoutine.map((step) => {
                        const stepId = `m-${step.stepNumber}`;
                        const isCompleted = completedSteps.includes(stepId);
                        return (
                          <div
                            key={stepId}
                            onClick={() => toggleStepCompleted(stepId)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 text-sm ${
                              isCompleted
                                ? "bg-brand-violet/5 border-brand-violet/20 text-dark-muted"
                                : "glass-light border-white/5 text-white hover:border-brand-violet/20"
                            }`}
                          >
                            <button className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-all ${
                              isCompleted ? "bg-brand-violet border-brand-violet text-white" : "border-dark-muted"
                            }`}>
                              {isCompleted && <Check size={10} />}
                            </button>
                            <div>
                              <h5 className={`font-bold ${isCompleted ? "line-through" : ""}`}>{step.productName}</h5>
                              <p className="text-xs text-dark-muted mt-1 leading-relaxed font-medium">{step.instructions}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Night Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-brand-pink uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                      <span>Night Steps</span>
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {nightRoutine.map((step) => {
                        const stepId = `n-${step.stepNumber}`;
                        const isCompleted = completedSteps.includes(stepId);
                        return (
                          <div
                            key={stepId}
                            onClick={() => toggleStepCompleted(stepId)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 text-sm ${
                              isCompleted
                                ? "bg-brand-pink/5 border-brand-pink/20 text-dark-muted"
                                : "glass-light border-white/5 text-white hover:border-brand-pink/20"
                            }`}
                          >
                            <button className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-all ${
                              isCompleted ? "bg-brand-pink border-brand-pink text-white" : "border-dark-muted"
                            }`}>
                              {isCompleted && <Check size={10} />}
                            </button>
                            <div>
                              <h5 className={`font-bold ${isCompleted ? "line-through" : ""}`}>{step.productName}</h5>
                              <p className="text-xs text-dark-muted mt-1 leading-relaxed font-medium">{step.instructions}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* BENTO CARD 5: Latest Progress Log */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between h-[390px] gradient-border-hover"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-dark-border pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Camera size={16} className="text-brand-pink" />
                    <span>Progress Log</span>
                  </h3>
                  <Link to="/progress" className="text-xs text-brand-pink hover:underline font-bold">View All</Link>
                </div>

                {!latestProgress ? (
                  <div className="text-center py-14 space-y-3">
                    <p className="text-sm text-dark-muted">No progress photos logged yet.</p>
                    <Link
                      to="/progress"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-brand-pink hover:underline"
                    >
                      <span>Upload first photo</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-dark-border bg-dark-deep">
                      <img
                        src={latestProgress.photoUrl}
                        alt="latest progress"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed italic font-medium">
                      "{latestProgress.notes || "No notes logged."}"
                    </p>
                  </div>
                )}
              </div>

              {latestProgress && (
                <div className="flex justify-between items-center text-xs text-dark-muted font-bold uppercase tracking-wider pt-3 border-t border-dark-border/50">
                  <span>Logged: {new Date(latestProgress.date).toLocaleDateString()}</span>
                  <span className="text-brand-violet">Skin: {latestProgress.skinRating}/10</span>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* 4. Interactive Product Suggester Widget with Price Comparison & Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/5 rounded-full filter blur-3xl pointer-events-none" />

            <div className="border-b border-dark-border pb-5 space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <ShoppingBag className="text-brand-violet" size={24} />
                  <span>AI Product Suggester & Price Compare</span>
                </h3>
                <p className="text-sm text-dark-muted font-medium">
                  Real-time price comparisons and consumer reviews for your concerns.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
                {/* Suggester Tabs */}
                <div className="flex flex-wrap gap-2 bg-dark-deep/65 border border-dark-border p-1.5 rounded-2xl">
                  {Object.keys(productSuggestions).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveSuggesterTab(key)}
                      className={`text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all ${
                        activeSuggesterTab === key
                          ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/15"
                          : "text-dark-muted hover:text-white"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Budget Selector Tabs */}
                <div className="flex bg-dark-deep/65 border border-dark-border p-1.5 rounded-2xl">
                  {[
                    { id: "low", label: "Drugstore" },
                    { id: "medium", label: "Mid-Range" },
                    { id: "high", label: "Premium" }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBudget(b.id)}
                      className={`text-xs px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all ${
                        activeBudget === b.id
                          ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/15"
                          : "text-dark-muted hover:text-white"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {productSuggestions[activeSuggesterTab][activeBudget].map((prod, index) => (
                  <motion.div
                    key={prod.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="glass-light rounded-2xl p-6 border border-white/5 flex flex-col justify-between min-h-[420px] h-full hover:border-brand-violet/35 transition-all duration-300 relative group"
                  >
                    <div className="space-y-3">
                      {/* Brand & Stars */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-brand-pink font-bold uppercase tracking-widest">
                          {prod.brand}
                        </span>
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-dark-muted font-medium">({prod.reviews})</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h4 className="text-base font-bold text-white group-hover:text-brand-violet transition-colors">
                        {prod.name}
                      </h4>

                      {/* Active Ingredients */}
                      <div className="text-[10px] text-brand-violet bg-brand-violet/5 px-2.5 py-1 rounded-lg border border-brand-violet/15 inline-block font-semibold">
                        {prod.ingredients}
                      </div>

                      {/* Product Description */}
                      <p className="text-xs text-dark-muted font-medium leading-relaxed line-clamp-3">
                        {prod.feedback}
                      </p>
                    </div>

                    {/* Price Comparison & Direct Buying Buttons */}
                    <div className="space-y-3.5 pt-4 border-t border-dark-border/40 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center space-x-4">
                          <span className="text-amber-500">Amazon: {prod.priceAmazon}</span>
                          <span className="text-brand-pink">Nykaa: {prod.priceNykaa}</span>
                        </div>
                        {prod.bestDeal !== "equal" ? (
                          <span className="inline-flex items-center space-x-1 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider animate-pulse">
                            <TrendingDown size={10} />
                            <span>Save on {prod.bestDeal}</span>
                          </span>
                        ) : (
                          <span className="bg-white/5 text-dark-muted border border-white/5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                            Same Price
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={prod.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 rounded-xl transition-all ${
                            prod.bestDeal === "amazon"
                              ? "bg-amber-500 text-dark-deep hover:bg-amber-600 shadow-lg shadow-amber-500/10"
                              : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400"
                          }`}
                        >
                          <span>Buy on Amazon</span>
                          <ExternalLink size={10} />
                        </a>
                        <a
                          href={prod.nykaaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 rounded-xl transition-all ${
                            prod.bestDeal === "nykaa"
                              ? "bg-brand-pink text-white hover:bg-brand-purple shadow-lg shadow-brand-pink/15"
                              : "bg-brand-pink/10 hover:bg-brand-pink/20 border border-brand-pink/20 text-brand-pink"
                          }`}
                        >
                          <span>Buy on Nykaa</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

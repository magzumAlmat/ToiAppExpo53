
// import { Dimensions } from "react-native";

// export const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const COLORS = {
  primary: "#FF6F61",
  secondary: "#4A90E2",
  background: "#FDFDFD",
  card: "#FFFFFF",
  textPrimary: "#2D3748",
  textSecondary: "#718096",
  accent: "#FBBF24",
  shadow: "rgba(0, 0, 0, 0.3)",
  error: "#FF0000",
  white: "#FFFFFF",
  buttonGradientStart: "#D3C5B7",
  buttonGradientEnd: "#A68A6E",
};

export const typeOrder = {
  restaurant: 1,
  clothing: 2,
  tamada: 3,
  program: 4,
  traditionalGift: 5,
  flowers: 6,
  transport: 7,
  cake: 8,
  alcohol: 9,
  goods: 10,
  jewelry: 11,
};

export const typesMapping = [
  { key: "clothing", costField: "cost", type: "clothing", label: "Одежда" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Тамада" },
  { key: "programs", costField: "cost", type: "program", label: "Программа" },
  {
    key: "traditionalGifts",
    costField: "cost",
    type: "traditionalGift",
    label: "Традиционные подарки",
  },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  { key: "transport", costField: "cost", type: "transport", label: "Транспорт" },
  {
    key: "restaurants",
    costField: "averageCost",
    type: "restaurant",
    label: "Ресторан",
  },
  { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
];

export const categoryToTypeMap = {
  Ведущий: "tamada",
  Ресторан: "restaurant",
  Алкоголь: "alcohol",
  "Шоу программа": "program",
  "Ювелирные изделия": "jewelry",
  "Традиционные подарки": "traditionalGift",
  "Свадебный салон": "clothing",
  "Прокат авто": "transport",
  Торты: "cake",
  Цветы: "flowers",
};

export const typeToCategoryMap = Object.fromEntries(
  Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
);

export const categoryIcons = {
  Цветы: {
    on: require("../../assets/cvetyOn.png"),
    off: require("../../assets/cvetyOff.png"),
  },
  "Прокат авто": {
    on: require("../../assets/prokatAvtoOn.png"),
    off: require("../../assets/prokatAutooff.png"),
  },
  "Шоу программа": {
    on: require("../../assets/show.png"),
    off: require("../../assets/showTurnOff.png"),
  },
  Ресторан: {
    on: require("../../assets/restaurantOn.png"),
    off: require("../../assets/restaurantTurnOff.png"),
  },
  Ведущий: {
    on: require("../../assets/vedushieOn.png"),
    off: require("../../assets/vedushieOff.png"),
  },
  "Традиционные подарки": {
    on: require("../../assets/tradGiftsOn.png"),
    off: require("../../assets/tradGifts.png"),
  },
  "Свадебный салон": {
    on: require("../../assets/svadebnyisalon.png"),
    off: require("../../assets/svadeblyisalonOff.png"),
  },
  Алкоголь: {
    on: require("../../assets/alcoholOn.png"),
    off: require("../../assets/alcoholOff.png"),
  },
  "Ювелирные изделия": {
    on: require("../../assets/uvizdeliyaOn.png"),
    off: require("../../assets/uvIzdeliyaOff.png"),
  },
  Торты: {
    on: require("../../assets/torty.png"),
    off: require("../../assets/tortyTurnOff.png"),
  },
};
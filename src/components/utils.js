import api from "../api/api";

export const formatBudget = (input) => {
  const cleaned = input.replace(/[^\d]/g, "");
  const formatted =
    cleaned
      .split("")
      .reverse()
      .join("")
      .match(/.{1,3}/g)
      ?.join(" ")
      .split("")
      .reverse()
      .join("") || cleaned;
  return formatted;
};

export const fetchAllBlockedDays = async (setBlockedDays) => {
  try {
    const response = await api.fetchAllBlockDays();
    const blockedDays = {};
    response.data.forEach((entry) => {
      const { date, restaurantId, restaurantName } = entry;
      if (!blockedDays[date]) {
        blockedDays[date] = { marked: true, dots: [] };
      }
      blockedDays[date].dots.push({ restaurantId, restaurantName });
    });
    setBlockedDays(blockedDays);
  } catch (error) {
    console.error("Ошибка загрузки заблокированных дней:", error.message);
  }
};
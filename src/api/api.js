

// api.js (Frontend API Client)
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { env } from '../config/env';
import Constants from 'expo-constants';

// Берем URL из EAS Build (TestFlight / App Store)
const API_BASE_URL = env.API_baseURL;

if (!API_BASE_URL) {
  console.error('API_BASE_URL не найден! Проверь app.config.js и eas.json');
}





// Axios инстанс
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Создание экземпляра axios
// const api = axios.create({
//   baseURL: `${process.env.EXPO_PUBLIC_API_baseURL}`,
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
//   },
// });

// Интерцептор запроса для добавления токена
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Ресурсы и их эндпоинты
const resources = {
  jewelry: { path: 'jewelry', singular: 'jewelry' },
  clothing: { path: 'clothing', singular: 'clothing' },
  transport: { path: 'transport', singular: 'transport' },
  tamada: { path: 'tamada', singular: 'tamada' },
  program: { path: 'program', singular: 'program' },
  traditionalGift: { path: 'traditional-gift', singular: 'traditional-gift' },
  flowers: { path: 'flowers', singular: 'flowers' },
  cakes: { path: 'cakes', singular: 'cake', getAllPath: 'cake', getByIdPath: 'cake' },
  alcohol: { path: 'alcohol', singular: 'alcohol' },
  restaurants: { path: 'restaurants', singular: 'restaurant', createPath: 'restaurant', getByIdPath: 'restaurantbyid', updatePath: 'restaurant', deletePath: 'restaurant' },
  goods: { path: 'goods', singular: 'good' }, // Standardized
  weddings: { path: 'weddings', singular: 'wedding', createPath: 'createwedding' }, // Uses /createwedding
  eventCategories: { path: 'event-categories', singular: 'event-category' }, // Not in router
  wishlist: { path: 'wishlist', singular: 'wishlist' }, // Not in router
};

// Универсальная функция для обработки ошибок
const handleError = (error, action, resource = '') => {
  const message = error.response?.data?.message || error.message;
  throw new Error(`Ошибка ${action} ${resource}: ${message}`);
};

// Универсальные CRUD-методы для ресурсов
const createResourceMethods = () => {
  const methods = {};

  Object.entries(resources).forEach(([key, { path, singular = key, getAllPath = path, getByIdPath = path, createPath = path, updatePath = path, deletePath = path }]) => {
    methods[`create${key.charAt(0).toUpperCase() + key.slice(1)}`] = (data) =>
      api.post(`/api/${createPath}`, data).catch((error) => handleError(error, 'создания', singular));

    methods[`get${key.charAt(0).toUpperCase() + key.slice(1)}`] = () =>
      api.get(`/api/${getAllPath}`).catch((error) => handleError(error, 'получения списка', singular));

    methods[`get${key.charAt(0).toUpperCase() + key.slice(1)}ById`] = (id) =>
      api.get(`/api/${getByIdPath}/${id}`).catch((error) => handleError(error, 'получения', singular));

    methods[`update${key.charAt(0).toUpperCase() + key.slice(1)}`] = (id, data) =>
      api.put(`/api/${updatePath}/${id}`, data).catch((error) => handleError(error, 'обновления', singular));

    methods[`delete${key.charAt(0).toUpperCase() + key.slice(1)}`] = (id) =>
      api.delete(`/api/${deletePath}/${id}`).catch((error) => handleError(error, 'удаления', singular));
  });

  return methods;
};

// API методы
export default {
  // Аутентификация и профиль
  register: (userData) =>
    api.post('/api/register', userData).catch((error) => {
      // Перебрасываем оригинальную ошибку, чтобы сохранить детали ответа
      throw error;
    }),

  login: (credentials) =>
    api.post('/api/auth/login', credentials).catch((error) => handleError(error, 'входа')),

  getUser: () =>
    api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => handleError(error, 'получения данных пользователя')),

  setToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  updateProfile: (data) =>
    api.post('/api/auth/addfullprofile', data).catch((error) => handleError(error, 'обновления профиля')),

  getProfile: () =>
    api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => handleError(error, 'получения профиля')),

  // Универсальные CRUD-методы
  ...createResourceMethods(),

  // Специфические методы для категорий мероприятий (не в роутере, требует проверки)
  createEventCategory: (data) =>
    api.post('/api/event-category', data).catch((error) => handleError(error, 'создания категории мероприятия')),

  getEventCategories: () =>
    api.get('/api/event-categories').catch((error) => handleError(error, 'получения списка категорий мероприятий')),

  getEventCategoryById: (id) =>
    api.get(`/api/event-category/${id}`).catch((error) => handleError(error, 'получения категории мероприятия')),

  getEventCategoryWithServices: (id) =>
    api.get(`/api/event-category/${id}/services`).catch((error) => handleError(error, 'получения категории мероприятия с услугами')),

  updateEventCategory: (id, data) =>
    api.put(`/api/event-category/${id}`, data).catch((error) => handleError(error, 'обновления категории мероприятия')),

  deleteEventCategory: (id) =>
    api.delete(`/api/event-category/${id}`).catch((error) => handleError(error, 'удаления категории мероприятия')),

  updateEventCategoryTotalCost: (id, data) =>
    api.patch(`/api/event-category/${id}/total_cost`, data).catch((error) => {
      throw new Error(`Ошибка обновления общей суммы категории мероприятия: ${error.response?.data?.message || error.message}`);
    }),

  updateEventCategoryPaidAmount: (id, data) =>
    api.patch(`/api/event-category/${id}/paid_amount`, data).catch((error) => {
      throw new Error(`Ошибка обновления потраченной суммы категории мероприятия: ${error.response?.data?.message || error.message}`);
    }),

  updateEventCategoryRemainingBalance: (id, data) =>
    api.patch(`/api/event-category/${id}/remaining_balance`, data).catch((error) => {
      throw new Error(`Ошибка обновления остатка категории мероприятия: ${error.response?.data?.message || error.message}`);
    }),

  updateEventCategoryBudget: (id, data) =>
    api.patch(`/api/event-category/${id}/budget`, data).catch((error) => {
      throw new Error(`Ошибка обновления бюджета категории мероприятия: ${error.response?.data?.message || error.message}`);
    }),

  addServicesToCategory: (categoryId, data) =>
    api.post(`/api/event-category/${categoryId}/services`, data).catch((error) => handleError(error, 'добавления услуг к категории')),

  updateServicesForCategory: (categoryId, data) =>
    api.put(`/api/event-category/${categoryId}/services`, data).catch((error) => handleError(error, 'обновления услуг для категории')),

  addServiceToCategory: (categoryId, data, token) =>
    api.post(`/api/event-category/${categoryId}/service`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).catch((error) => handleError(error, 'добавления услуги к категории')),

  removeServiceFromCategory: (categoryId, serviceId, data) =>
    api.delete(`/api/event-category/${categoryId}/service/${serviceId}`, { data }).catch((error) => handleError(error, 'удаления услуги из категории')),

  createGood: (data) =>
    api.post('/api/goods', data).catch((error) => {
      throw new Error(`Ошибка создания товара: ${error.response?.data?.message || error.message}`);
    }),

  getGoods: () =>
    api.get('/api/goods').catch((error) => {
      throw new Error(`Ошибка получения списка товаров: ${error.response?.data?.message || error.message}`);
    }),

  getGoodById: (id) =>
    api.get(`/api/goodbyid/${id}`).catch((error) => {
      throw new Error(`Ошибка получения товара: ${error.response?.data?.message || error.message}`);
    }),

  updateGoodById: (id, data) =>
    api.put(`/api/updategoodbyid/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления товара: ${error.response?.data?.message || error.message}`);
    }),

  deleteGood: (id) =>
    api.delete(`/api/removegoodbyid/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления товара: ${error.response?.data?.message || error.message}`);
    }),

  // Получить все доступные услуги (не в роутере, требует проверки)
  getServices: () =>
    api.get('/api/services').catch((error) => handleError(error, 'получения списка услуг')),

  // Специфические методы для списка желаний (не в роутере, требует проверки)
  createWish: (wishlistData) =>
    api.post('/api/wishlist', wishlistData).catch((error) => handleError(error, 'создания желания')),

  getWishlistByWeddingId: (weddingId) =>
    api.get(`/api/wishlist/wedding/${weddingId}`).catch((error) => handleError(error, 'получения списка желаний')),

  getWishlistByWeddingIdWithoutToken: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => handleError(error, 'получения списка желаний без токена')),

  getWishlistByEventCategoryId: (categoryId) =>
    api.get(`/api/wishlist/eventcategory/${categoryId}`).catch((error) => handleError(error, 'получения списка желаний категории')),

  reserveWishlistItem: (id) =>
    api.patch(`/api/wishlist/${id}/reserve`, {}).catch((error) => handleError(error, 'резервирования желания')),

  reserveWishlistItemWithoutToken: (id, data) =>
    api.patch(`/api/wishlist/${id}/reservebyunknown`, { data }).catch((error) => handleError(error, 'резервирования желания без токена')),

  // Блокировка дат (не в роутере, требует проверки)
  addDataBlockToRestaurant: (restaurantId, date) =>
    api
      .post('/api/block', {
        restaurantId,
        date: date.toISOString().split('T')[0],
      })
      .catch((error) => handleError(error, 'блокировки даты ресторана')),

  fetchBlockedDaysByRestaurantId: (id) =>
    api.get(`/api/${id}/blocked-days`).catch((error) => handleError(error, 'получения заблокированных дат')),

  fetchAllBlockedDays: () =>
    api.get('/api/all-blocked-days').catch((error) => handleError(error, 'получения всех заблокированных дат')),

  // Универсальный метод для получения данных
  fetchByEndpoint: (endpoint) =>
    api.get(endpoint).catch((error) => handleError(error, 'получения данных по эндпоинту', endpoint)),

  getCakeById: (id) =>
    api.get(`/api/cake/${id}`).catch((error) => {
      throw new Error(`Ошибка получения торта: ${error.response?.data?.message || error.message}`);
    }),

  getCakes: () =>
    api.get('/api/cake').catch((error) => {
      throw new Error(`Ошибка получения списка тортов: ${error.response?.data?.message || error.message}`);
    }),

  createRestaurant: (data) =>
    api.post('/api/restaurant', data).catch((error) => {
      throw new Error(`Ошибка создания ресторана: ${error.response?.data?.message || error.message}`);
    }),

  createJewelry: (data) =>
    api.post('/api/jewelry', data).catch((error) => {
      throw new Error(`Ошибка создания ювелирного изделия: ${error.response?.data?.message || error.message}`);
    }),

  updateRestaurant: (id, data) =>
    api.put(`/api/restaurant/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления ресторана: ${error.response?.data?.message || error.message}`);
    }),

  deleteRestaurant: (id) =>
    api.delete(`/api/restaurant/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления ресторана: ${error.response?.data?.message || error.message}`);
    }),

  getRestaurantById: (id) =>
    api.get(`/api/restaurantbyid/${id}`).catch((error) => {
      if (error.response?.status === 404) {
        return api.get(`/api/restaurantbyid/${id}`).catch((innerError) => {
          throw new Error(`Ошибка получения ресторана: ${innerError.response?.data?.message || innerError.message}`);
        });
      }
      throw new Error(`Ошибка получения ресторана: ${error.response?.data?.message || error.message}`);
    }),

  getRestaurants: () =>
    api.get('/api/restaurants').catch((error) => {
      throw new Error(`Ошибка получения списка ресторанов: ${error.response?.data?.message || error.message}`);
    }),

  createWedding: (data) =>
    api.post('/api/weddings/addwedding', data).catch((error) => {
      throw new Error(`Ошибка создания свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  getWeddingById: (id) =>
    api.get(`/api/weddings/${id}`).catch((error) => {
      throw new Error(`Ошибка получения свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  getWedding: () =>
    api.get('/api/getallweddings').catch((error) => {
      throw new Error(`Ошибка получения списка свадеб: ${error.response?.data?.message || error.message}`);
    }),

  updateWedding: (id, data) =>
    api.put(`/api/updateweddingbyid/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  deleteWedding: (id) =>
    api.delete(`/api/weddings/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingTotalCost: (id, data) =>
    api.patch(`/api/weddings/${id}/total_cost`, data).catch((error) => {
      throw new Error(`Ошибка обновления общей суммы свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingPaidAmount: (id, data) =>
    api.patch(`/api/weddings/${id}/paid_amount`, data).catch((error) => {
      throw new Error(`Ошибка обновления потраченной суммы свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingRemainingBalance: (id, data) =>
    api.patch(`/api/weddings/${id}/remaining_balance`, data).catch((error) => {
      throw new Error(`Ошибка обновления остатка свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingBudget: (id, data) =>
    api.patch(`/api/weddings/${id}/budget`, data).catch((error) => {
      throw new Error(`Ошибка обновления бюджета свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  getWeddingItems: (id) =>
    api.get(`/api/wedding-items/${id}`).catch((error) => {
      throw new Error(`Ошибка получения элементов свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  deleteWeddingItem: (id) =>
    api.delete(`/api/wedding-items/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления элемента свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  // Список желаний
  createWish: (wishlistData) =>
    api.post('/api/wishlist', wishlistData).catch((error) => {
      throw new Error(`Ошибка создания желания: ${error.response?.data?.message || error.message}`);
    }),

  getWishlistByWeddingId: (weddingId) =>
    api.get(`/api/wishlist/wedding/${weddingId}`).catch((error) => {
      throw new Error(`Ошибка получения списка желаний: ${error.response?.data?.message || error.message}`);
    }),

  getWishlistByWeddingIdWithoutToken: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => {
      throw new Error(`Ошибка получения списка желаний без токена: ${error.response?.data?.message || error.message}`);
    }),

  reserveWishlistItem: (id) =>
    api.patch(`/api/wishlist/${id}/reserve`, {}).catch((error) => {
      throw new Error(`Ошибка резервирования желания: ${error.response?.data?.message || error.message}`);
    }),

  reserveWishlistItemWithoutToken: (id, data) =>
    api.patch(`/api/wishlist/${id}/reservebyunknown`, { data }).catch((error) => {
      throw new Error(`Ошибка резервирования желания без токена: ${error.response?.data?.message || error.message}`);
    }),

  // Блокировка дат
  addDataBlockToRestaurant: (restaurantId, date) =>
    api
      .post('/api/block', {
        restaurantId,
        date: date.toISOString().split('T')[0],
      })
      .catch((error) => {
        throw new Error(`Ошибка блокировки даты ресторана: ${error.response?.data?.message || error.message}`);
      }),

  fetchBlockedDaysByRestaurantId: (id) =>
    api.get(`/api/${id}/blocked-days`).catch((error) => {
      throw new Error(`Ошибка получения заблокированных дат: ${error.response?.data?.message || error.message}`);
    }),

  fetchAllBlockedDays: () =>
    api.get('/api/all-blocked-days').catch((error) => {
      throw new Error(`Ошибка получения всех заблокированных дат: ${error.response?.data?.message || error.message}`);
    }),

  // Универсальный метод для получения данных
  fetchByEndpoint: (endpoint) =>
    api.get(endpoint).catch((error) => {
      throw new Error(`Ошибка получения данных по эндпоинту ${endpoint}: ${error.response?.data?.message || error.message}`);
    }),

  getWeddingById: (id) =>
    api.get(`/api/weddings/${id}`).catch((error) => {
      throw new Error(`Ошибка получения свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  getWedding: () =>
    api.get('/api/getallweddings').catch((error) => {
      throw new Error(`Ошибка получения списка свадеб: ${error.response?.data?.message || error.message}`);
    }),

  updateWedding: (id, data) =>
    api.put(`/api/updateweddingbyid/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  deleteWedding: (id) =>
    api.delete(`/api/weddings/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingTotalCost: (id, data) =>
    api.patch(`/api/weddings/${id}/total_cost`, data).catch((error) => {
      throw new Error(`Ошибка обновления общей суммы свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingPaidAmount: (id, data) =>
    api.patch(`/api/weddings/${id}/paid_amount`, data).catch((error) => {
      throw new Error(`Ошибка обновления потраченной суммы свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  updateWeddingRemainingBalance: (id, data) =>
    api.patch(`/api/weddings/${id}/remaining_balance`, data).catch((error) => {
      throw new Error(`Ошибка обновления остатка свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  getWeddingItems: (id) =>
    api.get(`/api/wedding-items/${id}`).catch((error) => {
      throw new Error(`Ошибка получения элементов свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  deleteWeddingItem: (id) =>
    api.delete(`/api/wedding-items/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления элемента свадьбы: ${error.response?.data?.message || error.message}`);
    }),

  // Список желаний
  createWish: (wishlistData) =>
    api.post('/api/wishlist', wishlistData).catch((error) => {
      throw new Error(`Ошибка создания желания: ${error.response?.data?.message || error.message}`);
    }),

  getWishlistByWeddingId: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => {
      throw new Error(`Ошибка получения списка желаний: ${error.response?.data?.message || error.message}`);
    }),

  getWishlistByWeddingIdWithoutToken: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => {
      throw new Error(`Ошибка получения списка желаний без токена: ${error.response?.data?.message || error.message}`);
    }),

  reserveWishlistItem: (id) =>
    api.patch(`/api/wishlist/${id}/reserve`, {}).catch((error) => {
      throw new Error(`Ошибка резервирования желания: ${error.response?.data?.message || error.message}`);
    }),

  reserveWishlistItemWithoutToken: (id, data) =>
    api.patch(`/api/wishlist/${id}/reservebyunknown`, { data }).catch((error) => {
      throw new Error(`Ошибка резервирования желания без токена: ${error.response?.data?.message || error.message}`);
    }),

  createTraditionalGift: (data) =>
    api.post('/api/traditional-gift', data).catch((error) => {
      throw new Error(`Ошибка создания подарка: ${error.response?.data?.message || error.message}`);
    }),

  getTraditionalGifts: () =>
    api.get('/api/traditional-gift').catch((error) => {
      throw new Error(`Ошибка получения списка подарков: ${error.response?.data?.message || error.message}`);
    }),

  deleteTraditionalGift: (id) =>
    api.delete(`/api/traditional-gift/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления подарка: ${error.response?.data?.message || error.message}`);
    }),

  getTraditionalGiftById: (id) =>
    api.get(`/api/traditional-gift/${id}`).catch((error) => {
      throw new Error(`Ошибка получения подарка: ${error.response?.data?.message || error.message}`);
    }),

  updateTraditionalGift: (id, data) =>
    api.put(`/api/traditional-gift/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления подарка: ${error.response?.data?.message || error.message}`);
    }),

  createTechnicalEquipmentRental: (data) =>
    api.post('/api/technical-equipment-rental', data).catch((error) => {
      throw new Error(`Ошибка создания аренды технического оснащения: ${error.response?.data?.message || error.message}`);
    }),

  getTechnicalEquipmentRentals: () =>
    api.get('/api/technical-equipment-rentals').catch((error) => {
      throw new Error(`Ошибка получения списка аренд технического оснащения: ${error.response?.data?.message || error.message}`);
    }),

  deleteTechnicalEquipmentRental: (id) =>
    api.delete(`/api/technical-equipment-rental/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления аренды технического оснащения: ${error.response?.data?.message || error.message}`);
    }),

  getTechnicalEquipmentRentalById: (id) =>
    api.get(`/api/technical-equipment-rental/${id}`).catch((error) => {
      throw new Error(`Ошибка получения аренды технического оснащения: ${error.response?.data?.message || error.message}`);
    }),

  updateTechnicalEquipmentRental: (id, data) =>
    api.put(`/api/technical-equipment-rental/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления аренды технического оснащения: ${error.response?.data?.message || error.message}`);
    }),

  createTypography: (data) =>
    api.post('/api/typography', data).catch((error) => {
      throw new Error(`Ошибка создания типографии: ${error.response?.data?.message || error.message}`);
    }),

  getTypographies: () =>
    api.get('/api/typographies').catch((error) => {
      throw new Error(`Ошибка получения списка типографий: ${error.response?.data?.message || error.message}`);
    }),

  deleteTypography: (id) =>
    api.delete(`/api/typography/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления типографии: ${error.response?.data?.message || error.message}`);
    }),

  getTypographyById: (id) =>
    api.get(`/api/typography/${id}`).catch((error) => {
      throw new Error(`Ошибка получения типографии: ${error.response?.data?.message || error.message}`);
    }),

  updateTypography: (id, data) =>
    api.put(`/api/typography/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления типографии: ${error.response?.data?.message || error.message}`);
    }),

  createProgram: (data) =>
    api.post('/api/program', data).catch((error) => {
      throw new Error(`Ошибка создания программы: ${error.response?.data?.message || error.message}`);
    }),

  getPrograms: () =>
    api.get('/api/program').catch((error) => {
      throw new Error(`Ошибка получения списка программ: ${error.response?.data?.message || error.message}`);
    }),

  deleteProgram: (id) =>
    api.delete(`/api/program/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления программы: ${error.response?.data?.message || error.message}`);
    }),

  getProgramById: (id) =>
    api.get(`/api/program/${id}`).catch((error) => {
      throw new Error(`Ошибка получения программы: ${error.response?.data?.message || error.message}`);
    }),

  updateProgram: (id, data) =>
    api.put(`/api/program/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления программы: ${error.response?.data?.message || error.message}`);
    }),

  // Торты
  createCake: (data) =>
    api.post('/api/cakes', data).catch((error) => {
      throw new Error(`Ошибка создания торта: ${error.response?.data?.message || error.message}`);
    }),

  createHotel: (data) =>
    api.post('/api/hotel', data).catch((error) => {
      throw new Error(`Ошибка создания гостиницы: ${error.response?.data?.message || error.message}`);
    }),

  getHotels: () =>
    api.get('/api/hotels').catch((error) => {
      throw new Error(`Ошибка получения списка гостиниц: ${error.response?.data?.message || error.message}`);
    }),

  deleteHotel: (id) =>
    api.delete(`/api/hotel/${id}`).catch((error) => {
      throw new Error(`Ошибка удаления гостиницы: ${error.response?.data?.message || error.message}`);
    }),

  getHotelById: (id) =>
    api.get(`/api/hotel/${id}`).catch((error) => {
      throw new Error(`Ошибка получения гостиницы: ${error.response?.data?.message || error.message}`);
    }),

  updateHotel: (id, data) =>
    api.put(`/api/hotel/${id}`, data).catch((error) => {
      throw new Error(`Ошибка обновления гостиницы: ${error.response?.data?.message || error.message}`);
    }),

  getPlaceholderService: (serviceType, token) =>
    api.get(`/api/placeholder-service?type=${serviceType}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => {
      if (error.response?.status === 404) {
        return { data: {} }; // Return empty object if not found
      }
      throw new Error(`Ошибка получения placeholder: ${error.response?.data?.message || error.message}`);
    }),

  createPlaceholderService: (data, token) =>
    api.post('/api/placeholder-service', data, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => {
      throw new Error(`Ошибка создания placeholder: ${error.response?.data?.message || error.message}`);
    }),




// В конце api.js замени все новые методы на эти (временные алиасы):

// Вместо /events → используем старый /getallweddings и /weddings
getEvents: async (token) => {
  return api.get('/api/getallweddings', {
    headers: { Authorization: `Bearer ${token}` },
  });
},

// Вместо /events/${id}/items → старый /api/wedding-items/${id}
getEventItems: (eventId, token) => {
  return api.get(`/api/wedding-items/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
},

createEvent: (data, token) => {
  return api.post('/api/weddings/addwedding', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
},

updateEvent: (eventId, token, data) => {
  return api.put(`/api/updateweddingbyid/${eventId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
},

deleteEvent: (eventId, token) => {
  return api.delete(`/api/weddings/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
},

deleteEventItem: (itemId, token) => {
  return api.delete(`/api/wedding-items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
},

}

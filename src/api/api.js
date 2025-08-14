// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const api = axios.create({
//   baseURL: `${process.env.EXPO_PUBLIC_API_baseURL}`,
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`
//   },
// });

// // Интерцептор запроса для добавления токена
// api.interceptors.request.use(
//   async (config) => {
//     const token = await SecureStore.getItemAsync('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // API методы
// export default {
//   // Аутентификация и профиль

//    register: (userData) =>
//     api.post('/api/register', userData).catch((error) => {
//       throw new Error(`Ошибка регистрации: ${error.response?.data?.message || error.message}`);
//     }),

//   login: (credentials) =>
//     api.post('/api/auth/login', credentials).catch((error) => {
//       throw new Error(`Ошибка входа: ${error.response?.data?.message || error.message}`);
//     }),

//   getUser: () =>
//     api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => {
//       throw new Error(`Ошибка получения данных пользователя: ${error.response?.data?.message || error.message}`);
//     }),

//   setToken: (token) => {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   },

//   updateProfile: (data) =>
//     api.post('/api/auth/addfullprofile', data).catch((error) => {
//       throw new Error(`Ошибка обновления профиля: ${error.response?.data?.message || error.message}`);
//     }),

//   getProfile: () =>
//     api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => {
//       throw new Error(`Ошибка получения профиля: ${error.response?.data?.message || error.message}`);
//     }),


//   register: (userData) =>
//     api.post('/api/register', userData).catch((error) => {
//       throw new Error(`Ошибка регистрации: ${error.response?.data?.message || error.message}`);
//     }),

//   login: (credentials) =>
//     api.post('/api/auth/login', credentials).catch((error) => {
//       throw new Error(`Ошибка входа: ${error.response?.data?.message || error.message}`);
//     }),

//   getUser: () =>
//     api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => {
//       throw new Error(`Ошибка получения данных пользователя: ${error.response?.data?.message || error.message}`);
//     }),

//   setToken: (token) => {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   },

//   updateProfile: (data) =>
//     api.post('/api/auth/addfullprofile', data).catch((error) => {
//       throw new Error(`Ошибка обновления профиля: ${error.response?.data?.message || error.message}`);
//     }),

//   getProfile: () =>
//     api.get('/api/auth/getAuthentificatedUserInfo').catch((error) => {
//       throw new Error(`Ошибка получения профиля: ${error.response?.data?.message || error.message}`);
//     }),

//   // Рестораны
//   createRestaurant: (data) =>
//     api.post('/api/restaurant', data).catch((error) => {
//       throw new Error(`Ошибка создания ресторана: ${error.response?.data?.message || error.message}`);
//     }),

//   updateRestaurant: (id, data) =>
//     api.put(`/api/restaurant/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления ресторана: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteRestaurant: (id) =>
//     api.delete(`/api/restaurant/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления ресторана: ${error.response?.data?.message || error.message}`);
//     }),

//    getRestaurantById: (id) =>
//     api.get(`/api/restaurantbyid/${id}`).catch((error) => {
//       if (error.response?.status === 404) {
//         return api.get(`/api/restaurantbyid/${id}`).catch((innerError) => {
//           throw new Error(`Ошибка получения ресторана: ${innerError.response?.data?.message || innerError.message}`);
//         });
//       }
//       throw new Error(`Ошибка получения ресторана: ${error.response?.data?.message || error.message}`);
//     }),

//   getRestaurants: () =>
//     api.get('/api/restaurants').catch((error) => {
//       throw new Error(`Ошибка получения списка ресторанов: ${error.response?.data?.message || error.message}`);
//     }),

//   // Одежда
//   createClothing: (data) =>
//     api.post('/api/clothing', data).catch((error) => {
//       throw new Error(`Ошибка создания одежды: ${error.response?.data?.message || error.message}`);
//     }),

//   getClothing: () =>
//     api.get('/api/clothing').catch((error) => {
//       throw new Error(`Ошибка получения списка одежды: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteClothing: (id) =>
//     api.delete(`/api/clothing/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления одежды: ${error.response?.data?.message || error.message}`);
//     }),

//   getClothingById: (id) =>
//     api.get(`/api/clothing/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения одежды: ${error.response?.data?.message || error.message}`);
//     }),

//   updateClothing: (id, data) =>
//     api.put(`/api/clothing/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления одежды: ${error.response?.data?.message || error.message}`);
//     }),

//   // Транспорт
//   createTransport: (data) =>
//     api.post('/api/transport', data).catch((error) => {
//       throw new Error(`Ошибка создания транспорта: ${error.response?.data?.message || error.message}`);
//     }),

//   getTransport: () =>
//     api.get('/api/transport').catch((error) => {
//       throw new Error(`Ошибка получения списка транспорта: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteTransport: (id) =>
//     api.delete(`/api/transport/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления транспорта: ${error.response?.data?.message || error.message}`);
//     }),

//   getTransportById: (id) =>
//     api.get(`/api/transport/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения транспорта: ${error.response?.data?.message || error.message}`);
//     }),

//   updateTransport: (id, data) =>
//     api.put(`/api/transport/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления транспорта: ${error.response?.data?.message || error.message}`);
//     }),

//   // Тамада
//   createTamada: (data) =>
//     api.post('/api/tamada', data).catch((error) => {
//       throw new Error(`Ошибка создания тамады: ${error.response?.data?.message || error.message}`);
//     }),

//   getTamada: () =>
//     api.get('/api/tamada').catch((error) => {
//       throw new Error(`Ошибка получения списка тамады: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteTamada: (id) =>
//     api.delete(`/api/tamada/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления тамады: ${error.response?.data?.message || error.message}`);
//     }),

//   getTamadaById: (id) =>
//     api.get(`/api/tamada/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения тамады: ${error.response?.data?.message || error.message}`);
//     }),

//   updateTamada: (id, data) =>
//     api.put(`/api/tamada/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления тамады: ${error.response?.data?.message || error.message}`);
//     }),

//   // Программы
//   createProgram: (data) =>
//     api.post('/api/program', data).catch((error) => {
//       throw new Error(`Ошибка создания программы: ${error.response?.data?.message || error.message}`);
//     }),

//   getPrograms: () =>
//     api.get('/api/program').catch((error) => {
//       throw new Error(`Ошибка получения списка программ: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteProgram: (id) =>
//     api.delete(`/api/program/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления программы: ${error.response?.data?.message || error.message}`);
//     }),

//   getProgramById: (id) =>
//     api.get(`/api/program/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения программы: ${error.response?.data?.message || error.message}`);
//     }),

//   updateProgram: (id, data) =>
//     api.put(`/api/program/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления программы: ${error.response?.data?.message || error.message}`);
//     }),

//   // Традиционные подарки
//   createTraditionalGift: (data) =>
//     api.post('/api/traditional-gift', data).catch((error) => {
//       throw new Error(`Ошибка создания подарка: ${error.response?.data?.message || error.message}`);
//     }),

//   getTraditionalGifts: () =>
//     api.get('/api/traditional-gift').catch((error) => {
//       throw new Error(`Ошибка получения списка подарков: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteTraditionalGift: (id) =>
//     api.delete(`/api/traditional-gift/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления подарка: ${error.response?.data?.message || error.message}`);
//     }),

//   getTraditionalGiftById: (id) =>
//     api.get(`/api/traditional-gift/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения подарка: ${error.response?.data?.message || error.message}`);
//     }),

//   updateTraditionalGift: (id, data) =>
//     api.put(`/api/traditional-gift/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления подарка: ${error.response?.data?.message || error.message}`);
//     }),

//   // Цветы
//   createFlowers: (data) =>
//     api.post('/api/flowers', data).catch((error) => {
//       throw new Error(`Ошибка создания цветов: ${error.response?.data?.message || error.message}`);
//     }),

//   getFlowers: () =>
//     api.get('/api/flowers').catch((error) => {
//       throw new Error(`Ошибка получения списка цветов: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteFlowers: (id) =>
//     api.delete(`/api/flowers/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления цветов: ${error.response?.data?.message || error.message}`);
//     }),

//   getFlowersById: (id) =>
//     api.get(`/api/flowers/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения цветов: ${error.response?.data?.message || error.message}`);
//     }),

//   updateFlowers: (id, data) =>
//     api.put(`/api/flowers/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления цветов: ${error.response?.data?.message || error.message}`);
//     }),

//   // Торты
//   createCake: (data) =>
//     api.post('/api/cakes', data).catch((error) => {
//       throw new Error(`Ошибка создания торта: ${error.response?.data?.message || error.message}`);
//     }),



//   deleteCake: (id) =>
//     api.delete(`/api/cakes/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления торта: ${error.response?.data?.message || error.message}`);
//     }),

//   getCakeById: (id) =>
//     api.get(`/api/cake/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения торта: ${error.response?.data?.message || error.message}`);
//     }),

//   updateCake: (id, data) =>
//     api.put(`/api/cake/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления торта: ${error.response?.data?.message || error.message}`);
//     }),

//   // Алкоголь
//   createAlcohol: (data) =>
//     api.post('/api/alcohol', data).catch((error) => {
//       throw new Error(`Ошибка создания алкоголя: ${error.response?.data?.message || error.message}`);
//     }),

//   getAlcohol: () =>
//     api.get('/api/alcohol').catch((error) => {
//       throw new Error(`Ошибка получения списка алкоголя: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteAlcohol: (id) =>
//     api.delete(`/api/alcohol/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления алкоголя: ${error.response?.data?.message || error.message}`);
//     }),

//   getAlcoholById: (id) =>
//     api.get(`/api/alcohol/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения алкоголя: ${error.response?.data?.message || error.message}`);
//     }),

//   updateAlcohol: (id, data) =>
//     api.put(`/api/alcohol/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления алкоголя: ${error.response?.data?.message || error.message}`);
//     }),

//   // Ювелирные изделия
//   createJewelry: (data) =>
//     api.post('/api/jewelry', data).catch((error) => {
//       throw new Error(`Ошибка создания ювелирного изделия: ${error.response?.data?.message || error.message}`);
//     }),

//   getJewelry: () =>
//     api.get('/api/jewelry').catch((error) => {
//       throw new Error(`Ошибка получения списка ювелирных изделий: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteJewelry: (id) =>
//     api.delete(`/api/jewelry/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления ювелирного изделия: ${error.response?.data?.message || error.message}`);
//     }),

//   getJewelryById: (id) =>
//     api.get(`/api/jewelry/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения ювелирного изделия: ${error.response?.data?.message || error.message}`);
//     }),

//   updateJewelry: (id, data) =>
//     api.put(`/api/jewelry/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления ювелирного изделия: ${error.response?.data?.message || error.message}`);
//     }),

//   // Гостиницы
//   createHotel: (data) =>
//     api.post('/api/hotel', data).catch((error) => {
//       throw new Error(`Ошибка создания гостиницы: ${error.response?.data?.message || error.message}`);
//     }),

//   getHotels: () =>
//     api.get('/api/hotels').catch((error) => {
//       throw new Error(`Ошибка получения списка гостиниц: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteHotel: (id) =>
//     api.delete(`/api/hotel/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления гостиницы: ${error.response?.data?.message || error.message}`);
//     }),

//   getHotelById: (id) =>
//     api.get(`/api/hotel/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения гостиницы: ${error.response?.data?.message || error.message}`);
//     }),

//   updateHotel: (id, data) =>
//     api.put(`/api/hotel/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления гостиницы: ${error.response?.data?.message || error.message}`);
//     }),

//   // Типографии
//   createTypography: (data) =>
//     api.post('/api/typography', data).catch((error) => {
//       throw new Error(`Ошибка создания типографии: ${error.response?.data?.message || error.message}`);
//     }),

//   getTypographies: () =>
//     api.get('/api/typographies').catch((error) => {
//       throw new Error(`Ошибка получения списка типографий: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteTypography: (id) =>
//     api.delete(`/api/typography/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления типографии: ${error.response?.data?.message || error.message}`);
//     }),

//   getTypographyById: (id) =>
//     api.get(`/api/typography/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения типографии: ${error.response?.data?.message || error.message}`);
//     }),

//   updateTypography: (id, data) =>
//     api.put(`/api/typography/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления типографии: ${error.response?.data?.message || error.message}`);
//     }),

//   // Аренда технического оснащения
//   createTechnicalEquipmentRental: (data) =>
//     api.post('/api/technical-equipment-rental', data).catch((error) => {
//       throw new Error(`Ошибка создания аренды технического оснащения: ${error.response?.data?.message || error.message}`);
//     }),

//   getTechnicalEquipmentRentals: () =>
//     api.get('/api/technical-equipment-rentals').catch((error) => {
//       throw new Error(`Ошибка получения списка аренд технического оснащения: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteTechnicalEquipmentRental: (id) =>
//     api.delete(`/api/technical-equipment-rental/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления аренды технического оснащения: ${error.response?.data?.message || error.message}`);
//     }),

//   getTechnicalEquipmentRentalById: (id) =>
//     api.get(`/api/technical-equipment-rental/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения аренды технического оснащения: ${error.response?.data?.message || error.message}`);
//     }),

//   updateTechnicalEquipmentRental: (id, data) =>
//     api.put(`/api/technical-equipment-rental/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления аренды технического оснащения: ${error.response?.data?.message || error.message}`);
//     }),

//   // Категории мероприятий
//   createEventCategory: (data) =>
//     api.post('/api/event-category', data).catch((error) => {
//       throw new Error(`Ошибка создания категории мероприятия: ${error.response?.data?.message || error.message}`);
//     }),

//     // Получить все доступные услуги
//   getServices: () =>
//     api.get('/api/services').catch((error) => {
//       throw new Error(`Ошибка получения списка услуг: ${error.response?.data?.message || error.message}`);
//     }),


// addServicesToCategory: (categoryId, data) =>
//   api.post(`/api/event-category/${categoryId}/services`, data).catch((error) => {
//     throw new Error(`Ошибка добавления услуг к категории: ${error.response?.data?.message || error.message}`);
//   }),

// // Обновить услуги для категории (bulk)
// updateServicesForCategory: (categoryId, data) =>
//   api.put(`/api/event-category/${categoryId}/services`, data).catch((error) => {
//     throw new Error(`Ошибка обновления услуг для категории: ${error.response?.data?.message || error.message}`);
//   }),


//   getEventCategories: () =>
//     api.get('/api/event-categories').catch((error) => {
//       throw new Error(`Ошибка получения списка категорий мероприятий: ${error.response?.data?.message || error.message}`);
//     }),

//   getEventCategoryById: (id) =>
//     api.get(`/api/event-category/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения категории мероприятия: ${error.response?.data?.message || error.message}`);
//     }),

//   getEventCategoryWithServices: (id) =>
//     api.get(`/api/event-category/${id}/services`).catch((error) => {
//       throw new Error(`Ошибка получения категории мероприятия с услугами: ${error.response?.data?.message || error.message}`);
//     }),

//   updateEventCategory: (id, data) =>
//     api.put(`/api/event-category/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления категории мероприятия: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteEventCategory: (id) =>
//     api.delete(`/api/event-category/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления категории мероприятия: ${error.response?.data?.message || error.message}`);
//     }),

//   addServiceToCategory: (categoryId, data) =>
//     api.post(`/api/event-category/${categoryId}/service`, data).catch((error) => {
//       throw new Error(`Ошибка добавления услуги к категории: ${error.response?.data?.message || error.message}`);
//     }),

//   removeServiceFromCategory: (categoryId, serviceId, data) =>
//     api.delete(`/api/event-category/${categoryId}/service/${serviceId}`, { data }).catch((error) => {
//       throw new Error(`Ошибка удаления услуги из категории: ${error.response?.data?.message || error.message}`);
//     }),

//   // Товары
//   createGood: (data) =>
//     api.post('/api/goods', data).catch((error) => {
//       throw new Error(`Ошибка создания товара: ${error.response?.data?.message || error.message}`);
//     }),

//   getGoods: () =>
//     api.get('/api/goods').catch((error) => {
//       throw new Error(`Ошибка получения списка товаров: ${error.response?.data?.message || error.message}`);
//     }),

//   getGoodById: (id) =>
//     api.get(`/api/goodbyid/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения товара: ${error.response?.data?.message || error.message}`);
//     }),

//   updateGood: (id, data) =>
//     api.put(`/api/updategoodbyid/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления товара: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteGood: (id) =>
//     api.delete(`/api/removegoodbyid/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления товара: ${error.response?.data?.message || error.message}`);
//     }),

//   // Свадьбы
//   createWedding: (data) =>
//     api.post('/api/weddings/addwedding', data).catch((error) => {
//       throw new Error(`Ошибка создания свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   getWeddingById: (id) =>
//     api.get(`/api/weddings/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   getWedding: () =>
//     api.get('/api/getallweddings').catch((error) => {
//       throw new Error(`Ошибка получения списка свадеб: ${error.response?.data?.message || error.message}`);
//     }),

//   updateWedding: (id, data) =>
//     api.put(`/api/updateweddingbyid/${id}`, data).catch((error) => {
//       throw new Error(`Ошибка обновления свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteWedding: (id) =>
//     api.delete(`/api/weddings/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   getWeddingItems: (id) =>
//     api.get(`/api/wedding-items/${id}`).catch((error) => {
//       throw new Error(`Ошибка получения элементов свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   deleteWeddingItem: (id) =>
//     api.delete(`/api/wedding-items/${id}`).catch((error) => {
//       throw new Error(`Ошибка удаления элемента свадьбы: ${error.response?.data?.message || error.message}`);
//     }),

//   // Список желаний
//   createWish: (wishlistData) =>
//     api.post('/api/wishlist', wishlistData).catch((error) => {
//       throw new Error(`Ошибка создания желания: ${error.response?.data?.message || error.message}`);
//     }),

//   getWishlistByWeddingId: (weddingId) =>
//     api.get(`/api/wishlist/${weddingId}`).catch((error) => {
//       throw new Error(`Ошибка получения списка желаний: ${error.response?.data?.message || error.message}`);
//     }),

//   getWishlistByWeddingIdWithoutToken: (weddingId) =>
//     api.get(`/api/wishlist/${weddingId}`).catch((error) => {
//       throw new Error(`Ошибка получения списка желаний без токена: ${error.response?.data?.message || error.message}`);
//     }),

//   reserveWishlistItem: (id) =>
//     api.patch(`/api/wishlist/${id}/reserve`, {}).catch((error) => {
//       throw new Error(`Ошибка резервирования желания: ${error.response?.data?.message || error.message}`);
//     }),

//   reserveWishlistItemWithoutToken: (id, data) =>
//     api.patch(`/api/wishlist/${id}/reservebyunknown`, { data }).catch((error) => {
//       throw new Error(`Ошибка резервирования желания без токена: ${error.response?.data?.message || error.message}`);
//     }),

//   // Блокировка дат
//   addDataBlockToRestaurant: (restaurantId, date) =>
//     api
//       .post('/api/block', {
//         restaurantId,
//         date: date.toISOString().split('T')[0],
//       })
//       .catch((error) => {
//         throw new Error(`Ошибка блокировки даты ресторана: ${error.response?.data?.message || error.message}`);
//       }),

//   fetchBlockedDaysByRestaurantId: (id) =>
//     api.get(`/api/${id}/blocked-days`).catch((error) => {
//       throw new Error(`Ошибка получения заблокированных дат: ${error.response?.data?.message || error.message}`);
//     }),

//   fetchAllBlockedDays: () =>
//     api.get('/api/all-blocked-days').catch((error) => {
//       throw new Error(`Ошибка получения всех заблокированных дат: ${error.response?.data?.message || error.message}`);
//     }),

//   // Универсальный метод для получения данных
//   fetchByEndpoint: (endpoint) =>
//     api.get(endpoint).catch((error) => {
//       throw new Error(`Ошибка получения данных по эндпоинту ${endpoint}: ${error.response?.data?.message || error.message}`);
//     }),
// };






import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Создание экземпляра axios
const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_baseURL}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
  },
});

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


  register: (userData) =>
    api.post('/api/register', userData).catch((error) => handleError(error, 'регистрации')),

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

  addServicesToCategory: (categoryId, data) =>
    api.post(`/api/event-category/${categoryId}/services`, data).catch((error) => handleError(error, 'добавления услуг к категории')),

  updateServicesForCategory: (categoryId, data) =>
    api.put(`/api/event-category/${categoryId}/services`, data).catch((error) => handleError(error, 'обновления услуг для категории')),

  addServiceToCategory: (categoryId, data) =>
    api.post(`/api/event-category/${categoryId}/service`, data).catch((error) => handleError(error, 'добавления услуги к категории')),

  removeServiceFromCategory: (categoryId, serviceId, data) =>
    api.delete(`/api/event-category/${categoryId}/service/${serviceId}`, { data }).catch((error) => handleError(error, 'удаления услуги из категории')),




  // Получить все доступные услуги (не в роутере, требует проверки)
  getServices: () =>
    api.get('/api/services').catch((error) => handleError(error, 'получения списка услуг')),

  // Специфические методы для списка желаний (не в роутере, требует проверки)
  createWish: (wishlistData) =>
    api.post('/api/wishlist', wishlistData).catch((error) => handleError(error, 'создания желания')),

  getWishlistByWeddingId: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => handleError(error, 'получения списка желаний')),

  getWishlistByWeddingIdWithoutToken: (weddingId) =>
    api.get(`/api/wishlist/${weddingId}`).catch((error) => handleError(error, 'получения списка желаний без токена')),

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
};



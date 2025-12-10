import axios from 'axios';

// Базовый URL для API - замените на ваш актуальный адрес бэкенда

//const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'http://89.207.250.181:3000/api';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_BASE_URL, // Note: This variable name seems specific to this file context, keeping as is based on previous read
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API методы для категорий мероприятий
export const eventCategoriesAPI = {
  // Получить все категории мероприятий
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/event-categories');
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении категорий: ${error.message}`);
    }
  },

  // Получить категорию по ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await apiClient.get(`/event-category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении категории: ${error.message}`);
    }
  },

  // Получить категорию с услугами
  getCategoryWithServices: async (categoryId) => {
    try {
      const response = await apiClient.get(`/event-category/${categoryId}/services`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении услуг категории: ${error.message}`);
    }
  },

  // Создать новую категорию
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/event-category', categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при создании категории: ${error.message}`);
    }
  },

  // Обновить категорию
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await apiClient.put(`/event-category/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при обновлении категории: ${error.message}`);
    }
  },

  // Удалить категорию
  deleteCategory: async (categoryId) => {
    try {
      const response = await apiClient.delete(`/event-category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при удалении категории: ${error.message}`);
    }
  },

  // Добавить услугу к категории
  addServiceToCategory: async (categoryId, serviceData) => {
    try {
      const response = await apiClient.post(`/event-category/${categoryId}/service`, serviceData);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при добавлении услуги: ${error.message}`);
    }
  },

  // Удалить услугу из категории
  removeServiceFromCategory: async (categoryId, serviceId) => {
    try {
      const response = await apiClient.delete(`/event-category/${categoryId}/service/${serviceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при удалении услуги: ${error.message}`);
    }
  },
};

// API методы для других услуг
export const servicesAPI = {
  // Рестораны
  restaurants: {
    getAll: () => apiClient.get('/restaurants'),
    getById: (id) => apiClient.get(`/restaurant/${id}`),
    create: (data) => apiClient.post('/restaurant', data),
    update: (id, data) => apiClient.put(`/restaurant/${id}`, data),
    delete: (id) => apiClient.delete(`/restaurant/${id}`),
  },

  // Гостиницы
  hotels: {
    getAll: () => apiClient.get('/hotels'),
    getById: (id) => apiClient.get(`/hotel/${id}`),
    create: (data) => apiClient.post('/hotel', data),
    update: (id, data) => apiClient.put(`/hotel/${id}`, data),
    delete: (id) => apiClient.delete(`/hotel/${id}`),
  },

  // Аренда технического оснащения
  technicalEquipment: {
    getAll: () => apiClient.get('/technical-equipment-rentals'),
    getById: (id) => apiClient.get(`/technical-equipment-rental/${id}`),
    create: (data) => apiClient.post('/technical-equipment-rental', data),
    update: (id, data) => apiClient.put(`/technical-equipment-rental/${id}`, data),
    delete: (id) => apiClient.delete(`/technical-equipment-rental/${id}`),
  },

  // Типография
  typography: {
    getAll: () => apiClient.get('/typographies'),
    getById: (id) => apiClient.get(`/typography/${id}`),
    create: (data) => apiClient.post('/typography', data),
    update: (id, data) => apiClient.put(`/typography/${id}`, data),
    delete: (id) => apiClient.delete(`/typography/${id}`),
  },
};

export default apiClient;


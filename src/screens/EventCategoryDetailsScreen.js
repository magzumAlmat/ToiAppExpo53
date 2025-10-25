import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { eventCategoriesAPI } from '../services/api';

const EventCategoryDetailsScreen = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryDetails();
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const data = await eventCategoriesAPI.getCategoryWithServices(categoryId);
      setCategoryDetails(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceType}>{item.serviceType}</Text>
      {item.serviceDetails ? (
        <View>
          <Image
            source={{ uri: item.serviceDetails.photoUrl || 'https://via.placeholder.com/150' }}
            style={styles.serviceImage}
          />
          {item.serviceType === 'Restaurant' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Адрес: {item.serviceDetails.address}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Flowers' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Alcohol' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Hotel' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Адрес: {item.serviceDetails.address}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Tamada' && (
            <View>
              <Text style={styles.serviceDetailText}>Имя: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Program' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Transport' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Jewelry' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Cakes' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'TraditionalGifts' && (
            <View>
              <Text style={styles.serviceDetailText}>Название: {item.serviceDetails.name}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'TechnicalEquipmentRental' && (
            <View>
              <Text style={styles.serviceDetailText}>Название компании: {item.serviceDetails.companyName}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
          {item.serviceType === 'Typography' && (
            <View>
              <Text style={styles.serviceDetailText}>Название компании: {item.serviceDetails.companyName}</Text>
              <Text style={styles.serviceDetailText}>Телефон: {item.serviceDetails.phone}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noDetailsText}>Детали услуги не найдены.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F1EBDD', '#897066']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B6F47" />
        <Text style={styles.loadingText}>Загрузка деталей категории...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#F1EBDD', '#897066']} style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategoryDetails}>
          <Text style={styles.retryButtonText}>Повторить попытку</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F1EBDD', '#897066']} style={styles.container}>
      <Text style={styles.header}>{categoryName}</Text>
      {categoryDetails && categoryDetails.services && categoryDetails.services.length > 0 ? (
        <FlatList
          data={categoryDetails.services}
          renderItem={renderServiceItem}
          keyExtractor={(item, index) => `${item.serviceType}-${item.serviceId}-${index}`}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noServicesText}>Услуги для данной категории не найдены.</Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B6F47',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8B6F47',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4032',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A4032',
    marginBottom: 5,
  },
  serviceDetailText: {
    fontSize: 16,
    color: '#8B6F47',
    marginLeft: 10,
  },
  noDetailsText: {
    fontSize: 16,
    color: '#8B6F47',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  noServicesText: {
    fontSize: 18,
    color: '#8B6F47',
    textAlign: 'center',
    marginTop: 50,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default EventCategoryDetailsScreen;
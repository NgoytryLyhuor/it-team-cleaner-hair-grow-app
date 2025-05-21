import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import BottomNavigation from './Components/BottomNavigation';
import apiWordpress from '../services/api_wordpress';
import CustomText from './Components/CustomText';

const { height } = Dimensions.get("window");

export default function Shop({ navigation }) {
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setDashboardDetail([])
    try {
      const response = await apiWordpress.get('?page=api_app&method=product');
      if (Array.isArray(response.data.product)) {
        setDashboardDetail(response.data.product);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderSkeletonLoader = () => {
    const skeletonItems = [1, 2, 3, 4]; // 2 rows of 2 items
    return skeletonItems.reduce((rows, _, index) => {
      if (index % 2 === 0) {
        rows.push(skeletonItems.slice(index, index + 2));
      }
      return rows;
    }, []).map((pair, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {pair.map((_, i) => (
          <View key={i} style={styles.skeletonItem}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonText} />
            </View>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Fixed Header */}
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>Shop</CustomText>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Products */}
          <View style={styles.productsContainer}>
            {loading ? (
              renderSkeletonLoader()
            ) : dashboardDetail.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CustomText style={styles.emptyText}>No products found</CustomText>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setLoading(true);
                    fetchData();
                  }}
                >
                  <CustomText style={styles.retryButtonText}>Retry</CustomText>
                </TouchableOpacity>
              </View>
            ) : (
              dashboardDetail.reduce((rows, item, index) => {
                if (index % 2 === 0) {
                  rows.push(dashboardDetail.slice(index, index + 2));
                }
                return rows;
              }, []).map((pair, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {pair.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.productItem}
                      onPress={() => navigation.navigate('ProductDetail', { product: item })}
                    >
                      <Image
                        style={styles.productImage}
                        resizeMode="cover"
                        source={
                          item.image
                            ? { uri: item.image }
                            : require('../assets/icons/n_image.jpg')
                        }
                      />
                      <View style={styles.productTextContainer}>
                        <CustomText style={styles.productTitle} numberOfLines={1}>
                          {item.text}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {pair.length === 1 && <View style={styles.emptySpace} />}
                </View>
              ))
            )}
          </View>
        </SafeAreaView>
      </ScrollView>

      <BottomNavigation page="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    zIndex: 10,
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: height * 0.12,
    paddingTop: 25,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    textAlign: 'center',
  },
  scrollView: {
    marginBottom: height * 0.1,
  },
  safeArea: {
    paddingBottom: 20,
  },
  productsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonItem: {
    width: '48%',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e5e5',
  },
  skeletonTextContainer: {
    padding: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Nunito_400Regular',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold',
  },
  productItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  productTextContainer: {
    padding: 12,
  },
  productTitle: {
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    color: '#000',
  },
  emptySpace: {
    width: '48%',
  },
});
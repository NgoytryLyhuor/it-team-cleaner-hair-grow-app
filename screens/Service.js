import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  RefreshControl,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import http from '../services/http';
import { Ionicons } from '@expo/vector-icons';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import BookingStepHeader from './Components/BookingStepHeader';
import StepHeader from './Components/StepHeader';

const { width , height } = Dimensions.get("window");

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Service({ navigation, route }) {
  const { branch, staff } = route.params;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [employeeServiceList, setEmployeeServiceList] = useState([]);
  const [activeSections, setActiveSections] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [collapsing, setCollapsing] = useState(false);
  const [collapsingSection, setCollapsingSection] = useState(null);

  const animRef = useRef(null);
  const scrollViewRef = useRef(null);
  const buttonRef = useRef();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Define animations with only opacity transitions - no movement
  const fadeIn = {
    0: { opacity: 0 },
    1: { opacity: 1 }
  };
  
  // Only rotate animations for chevron - no movement
  const rotate = {
    0: { rotate: '0deg' },
    1: { rotate: '0deg' }
  };
  
  const rotateBack = {
    0: { rotate: '60deg' },
    1: { rotate: '0deg' }
  };

  // Optimized focus animation - only fade, no vertical movement
  useFocusEffect(
    React.useCallback(() => {
      if (animRef.current) {
        animRef.current.animate(fadeIn, 220);
      }
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/employee-service-list?branch_id=${branch?.id}`);
      if (response.data.status) {
        setEmployeeServiceList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load employee services', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleSelection = (id) => {
    // Optimized layout animation - only opacity changes, no position changes
    LayoutAnimation.configureNext({
      duration: 120,
      create: {
        type: 'easeInEaseOut',
        property: 'opacity',
      },
      update: {
        type: 'easeInEaseOut',
        property: 'opacity',
      },
      delete: {
        type: 'easeInEaseOut',
        property: 'opacity',
      },
    });
    
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle accordion section change with proper animations
  const handleSectionChange = (activeSectionsNew) => {
    // Find which section is being collapsed (if any)
    const collapsedSection = activeSections.find(section => !activeSectionsNew.includes(section));
    
    // If we're collapsing a section
    if (collapsedSection !== undefined) {
      setCollapsing(true);
      setCollapsingSection(collapsedSection);
      
      // Fade out content before collapsing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }).start(() => {
        setActiveSections(activeSectionsNew);
        
        // After setting new sections, fade back in
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            setCollapsing(false);
            setCollapsingSection(null);
          });
        }, 50);
      });
    } else {
      // For expanding, just update normally
      setActiveSections(activeSectionsNew);
    }
  };

  const renderHeader = (section, index, isActive) => {
    return (
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName} className="flex-1">
          {section?.category?.name || "Untitled Category"}
        </Text>

        <Animatable.View
          duration={120}
          animation={isActive ? rotate : rotateBack}
          useNativeDriver={true}
        >
          <Ionicons name={isActive ? 'chevron-up' : 'chevron-down'} size={17} color="#333" />
        </Animatable.View>
      </View>
    );
  };

  const renderContent = (section, sectionIndex, isActive) => {
    // Don't render content when collapsing to prevent flash
    if (collapsing && collapsingSection === sectionIndex) return null;
    
    return (
      <Animated.View 
        style={[
          styles.servicesContainer,
          { opacity: fadeAnim }
        ]}
        key={isActive ? 'active' : 'inactive'}
      >
        {section?.services?.map((service, idx) => (
          <View
            key={service.id}
            style={styles.serviceItemContainer}
          >
            <TouchableOpacity 
              onPress={() => toggleSelection(service.id)} 
              activeOpacity={0.7}
              style={styles.serviceHeader}
            >
              <View style={styles.serviceBox} className="gap-1">
                <View style={styles.serviceImageContainer}>
                  <Image 
                    style={styles.serviceImage} 
                    source={{ uri: service.service_image }}
                    defaultSource={require('../assets/icons/ic_notification_user.png')} 
                  />
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{service.name}</Text>
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                </View>
                <Animatable.View 
                  style={[
                    styles.checkbox,
                    selectedItems[service.id] && styles.checkboxSelected
                  ]}
                  animation={selectedItems[service.id] ? 'pulse' : undefined}
                  duration={200}
                  useNativeDriver={true}
                >
                  {selectedItems[service.id] && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </Animatable.View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    );
  };

  const nextScreen = () => {
    const selectedServices = [];

    employeeServiceList.forEach(category => {
      const matched = category.services.filter(service => selectedItems[service.id]);
      selectedServices.push(...matched);
    });

    if (selectedServices.length > 0) {
      const postData = {
        branch: branch,
        staff: staff,
        services: selectedServices,
      };
      navigation.navigate('DateTime', postData);
    } else {
      Toast.warn('Please select a service!');
    }
  };
  
  // Optimized button press animation
  const handlePressIn = () => {
    if (buttonRef.current) {
      buttonRef.current.animate({ 
        0: { scale: 1 },
        1: { scale: 0.95 }
      }, 80);
    }
  };
  
  const handlePressOut = () => {
    if (buttonRef.current) {
      buttonRef.current.animate({ 
        0: { scale: 0.95 },
        1: { scale: 1 }
      }, 80);
    }
  };

  // Loading Skeleton - Memoized to prevent re-renders
  const renderSkeletonCard = React.useMemo(() => () => (
    <View style={styles.skeletonCategoryContainer}>
      {[...Array(20)].map((_, index) => (
        <View key={index} style={styles.skeletonCategory}>
          <View style={styles.skeletonCategoryHeader}>
            <View style={styles.skeletonCategoryName} />
            <View style={styles.skeletonChevronIcon} />
          </View>
          {/* <View style={styles.skeletonServicesContainer}>
            {[...Array(2)].map((_, serviceIndex) => (
              <View key={serviceIndex} style={styles.skeletonServiceHeader}>
                <View style={styles.skeletonServiceBox}>
                  <View style={styles.skeletonServiceImageContainer}>
                    <View style={styles.skeletonServiceImage} />
                  </View>
                  <View style={styles.skeletonServiceDetails}>
                    <View style={styles.skeletonServiceTitle} />
                    <View style={styles.skeletonServiceDescription} />
                  </View>
                </View>
                <View style={styles.skeletonCheckbox} />
              </View>
            ))}
          </View> */}
        </View>
      ))}
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#000" }} />
      <StatusBar barStyle="light-content" backgroundColor="#000" />
       {/* Header */}
      <BookingStepHeader title={branch?.name ? branch.name.length > 25 ? `${branch.name.slice(0, 25)}...` : branch.name : ''} height={height * 0.14}/>

      <StepHeader type="service" />

      {loading ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.stylistTitle}>{staff?.full_name}'s Services</Text>
          {renderSkeletonCard()}
          <View style={{ height: 50 }} />
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEventThrottle={16}
        >
          <View>
            <Text style={styles.stylistTitle}>{staff?.full_name}'s Services</Text>
          </View>
          
          <View>
            <Accordion
              sections={employeeServiceList || []}
              activeSections={activeSections}
              renderHeader={renderHeader}
              renderContent={renderContent}
              onChange={handleSectionChange}
              expandMultiple={true}
              sectionContainerStyle={styles.categoryContainer}
              touchableComponent={TouchableWithoutFeedback}
              duration={180}
            />
          </View>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerStaff}>{staff?.full_name}</Text>
        <Animatable.View ref={buttonRef}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              Object.keys(selectedItems).length === 0 && styles.disabledButton
            ]}
            onPress={nextScreen}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={Object.keys(selectedItems).length === 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
    height: 140,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 45,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: -30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  mainProgressContainer: {
    paddingHorizontal: 15,
    marginTop: -23,
  },
  progressContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: width * 0.03,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    height: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    height: 1.5,
    marginTop: 20,
    backgroundColor: '#ccc',
  },
  completedProgressDot: {
    width: width * 0.035,
    height: width * 0.035,
    borderRadius: width * 0.02,
    backgroundColor: '#4CAF50',
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 10,
    minHeight: 10,
  },
  activeProgressDot: {
    width: width * 0.035,
    height: width * 0.035,
    borderRadius: width * 0.02,
    backgroundColor: '#000',
    marginBottom: 5,
    minWidth: 10,
    minHeight: 10,
  },
  inactiveProgressDot: {
    width: width * 0.035,
    height: width * 0.035,
    borderRadius: width * 0.02,
    backgroundColor: '#ccc',
    marginBottom: 5,
    minWidth: 10,
    minHeight: 10,
  },
  completedProgressText: {
    color: '#000',
    fontSize: Math.max(12, width * 0.03),
    fontWeight: 'bold',
  },
  activeProgressText: {
    color: '#000',
    fontSize: Math.max(12, width * 0.03),
    fontWeight: 'bold',
  },
  inactiveProgressText: {
    color: '#999',
    fontSize: Math.max(12, width * 0.03),
    fontWeight: 'normal',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  stylistTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  servicesContainer: {
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  serviceItemContainer: {
    backgroundColor: '#fff',
  },
  serviceHeader: {
    padding: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  serviceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  serviceImageContainer: {
    marginRight: 15,
  },
  serviceImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionContainer: {
    marginTop: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  footer: {
    backgroundColor: '#000',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    height: Platform.OS === 'ios' ? 90 : 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStaff: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 40,
    width: width * 0.25,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Skeleton loader styles
  skeletonCategoryContainer: {
    marginBottom: 15,
  },
  skeletonCategory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  skeletonCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 20,
  },
  skeletonCategoryName: {
    width: 150,
    height: 15,
    backgroundColor: '#D1D1D1',
    borderRadius: 8,
  },
  skeletonChevronIcon: {
    width: 15,
    height: 15,
    backgroundColor: '#D1D1D1',
    borderRadius: 4,
  },
  skeletonServicesContainer: {
    overflow: 'hidden',
  },
  skeletonServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    paddingVertical: 10,
  },
  skeletonServiceBox: {
    flexDirection: 'row',
    flex: 1,
  },
  skeletonServiceImageContainer: {
    marginRight: 15,
  },
  skeletonServiceImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#D1D1D1',
  },
  skeletonServiceDetails: {
    flex: 1,
  },
  skeletonServiceTitle: {
    width: 120,
    height: 15,
    backgroundColor: '#D1D1D1',
    borderRadius: 8,
    marginBottom: 4,
  },
  skeletonServiceDescription: {
    width: 180,
    height: 12,
    backgroundColor: '#D1D1D1',
    borderRadius: 8,
  },
  skeletonCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#D1D1D1',
  },
});



// import React, { useEffect, useState } from 'react';
// import {
//   Dimensions,
//   View,
//   Text,
//   SafeAreaView,
//   StatusBar,
//   Image,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import axios from 'axios';
// import BottomNavigation from './Components/BottomNavigation';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import apiWordpress from '../services/api_wordpress';

// const { height } = Dimensions.get("window");

// export default function Shop({ navigation }) {
//   const [dashboardDetail, setDashboardDetail] = useState([]);
//   const [loading, setLoading] = useState(false);

//  const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await apiWordpress.get('?page=api_app_win&method=product');
//             if (Array.isArray(response.data.product)) {
//                 setDashboardDetail(response.data.product);
//             } else {
//                 console.warn('Unexpected response format:', response.data);
//             }
//         } catch (error) {
//             console.error('Failed to load blog data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <View className="flex-1">
//       <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: height * 0.1 }}>
//         <SafeAreaView className='pb-5'>
//           <StatusBar backgroundColor="#000" barStyle="light-content" />

//           {/* Header */}
//           <View className="h-[100px] bg-black rounded-b-[30px] flex-row justify-center items-center px-5 pb-5">
//             <TouchableOpacity
//               className="absolute left-5"
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrow-back-ios" size={15} color="#fff" />
//             </TouchableOpacity>
//             <Text className="text-white font-extrabold text-[17px] text-center">Shop</Text>
//           </View>

//           {/* Products */}
//           <View className="px-4 mt-5">
//             {loading ? (
//               <Text className="text-center mt-5">Loading...</Text>
//             ) : dashboardDetail.length === 0 ? (
//               <Text className="text-center mt-5">No products found.</Text>
//             ) : (
//               dashboardDetail.reduce((rows, item, index) => {
//                 if (index % 2 === 0) {
//                   rows.push(dashboardDetail.slice(index, index + 2));
//                 }
//                 return rows;
//               }, []).map((pair, rowIndex) => (
//                 <View key={rowIndex} className="flex flex-row justify-between mb-4">
//                   {pair.map((item) => (
//                     <TouchableOpacity
//                       key={item.id}
//                       className="w-[48%] bg-white rounded-xl shadow-md overflow-hidden"
//                     >
//                       <Image
//                         className="w-full h-[200px] bg-gray-100"
//                         resizeMode="cover"
//                         source={
//                           item.image
//                             ? { uri: item.image }
//                             : require('../assets/images/no_image.jpg')
//                         }
//                       />
//                       <View className="p-3">
//                         <Text className="text-center font-bold text-black">{item.text}</Text>
//                       </View>
//                     </TouchableOpacity>
//                   ))}
//                   {pair.length === 1 && <View className="w-[48%]" />} {/* filler for odd item count */}
//                 </View>
//               ))
//             )}
//           </View>
//         </SafeAreaView>
//       </ScrollView>

//       <BottomNavigation page="Shop" />
//     </View>
//   );
// }

import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import BottomNavigation from './Components/BottomNavigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiWordpress from '../services/api_wordpress';

const { height } = Dimensions.get("window");

export default function Shop({ navigation }) {
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiWordpress.get('?page=api_app_win&method=product');
      if (Array.isArray(response.data.product)) {
        setDashboardDetail(response.data.product);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      // console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <View key={rowIndex} className="flex flex-row justify-between mb-4">
        {pair.map((_, i) => (
          <View key={i} className="w-[48%] bg-gray-200 rounded-xl overflow-hidden">
            <View className="w-full h-[200px] bg-gray-300 animate-pulse" />
            <View className="p-3">
              <View className="h-4 bg-gray-300 rounded w-3/4 mx-auto animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    ));
  };

  return (
  <View className="flex-1 bg-white">
    {/* Fixed Header */}
    <View
      className="absolute top-0 left-0 right-0 z-10 bg-black rounded-b-[30px] flex-row justify-center items-center px-5 pb-5"
      style={{ height: height * 0.11, paddingTop: 25 }}
    >
      <TouchableOpacity
        className="absolute left-5 "
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back-ios" size={15} color="#fff" />
      </TouchableOpacity>
      <Text className="text-white font-extrabold text-[17px] text-center">Shop</Text>
    </View>

    {/* Scrollable Content */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ marginBottom: height * 0.1 }}
      contentContainerStyle={{ paddingTop: 100 }} // Leave space for fixed header
    >
      <SafeAreaView className='pb-5'>

        {/* Products */}
        <View className="px-4 mt-5">
          {loading ? (
            renderSkeletonLoader()
          ) : dashboardDetail.length === 0 ? (
            <Text className="text-center mt-5">No products found.</Text>
          ) : (
            dashboardDetail.reduce((rows, item, index) => {
              if (index % 2 === 0) {
                rows.push(dashboardDetail.slice(index, index + 2));
              }
              return rows;
            }, []).map((pair, rowIndex) => (
              <View key={rowIndex} className="flex flex-row justify-between mb-4">
                {pair.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="w-[48%] bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <Image
                      className="w-full h-[200px] bg-gray-100"
                      resizeMode="cover"
                      source={
                        item.image
                          ? { uri: item.image }
                          : require('../assets/icons/n_image.jpg')
                      }
                    />
                    <View className="p-3">
                      <Text className="text-center font-bold text-black">{item.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {pair.length === 1 && <View className="w-[48%]" />}
              </View>
            ))
          )}
        </View>
      </SafeAreaView>
    </ScrollView>

    <BottomNavigation page="Shop"  />
  </View>
);

}
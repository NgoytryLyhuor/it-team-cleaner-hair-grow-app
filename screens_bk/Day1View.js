import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, ScrollView, Button, Pressable, Modal, StatusBar, ActivityIndicator, Alert, StyleSheet, Dimensions, useWindowDimensions, SafeAreaView, Platform, FlatList, SectionList, TextInput , Switch} from 'react-native';

import Greet from '../Components/Greet';
import Box from '../Components/Box';
import CustomButton from '../Components/customButton/CustomButton';
import LoginForm from '../Components/LoginForm';

export default function Day1View() {

  let imgUrl = require('../assets/adaptive-icon.png');

  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  //--not-auto-update----
  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;
  // Listen to dimension changes
  Dimensions.addEventListener('change', ({ window }) => {
    //use useState handle it 
    // console.log('New width:', window.width);
    // console.log('New height:', window.height);
  });
  // console.log(deviceWidth,deviceHeight)

  //--auto-update----
  const deviceWidthWindowDimensions = useWindowDimensions().width;
  const deviceHeightWindowDimensions = useWindowDimensions().height;
  // console.log(deviceWidthWindowDimensions,deviceHeightWindowDimensions)

  if (Platform.OS === 'ios') {
    //console.log('Running on iOS');
  } else if (Platform.OS === 'android') {
    //console.log('Running on Android');
  } else {
    //console.log('Running on something else');
  }

  const styles = StyleSheet.create({
    multiline: {
      height: 100,
      verticalAlign: 'top'
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      width: '100%',
      marginBottom: 10,
      paddingLeft: 8,
      backgroundColor: '#fff',
      borderRadius: 5
    },
    text: {
      fontSize: 20,
      ...Platform.select({
        ios: {
          color: 'blue',
        },
        android: {
          color: 'green',
        },
      }),
    },
    dimensions: {
      color: deviceWidth >= 350 ? 'red' : 'blue',
      fontSize: deviceHeight >= 350 ? 15 : 20,
    },
    bg: {
      color: 'red',
    },
    font: {
      fontSize: 15,
    },
    shadow: {
      backgroundColor: 'white',
      padding: 20,
      // margin: 20,
      borderRadius: 10,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Shadow for Android
      elevation: 5,
    }
  });

  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' },
    { id: 6, name: 'Item 6' },
    { id: 7, name: 'Item 7' },
    { id: 8, name: 'Item 8' },
    { id: 9, name: 'Item 9' },
    { id: 10, name: 'Item 10' },
  ];

  const sections = [
    {
      title: 'A Group',
      data: [
        { id: '1', name: 'Item 1' },
      ],
    },
    {
      title: 'B Group',
      data: [
        { id: '3', name: 'Item 3' },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'plum', padding: 10 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      // showsHorizontalScrollIndicator={false}
      >
        <LoginForm/>
        
        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Input Simple---------</Text>

        <View style={styles.container}>
          <Text style={{color:'#fff'}}>
            {isEnabled ? 'Switch is ON' : 'Switch is OFF'}
          </Text>
          <Switch
            onValueChange={() => setIsEnabled(previousState => !previousState)}
            value={isEnabled}
            trackColor={{ false: 'gray', true: 'green' }}
            thumbColor={isEnabled ? 'white' : 'black'}
          />

          <TextInput
            style={styles.input}
            placeholder="Type something"
            value={text}
            onChangeText={setText} // Update the text state on change
            // secureTextEntry //disply *****
            keyboardType="default"
            autoCapitalize='none'
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Type something"
            onChangeText={setText} // Update the text state on change
            // secureTextEntry //disply *****
            keyboardType="default"
            autoCapitalize='none'
            autoCorrect={false}
            multiline
          />

        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Section List---------</Text>

        <View style={{ height: 200 }}>
          <SectionList
            sections={sections}
            renderItem={({ item }) => (
              <Text
                style={{
                  fontSize: 15,
                  backgroundColor: 'lightblue',
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                {item.name}
              </Text>
            )}
            renderSectionHeader={({ section }) => (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  backgroundColor: 'lightgrey',
                  padding: 5,
                }}
              >
                {section.title}
              </Text>
            )}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Text style={{ height: 10 }}></Text>}
            SectionSeparatorComponent={() => <Text style={{ height: 10 }}></Text>}
          />
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------List---------</Text>

        <View style={{ height: 200 }}>
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <Text
                key={item.id}
                style={{
                  fontSize: 15,
                  backgroundColor: 'pink',
                  padding: 5,
                }}
              >
                {item.name}
              </Text>
            )}
            keyExtractor={item => item.id.toString()} // Ensure a unique key for each item
            ItemSeparatorComponent={<Text style={{ height: 10 }}></Text>}
            ListEmptyComponent={<Text>N/A</Text>}
            ListHeaderComponent={<Text>List</Text>}
            ListFooterComponent={<Text>End List</Text>}
          />
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Platform Specific Code---------</Text>
        <View><Text style={styles.text}>Platform Specific Code</Text></View>
        <CustomButton />

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Dimensions API---------</Text>
        <View><Text style={styles.dimensions}>Dimensions API</Text></View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Layout Flex---------</Text>
        <View style={{ height: 500 }}>
          <Box style={{ backgroundColor: 'red', flex: 1 }} name='Box 1' />
          <Box style={{ backgroundColor: 'blue', flex: 2 }} name='Box 2' />
          <Box style={{ backgroundColor: 'red' }} name='Box 3' />
          <Box style={{ backgroundColor: 'blue' }} name='Box 4' />
          <Box style={{ backgroundColor: 'red' }} name='Box 5' />
          <Box style={{ backgroundColor: 'blue' }} name='Box 6' />
          <Box style={{ backgroundColor: 'red' }} name='Box 7' />
          <Box style={{ backgroundColor: 'blue' }} name='Box 8' />
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Shadow---------</Text>
        <View style={styles.shadow}>
          <Text>Hello Shadow!</Text>
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Style Sheet---------</Text>

        <Text style={styles.bg}>Style Sheet</Text>
        <Text style={[styles.bg, styles.font]}>Style Sheet</Text>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Custom Components---------</Text>
        <Greet name="Makara" />
        <Greet name="Chany" />

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Alert---------</Text>
        <View style={{ marginBottom: 5 }}>
          <Button title="Alert 1" onPress={() => Alert.alert('Hello alert')} />
        </View>
        <View style={{ marginBottom: 5 }}>
          <Button title="Alert 2" onPress={() => Alert.alert('Hello alert', 'Description')} />
        </View>
        <View style={{ marginBottom: 5 }}>
          <Button title="Alert 3"
            onPress={() => Alert.alert(
              'Hello alert',
              'Description',
              [
                {
                  text: 'Cancel',
                  onPress: () => alert('Cancel')
                },
                {
                  text: 'Ok',
                  onPress: () => alert('OK')
                }
              ]
            )}
          />
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Activity Indicator---------</Text>
        <ActivityIndicator />
        <ActivityIndicator size='large' />
        <ActivityIndicator size='large' animating={false} />

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Status Bar---------</Text>
        <StatusBar backgroundColor='plum' barStyle='#fff' />

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Modal---------</Text>
        <Button title='Open Modal' onPress={() => setModalVisible(true)} />
        <Modal
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType='slide'
          // animationType='fade'
          presentationStyle='pageSheet'
        >
          <Text>Hello Modal</Text>
          <Button title='Close Modal' onPress={() => setModalVisible(false)} />
        </Modal>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------View---------</Text>
        <View style={{ height: 100, width: 100, backgroundColor: 'red' }}></View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Text---------</Text>
        <Text style={{ color: 'white' }}>Hello React Native</Text>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------image---------</Text>
        <Image style={{ width: 100, height: 100 }} source={imgUrl} />
        <Image style={{ width: 100, height: 100 }} source={{ uri: 'https://images.pexels.com/photos/4835419/pexels-photo-4835419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} />

        <ImageBackground source={imgUrl}>
          <Text>ImageBackground</Text>
        </ImageBackground>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------ScrollView---------</Text>

        <View style={{ height: 100 }}>
          <ScrollView>
            <Text>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Text>
          </ScrollView>
        </View>

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Button---------</Text>
        <Button title='Press' onPress={() => alert('Press')} color="blue" />

        <Text style={{ color: 'white', marginTop: 20, marginBottom: 10 }}>-----------Pressable---------</Text>
        <Pressable onPress={() => alert('Text Press')}>
          <Text style={{ backgroundColor: 'blue', padding: 10, color: '#fff' }}>Pressable</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

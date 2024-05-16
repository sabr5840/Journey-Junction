import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ImageBackground, Modal, KeyboardAvoidingView, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { app, database, storage } from './firebase';
import { collection, addDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './firebase.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';


const Stack = createStackNavigator();

if (!getAuth(app)) {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
}

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleDoubleTap = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  async function handleSignOut() {
    await signOut(auth);
    navigation.navigate('JourneyJunctionScreen');
    closeModal();
  };

  return (
    <View style={styles.topContainer}>
      <TouchableOpacity onPress={handleDoubleTap}>
        <Image source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')} style={styles.logo} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Do you want to sign out?</Text>
            <TouchableOpacity onPress={handleSignOut} style={styles.modalButton}>
              <Text style={styles.buttonText}>Yes, sign out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const JourneyJunctionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')} style={styles.backgroundImage}>
        <Header />
        <Text style={styles.description}>
          Welcome to JourneyJunction, your new go-to mobile platform designed to transform the way you record,
          discover, and share your travel experiences. Whether you're a seasoned explorer or a casual tourist,
          JourneyJunction offers an enriching platform to document every step of your journey and connect with a
          community of like-minded travelers.
        </Text>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.button}>
            <Text style={styles.buttonText}>
              Can't wait to try the app, <Text style={styles.boldText}>press here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const Login = () => {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  async function login() {
    try {
      console.log("Attempting login...");
      const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);
      if (userCredential) {
        const userUID = userCredential.user.uid;
        console.log("User authenticated successfully. UID:", userUID);
        setUserId(userUID);

        const currentUser = await getAuth().currentUser;
        if (currentUser && currentUser.uid === userUID) {
          console.log("User ID matches for accessing Firestore.");
          navigation.navigate('Home');
        } else {
          console.log("User ID does not match for accessing Firestore.");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground
        source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')}
        style={styles.backgroundImage}>
        <Header />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Log in</Text>
            <TextInput
              placeholder="Email or phone"
              value={enteredEmail}
              onChangeText={setEnteredEmail}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Password"
              value={enteredPassword}
              onChangeText={setEnteredPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => console.log('Forgot Password')}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={login} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupButton}>
              <Text style={styles.signUpText}>
                Don't have an account? <Text style={styles.signUpButtonText}>Press here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const Signup = () => {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [enteredFullName, setEnteredFullName] = useState('');
  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const auth_ = getAuth();
    const unsubscribe = onAuthStateChanged(auth_, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function signup() {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, enteredEmail, enteredPassword);
      const newUserId = userCredential.user.uid;
      await setDoc(doc(database, 'users', newUserId), {
        fullName: enteredFullName,
      });
      setUserId(newUserId);
      navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.error("Email already in use:", error.message);
        alert("Email address is already in use. Please use a different email address.");
      } else {
        console.error("Error signing up:", error);
        alert("An error occurred during sign up. Please try again later.");
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground
        source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')}
        style={styles.backgroundImage}>
        <Header />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Sign up</Text>
            <TextInput
              placeholder="Full name"
              value={enteredFullName}
              onChangeText={setEnteredFullName}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Email or phone"
              value={enteredEmail}
              onChangeText={setEnteredEmail}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Password"
              value={enteredPassword}
              onChangeText={setEnteredPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <TouchableOpacity onPress={signup} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signupButton}>
              <Text style={styles.signUpText}>
                Already have an account? <Text style={styles.signUpButtonText}>Press here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const Home = ({ navigation }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')} style={styles.backgroundImage}>
        <Header />
        <View style={styles.indexContainer}>
          <Text style={styles.indexTitle}>What is your purpose today?</Text>
          <Text style={styles.indexDescription}>Looking for inspiration for your next vacation or are you looking to inspire others travels buds?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inspire')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Inspire others</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Travel inspiration</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const Inspire = () => {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (auth.currentUser) {
      const markersCollection = collection(database, 'markers');
      const unsubscribe = onSnapshot(markersCollection, (querySnapshot) => {
        const newMarkers = [];
        querySnapshot.forEach((doc) => {
          const { latitude, longitude, imageURLs } = doc.data();
          newMarkers.push({
            coordinate: { latitude, longitude },
            imageURLs: imageURLs,
            key: doc.id,
            title: "Great place"
          });
        });
        setMarkers(newMarkers);
      });

      return () => {
        unsubscribe();
      };
    } else {
      console.log("User is not authenticated. Cannot access Firestore.");
    }
  }, []);

  async function selectImages(location) {
    try {
      console.log("Opening image picker...");
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      console.log("ImagePicker result:", result);
      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        console.log("Selected images:", selectedImages);
        setSelectedImages(selectedImages);
        await uploadImages(selectedImages, location);
      }
    } catch (error) {
      console.error("Error selecting images:", error);
      alert("There was an error selecting the images. Please try again later.");
    }
  }

  async function resizeImage(imageUri) {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }], // Ændrer bredden til 1000 pixels, justér efter behov
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Komprimer billedet og gem som JPEG
    );
    return manipResult.uri;
  }

  async function uploadWithRetry(imageUri, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageName = `${new Date().getTime()}_${attempt}.jpg`;
        const storageRef = ref(storage, 'images/' + imageName);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === retries) throw error; // Throw error after max retries
      }
    }
  }

  async function uploadImages(imageUris, location) {
    try {
      console.log("Starting image upload...");
      const uploadPromises = imageUris.map(async (imageUri, index) => {
        try {
          console.log(`Resizing image ${index + 1}...`);
          const resizedUri = await resizeImage(imageUri);
          console.log(`Uploading image ${index + 1}...`);
          return await uploadWithRetry(resizedUri);
        } catch (uploadError) {
          console.error(`Error uploading image ${index + 1}:`, uploadError);
          throw uploadError; // Propagate the error to be caught in the outer try...catch
        }
      });

      const imageUrls = await Promise.all(uploadPromises);
      console.log("All images uploaded:", imageUrls);
      const markersCollection = collection(database, 'markers');
      await addDoc(markersCollection, {
        latitude: location.latitude,
        longitude: location.longitude,
        imageURLs: imageUrls
      });

      console.log("Images uploaded and Firestore updated successfully.");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("There was an error uploading the images. Please try again later.");
    }
  }

  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: Date.now().toString(),
      title: "Great place"
    };
    setMarkers([...markers, newMarker]);
    selectImages({ latitude, longitude });
  }

  function onMarkerPressed(imageURLs, coordinate) {
    setSelectedImages(imageURLs);
    setSelectedMarker(coordinate);
    setModalVisible(true);
  }

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Error getting current location. Please try again later.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <Header />
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onLongPress={addMarker}
      >
        {markers.map((marker, index) => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => onMarkerPressed(marker.imageURLs, marker.coordinate)}
          />
        ))}
      </MapView>
      <TouchableOpacity onPress={getUserLocation} style={styles.locationbutton}>
        <Text style={styles.locationbuttonText}>Track My Location</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          {selectedMarker && (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>Latitude: {selectedMarker.latitude.toFixed(6)}</Text>
              <Text style={styles.coordinatesText}>Longitude: {selectedMarker.longitude.toFixed(6)}</Text>
            </View>
          )}
          <FlatList
            data={selectedImages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
              />
            )}
            horizontal
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="JourneyJunctionScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="JourneyJunctionScreen" component={JourneyJunctionScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Inspire" component={Inspire} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '74%',
    marginBottom: 55,
    marginTop: -9,
  },

  locationbutton: {
    backgroundColor: '#D3D3D3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },

  locationbuttonText: {
    color: "white",
    marginBottom: 10,
    fontWeight: 'bold',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'lightgray',
    padding: -10,
    borderRadius: 5,
    marginBottom: 20,
    width: 200,
    height: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  closeButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    width: 350,
    marginTop: 3,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },

  coordinatesContainer: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    width: 350,
    marginTop: 3,
    elevation: 5,
  },
  coordinatesText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },

  container: {
    flex: 1,
  },
  indexTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: -20,
    color: '#656565',
  },
  indexDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: '#656565',
  },
  indexContainer: {
    backgroundColor: 'rgba(215, 213, 213, 0.7)',
    borderRadius: 10,
    padding: 16,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 300,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { height: 5 },
    elevation: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    marginTop: -85,
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 10,
  },
  topContainerS: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 7,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },

  description: {
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -80,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    padding: 20,
    color: '#000',
    marginBottom: 120,
    fontStyle: 'italic',
  },

  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  loginContainer: {
    backgroundColor: 'rgba(215, 213, 213, 0.7)',
    borderRadius: 10,
    padding: 16,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 300,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { height: 5 },
    elevation: 10,
  },
  loginTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  inputField: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: 8,
    color: 'white',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'grey',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  signupLink: {
    marginTop: 12,
    color: '#2a2a2a',
  },

  signUpText: {
    color: 'white',
  },

  forgotPasswordText: {
    color: 'white',
  },
});

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, TextInput, ImageBackground, Modal, KeyboardAvoidingView, FlatList, ScrollView, Dimensions, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { app, database, storage } from './firebase';
import { collection, addDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const Stack = createStackNavigator();
let auth;

if (!getAuth(app)) {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
} else {
  auth = getAuth(app);
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

const Inspire = ({ navigation }) => {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [description, setDescription] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    if (auth.currentUser) {
      const markersCollection = collection(database, 'markers');
      const unsubscribe = onSnapshot(markersCollection, (querySnapshot) => {
        const newMarkers = [];
        querySnapshot.forEach((doc) => {
          const { latitude, longitude, imageURLs, description } = doc.data();
          newMarkers.push({
            coordinate: { latitude, longitude },
            imageURLs: imageURLs,
            description: description,
            key: doc.id,
            title: 'Great place',
          });
        });
        setMarkers(newMarkers);
      });

      return () => {
        unsubscribe();
      };
    } else {
      console.log('User is not authenticated. Cannot access Firestore.');
    }
  }, []);

  async function selectImages(location) {
    try {
      console.log('Opening image picker...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      console.log('ImagePicker result:', result);
      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        console.log('Selected images:', selectedImages);
        setSelectedImages(selectedImages);
        setCurrentLocation(location);
        setDescriptionModalVisible(true);
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      alert('There was an error selecting the images. Please try again later.');
    }
  }

  async function resizeImage(imageUri) {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
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
        if (attempt === retries) throw error;
      }
    }
  }

  async function uploadImages(imageUris, location, description) {
    try {
      console.log('Starting image upload...');
      const uploadPromises = imageUris.map(async (imageUri, index) => {
        try {
          console.log(`Resizing image ${index + 1}...`);
          const resizedUri = await resizeImage(imageUri);
          console.log(`Uploading image ${index + 1}...`);
          return await uploadWithRetry(resizedUri);
        } catch (uploadError) {
          console.error(`Error uploading image ${index + 1}:`, uploadError);
          throw uploadError;
        }
      });

      const imageUrls = await Promise.all(uploadPromises);
      console.log('All images uploaded:', imageUrls);
      const markersCollection = collection(database, 'markers');
      await addDoc(markersCollection, {
        latitude: location.latitude,
        longitude: location.longitude,
        imageURLs: imageUrls,
        description: description,
      });

      console.log('Images uploaded and Firestore updated successfully.');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('There was an error uploading the images. Please try again later.');
    }
  }

  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: Date.now().toString(),
      title: 'Great place',
    };
    setMarkers([...markers, newMarker]);
    selectImages({ latitude, longitude });
  }

  function onMarkerPressed(imageURLs, coordinate, description) {
    navigation.navigate('ImageGalleryScreen', { imageURLs, coordinate, description });
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

  const handleDescriptionSubmit = () => {
    setDescriptionModalVisible(false);
    if (currentLocation && selectedImages.length > 0) {
      uploadImages(selectedImages, currentLocation, description);
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <Header />
      <MapView ref={mapRef} style={styles.map} region={region} onLongPress={addMarker}>
        {markers.map((marker, index) => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => onMarkerPressed(marker.imageURLs, marker.coordinate, marker.description)}
          />
        ))}
      </MapView>
      <TouchableOpacity onPress={getUserLocation} style={styles.locationbutton}>
        <Text style={styles.locationbuttonText}>Track My Location</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={descriptionModalVisible}
        onRequestClose={() => setDescriptionModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Tell a bit about your adventure</Text>
              <ScrollView contentContainerStyle={styles.scrollContainerModal}>
                <TextInput
                  placeholder='Describe here'
                  value={description}
                  onChangeText={setDescription}
                  style={styles.inputFieldImage}
                  multiline
                />
              </ScrollView>
              <TouchableOpacity onPress={handleDescriptionSubmit} style={styles.modalButton}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const ImageGalleryScreen = ({ route }) => {
  const { imageURLs = [], coordinate, description } = route.params;
  const [address, setAddress] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        let [result] = await Location.reverseGeocodeAsync({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude
        });
        setAddress(result);
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    fetchAddress();
  }, [coordinate]);

  return (
    <SafeAreaView style={styles.galleryContainer}>
      <Header />
      <View style={styles.coordinatesContainer}>
        {address ? (
          <>
            <Text style={styles.coordinatesText}>{address.street}, {address.city}, {address.region}, {address.postalCode}, {address.country}</Text>
          </>
        ) : (
          <>
            <Text style={styles.coordinatesText}>Latitude: {coordinate.latitude.toFixed(6)}</Text>
            <Text style={styles.coordinatesText}>Longitude: {coordinate.longitude.toFixed(6)}</Text>
          </>
        )}
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {imageURLs.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.image}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
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
        <Stack.Screen name="ImageGalleryScreen" component={ImageGalleryScreen} />
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
  inputFieldImage:{
    width: 300,
    height: 300,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Mørk baggrund for modal overlay
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { height: 2 },
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'lightgrey',
    padding: 1,
    borderRadius: 5,
    marginTop: 10,
    width: 300,
    height: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  descriptionText:{
    marginTop: 20,
  },

  descriptionTextImage: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginVertical: 10,
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

  galleryContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -150,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  coordinatesContainer: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    alignItems: 'center',
    marginVertical: 20, // Øget afstand mellem headeren og koordinaterne
    marginTop: 250,
  },
  coordinatesText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    width: '80%',

  },
  image: {
    width: Dimensions.get('window').width - 20,
    height: 300,
    resizeMode: 'cover',
    marginVertical: 10,
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

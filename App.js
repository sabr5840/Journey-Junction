import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ImageBackground, Modal, KeyboardAvoidingView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { app, database, storage } from './firebase'; 
import { collection, addDoc, deleteDoc, doc, updateDoc, query, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

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
  return (
    <View style={styles.topContainer}>
      <Image source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')} style={styles.logo} />
    </View>
  );
};

const Stack = createStackNavigator();

const JourneyJunctionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')} style={styles.backgroundImage}>
        <Header> </Header>
          <Text style={styles.description}>
            Welcome to JourneyJunction, your new go-to mobile platform designed to transform the way you record,
            discover, and share your travel experiences. Whether you're a seasoned explorer or a casual tourist,
            JourneyJunction offers an enriching platform to document every step of your journey and connect with a
            community of                          like-minded travelers.
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
  const [userId, setUserId] = useState(null); // Definér userId og setUserId
  const navigation = useNavigation();

  async function login() {
    try {
      console.log("Attempting login...");
      const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);
      if (userCredential) {
        const userUID = userCredential.user.uid;
        console.log("User authenticated successfully. UID:", userUID);
        setUserId(userUID); // Update userId state
  
        // Check user ID for accessing Firestore
        const currentUser = await getAuth().currentUser;
        if (currentUser && currentUser.uid === userUID) {
          console.log("User ID matches for accessing Firestore.");
          // Proceed with navigation or other actions
          navigation.navigate('Home'); // Example navigation
        } else {
          console.log("User ID does not match for accessing Firestore.");
          // Handle mismatch error
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
        <Header> </Header>
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
  const [emailInUse, setEmailInUse] = useState(false);

  const navigation = useNavigation();

  useEffect(() =>{
    const auth_ = getAuth()
    const unsubscribe = onAuthStateChanged(auth_, (currentUser) => {
      if (currentUser){
        setUserId(currentUser.uid)
      }else{
        setUserId(null)
      }
    })
    return () => unsubscribe()
  },[])
  

  async function signup() {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, enteredEmail, enteredPassword);
      // Get the new user's ID
      const newUserId = userCredential.user.uid;
      // Save the user's full name in Firestore database
      await setDoc(doc(database, 'users', newUserId), {
        fullName: enteredFullName,
      });
      // Set the new user's ID
      setUserId(newUserId);
  
      // Navigate to Home screen after successful signup
      navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.error("Email already in use:", error.message);
        // Provide feedback to the user, e.g., display an error message
        alert("Email address is already in use. Please use a different email address.");
      } else {
        console.error("Error signing up:", error);
        // Provide generic error message to the user
        alert("An error occurred during sign up. Please try again later.");
      }
    }
  }
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
      <ImageBackground
        source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')}
        style={styles.backgroundImage}>
         <Header> </Header>
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
        <View style={styles.topContainerS}>
          <Image source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')} style={styles.logo} />
        </View>
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);
  const locationSub = useRef(null);

  useEffect(() => {
    // Make Firestore calls only if user is authenticated
    if (auth.currentUser) {
      const markersCollection = collection(database, 'markers');
      const unsubscribe = onSnapshot(markersCollection, (querySnapshot) => {
        const newMarkers = [];
        querySnapshot.forEach((doc) => {
          const { latitude, longitude, imageURL } = doc.data();
          newMarkers.push({
            coordinate: { latitude, longitude },
            imageURL: imageURL,
            key: doc.id,
            title: "Great place"
          });
        });
        setMarkers(newMarkers);
      });

      // Ensure proper cleanup
      return () => {
        unsubscribe();
        if (locationSub.current) {
          locationSub.current.remove();
        }
      };
    } else {
      // User is not authenticated, handle accordingly
      console.log("User is not authenticated. Cannot access Firestore.");
    }
  }, []);

  async function selectImage(location) {
    try {
      console.log("Selected location:", location); // Tilføj dette for at kontrollere placeringen

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log("ImagePicker result:", result);
  
      if (!result.cancelled) {
        const selectedImage = result.assets[0];
        if (!selectedImage.uri) {
          throw new Error("Selected image URI is undefined.");
        }
  
        console.log("Selected image result:", selectedImage);
  
        // Upload image to Firebase Storage
        uploadImage(selectedImage.uri, location);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      alert("There was an error selecting the image. Please try again later.");
    }
  }
  

  async function uploadImage(imageUri, location) {
    try {
      console.log("Location in uploadImage:", location); // Tilføj denne linje til at kontrollere, om 'location' er defineret korrekt

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageName = new Date().getTime() + '.jpg';
      const storageRef = ref(storage, 'images/' + imageName);

      // Upload image to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL for the uploaded image
      const downloadURL = await getDownloadURL(storageRef);

      // Save the GPS location and download URL in Firestore
      const markersCollection = collection(database, 'markers');
      await addDoc(markersCollection, {
        latitude: location.latitude,
        longitude: location.longitude,
        imageURL: downloadURL
      });

      console.log("Image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("There was an error uploading the image. Please try again later.");
    }
  }

  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const markerId = Date.now().toString(); // Generate a unique ID for the marker
    const newMarker = {
      coordinate: { latitude, longitude },
      key: markerId,
      id: markerId,
      title: "Great place"
    };
    setMarkers([...markers, newMarker]);
    console.log("Location in addMarker:", { latitude, longitude }); // Tilføj denne linje til at kontrollere placeringen


    // Call selectImage with the location of the new marker
    selectImage({ latitude, longitude });
  }

  function onMarkerPressed(imageURL, coordinate) {
    setSelectedImage(imageURL);
    setSelectedMarker(coordinate);
    setModalVisible(true);
  }



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
            key={marker.key} // Brug markørens nøgle som dens unikke identifikator
            title={marker.title}
            onPress={() => onMarkerPressed(marker.imageURL, marker.coordinate)}
          />
        ))}
      </MapView>
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
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
          />
          
          <TouchableOpacity
            style={styles.closeButton} // Justeret bredden på knappen
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
        initialRouteName="JourneyJunction"
        screenOptions={{
          headerShown: false, 
        }}>
        <Stack.Screen name="JourneyJunction" component={JourneyJunctionScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Inspire" component={Inspire} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  map:{
    width: '100%',
    height: '80%'
  },

  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
 
  closeButton: {
    position: 'center',
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
    position: 'center',
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

  signUpText:{
    color: 'white',
  },

  forgotPasswordText: {
    color: 'white',
  },

 
});

export default App;

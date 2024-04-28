import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ImageBackground, AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';


const Stack = createStackNavigator();


const JourneyJunctionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')} style={styles.backgroundImage}>
        <View style={styles.topContainer}>
          <Image source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')} style={styles.logo} />
        </View>
        <View style={styles.middleContainer}>
          <Text style={styles.description}>
            Welcome to JourneyJunction, your new go-to mobile platform designed to transform the way you record,
            discover, and share your travel experiences. Whether you're a seasoned explorer or a casual tourist,
            JourneyJunction offers an enriching platform to document every step of your journey and connect with a
            community of                       like-minded travelers.
          </Text>
        </View>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();


  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
          <View style={styles.topContainer}>
            <Image
              source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Log in</Text>
            <TextInput
              placeholder="Email or phone"
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => console.log('Forgot Password')}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Log in')} style={styles.loginButton}>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');


  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/background.png')}
        style={styles.backgroundImage}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
          <View style={styles.topContainer}>
            <Image
              source={require('/Users/sabrinahammerichebbesen/Desktop/Developer/4. semester/Mobile Development/eksamen/rejseApp/assets/logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Sign up</Text>

            <TextInput
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              secureTextEntry
              style={styles.inputField}
            />

            <TextInput
              placeholder="Email or phone"
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />

            <TouchableOpacity onPress={() => console.log('Log in')} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Navigate to Sign Up')}>
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

      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 120,
  },
  logo: {
    width: 350, 
    height: 350, 
    marginTop: 5,
    resizeMode: 'contain',
  },
  middleContainer: {
    flex: 2, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    padding: 20,
    marginTop: -350,
    fontStyle: 'italic', 
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
    marginTop: 100,
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
    backgroundColor: '#000',
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
  }


  
});

AppRegistry.registerComponent('main', () => App);
export default App;

# JourneyJunction App

## Overview
JourneyJunction is a mobile application designed to help travelers document, discover, and share travel experiences. Whether you are an experienced adventurer or a casual tourist, JourneyJunction enables you to create and share travel memories and find inspiration from others' travel experiences.

## Key Features
1. **User Authentication:**
   - **Login and Signup:** Users can create an account and log in using Firebase Authentication. The authentication supports email and password.
   - **Firebase Auth Persistence:** Maintains user login status, so they don't need to log in every time they open the app.
   
2. **Home Screen:**
   - **Inspire:** Users can share their travel experiences by creating markers on a map, uploading photos, and adding descriptions.
   - **Explore:** Users can discover new destinations by viewing markers created by others on the map.
   
3. **Map Functionality:**
   - **MapView:** Users can view and interact with markers on a map. Markers represent different travel destinations and contain photos and descriptions.
   - **Marker Creation:** Users can create markers by tapping on the map and uploading photos from their device.
   - **Geolocation:** The app uses the device's GPS to locate and display the user's current position.

4. **Photo Management:**
   - **ImagePicker:** Users can select photos from their gallery.
   - **ImageManipulator:** Used to resize photos before uploading to reduce file size and optimize performance.
   - **Firebase Storage:** Photos are uploaded to Firebase Storage, where they can be downloaded and displayed in the app.

5. **Real-time Data:**
   - **Firestore:** The app uses Firebase Firestore to store and retrieve marker data. Data is updated in real-time, so users can see new markers as soon as they are created.

6. **Navigation:**
   - **React Navigation:** The app uses React Navigation to handle navigation between different screens, including login, signup, home, inspire, explore, and gallery.

## Technologies and Libraries
1. **React Native:** The platform the app is built on, allowing development for both iOS and Android with a single codebase.
2. **Firebase:** Used for authentication, database (Firestore), and storage.
3. **Expo:** Used for photo management and geolocation.
4. **React Navigation:** Used to manage navigation within the app.
5. **react-native-maps:** Used to display maps and markers.
6. **RNPickerSelect:** Used to create dropdown menu items for category selection.
7. **ReactNativeAsyncStorage:** Used to store user data locally on the device to maintain the user's session.

## Code Structure

### App Component
The main component that contains the NavigationContainer and Stack Navigator to manage screen navigation.

### Screens
- **JourneyJunctionScreen:** The start screen with a welcome message and navigation buttons to login and signup.
- **Login:** Screen for user login with email and password.
- **Signup:** Screen for user signup with email, password, and full name.
- **Home:** Home screen with options to choose between 'Inspire' and 'Explore'.
- **Inspire:** Screen where users can create new markers by selecting photos and adding descriptions.
- **Explore:** Screen where users can explore existing markers on the map.
- **ImageGalleryScreen:** Screen that displays photos and details for a selected marker.
- **MapMarkers:** Screen that shows an explanation of the different marker colors.

### Components
- **Header:** Visual element that displays the app's logo.
- **NavigationTab:** Navigation bar with buttons to go back and log out.

### Styles
All screens and components are styled using StyleSheet from React Native to ensure a consistent and appealing user experience.

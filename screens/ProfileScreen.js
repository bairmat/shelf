import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { auth, db } from "../firebase"; // Import Firebase Auth and Firestore (No storage import)
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const ProfileScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentName(user.displayName || "No display name set");
        setProfilePic(user.photoURL); // Get profile picture from Firebase Auth

        // Fetch additional user info from Firestore (if using Firestore)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentName(userDoc.data().displayName || user.displayName);
          setProfilePic(userDoc.data().profilePic || user.photoURL);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user && displayName.trim() !== "") {
      try {
        await updateProfile(user, { displayName: displayName });

        // Save to Firestore (if using Firestore)
        await updateDoc(doc(db, "users", user.uid), { displayName });

        setCurrentName(displayName);
        setDisplayName(""); // Clear input field
      } catch (error) {
        console.error("Error updating display name:", error);
      }
    }
  };

  const saveImageLocally = async (uri) => {
    try {
      const filename = uri.split("/").pop();
      const newUri = FileSystem.documentDirectory + filename;

      // Copy the selected image to the app's document directory
      await FileSystem.copyAsync({ from: uri, to: newUri });

      // Save the image URI to be displayed as the profile picture
      setProfilePic(newUri);

      // Optionally, update the Firestore document to include the image URI
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { profilePic: newUri });
      }

      console.log("Profile picture saved locally!");
    } catch (error) {
      console.error("Error saving profile picture:", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      await saveImageLocally(selectedImage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profilePic ? { uri: profilePic } : require("../assets/default-avatar.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.label}>Tap image to change</Text>

      <Text style={styles.label}>Display Name:</Text>
      <Text style={styles.currentDisplayName}>{currentName}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter new display name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, borderWidth: 2, borderColor: "#007bff" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  currentDisplayName: { fontSize: 16, marginBottom: 15, color: "#555" },
  input: {
    width: "90%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  saveButton: { marginTop: 10, backgroundColor: "#007bff", padding: 10, borderRadius: 8 },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  logoutButton: { marginTop: 20, backgroundColor: "#dc3545", padding: 10, borderRadius: 8 },
  logoutButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default ProfileScreen;

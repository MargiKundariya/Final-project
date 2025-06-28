import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!name || !message) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields."
      });
      return;
    }

    try {
      const baseUrl = await getApiBaseUrl();
      const response = await axios.post(`${baseUrl}/api/feedback`, { name, message });

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Feedback submitted successfully!"
        });
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit feedback. Try again."
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.heading}>Give Your Feedback</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Your Feedback"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "center"
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15
  },
  textArea: {
    height: 100,
    textAlignVertical: "top"
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default FeedbackForm;

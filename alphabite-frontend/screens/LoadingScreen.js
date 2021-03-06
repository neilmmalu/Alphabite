import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import firebase from "firebase";

class LoadingScreen extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (user.displayName) {
          this.props.navigation.navigate("App");
        } else {
          this.props.navigation.navigate("CreateProfile");
        }
      } else {
        this.props.navigation.navigate("SignIn");
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingScreen;

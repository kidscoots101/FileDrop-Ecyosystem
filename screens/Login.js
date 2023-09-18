import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [username, setusername] = useState('');


  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [imageError, setImageError] = useState('');
  const [usernameError, setusernameError] = useState('')

  const navigation = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageError('');
    }
  };

  const handleLogin = () => {
    if (!email) {
      setEmailError('! Email is required !');
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('! Password is required !');
    } else {
      setPasswordError('');
    }

    if (!image) {
      setImageError('! Profile picture is required !');
    } else {
      setImageError('');
    }
    if (!username) {
      setusernameError('! Username required !')
    } else {
      setusernameError('')
    }

    if (email && password && image) {
      navigation.navigate('Home', {
        email,
        password,
        imageUri: image,
        username
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Text style={styles.addPhotoText}>Add Photo</Text>
        )}
      </TouchableOpacity>
      {imageError ? (
        <Text style={styles.errorText}>{imageError}</Text>
      ) : null}
       <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={(text) => setusername(text)}
      />
      {usernameError ? (
        <Text style={styles.errorText}>{usernameError}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      {emailError ? (
        <Text style={styles.errorText}>{emailError}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addPhotoText: {
    fontSize: 18,
    color: 'blue',
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LoginScreen;

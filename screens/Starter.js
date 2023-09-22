import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Platform,
  Image,
  TouchableOpacity
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useState, useEffect } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { FlatList } from "react-native-gesture-handler";
import Drive from '../assets/google-drive.png'

export default function Starter({ route }) {
  const [db, setDb] = useState(SQLite.openDatabase("example.db"));
  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);
  const [currentName, setCurrentName] = useState(undefined);

  const exportDb = async () => {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "SQLite/example.db",
          {
            encoding: FileSystem.EncodingType.Base64,
          },
        );

        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          "example.db",
          "application/octet-stream",
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
      } else {
        console.log("Permission not granted");
      }
    } else {
      await Sharing.shareAsync(
        FileSystem.documentDirectory + "SQLite/example.db",
      );
    }
  };

  const importDb = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (result.type === "success") {
      setIsLoading(true);

      if (
        !(
          await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")
        ).exists
      ) {
        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "SQLite",
        );
      }

      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + "SQLite/example.db",
        base64,
        { encoding: FileSystem.EncodingType.Base64 },
      );
      await db.closeAsync();
      setDb(SQLite.openDatabase("example.db"));
    }
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)",
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM names",
        null,
        (txObj, resultSet) => setNames(resultSet.rows._array),
        (txObj, error) => console.log(error),
      );
    });

    setIsLoading(false);
  }, [db]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading names...</Text>
      </View>
    );
  }

  const addName = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO names (name) values (?)",
        [currentName],
        (txObj, resultSet) => {
          let existingNames = [...names];
          existingNames.push({ id: resultSet.insertId, name: currentName });
          setNames(existingNames);
          setCurrentName(undefined);
        },
        (txObj, error) => console.log(error),
      );
    });
  };

  const deleteName = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM names WHERE id = ?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...names].filter((name) => name.id !== id);
            setNames(existingNames);
          }
        },
        (txObj, error) => console.log(error),
      );
    });
  };

  const updateName = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE names SET name = ? WHERE id = ?",
        [currentName, id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...names];
            const indexToUpdate = existingNames.findIndex(
              (name) => name.id === id,
            );
            existingNames[indexToUpdate].name = currentName;
            setNames(existingNames);
            setCurrentName(undefined);
          }
        },
        (txObj, error) => console.log(error),
      );
    });
  };

  const showNames = () => {
    return names.map((name, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text>{name.name}</Text>
          <Button title="Delete" onPress={() => deleteName(name.id)} />
          <Button title="Update" onPress={() => updateName(name.id)} />
        </View>
      );
    });
  };
  const DATA_ITEMS = [
    {
      title: "Google Drive",
      logo: Drive
    },
    {
      title: "Google Drive",
      logo: Drive
    },
    {
      title: "Google Drive",
      logo: Drive
    },
    {
      title: "Google Drive",
      logo: Drive
    },
  
  ]

  const CloudItem = ({title, logo}) => {
    return (
      <View style={styles.cloudItem}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
    </View>
    )
  }

  const { email, password, imageUri, username } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* <Text style={styles.headerText}>FileDrop</Text> */}
        <Text style={styles.headerText}>Hello 👋, {"\n"}{username}</Text>
        <Image style={styles.profileIcon} source={{ uri: imageUri }} />
      </View>
      <View style={{backgroundColor: '#6861D5', borderRadius: 18, marginTop: 50, alignSelf: 'center', height: '22%', width: '90%'}}>
        <Text style={{color: 'white', fontWeight: '600', fontSize: 20, margin: 25}}>File Transfer</Text>
        <Text style={{color: 'white', fontSize: 19, marginLeft: 25}}>Transfer files in a quick way.</Text>
    <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 50}}>
        <TouchableOpacity onPress={importDb} style={styles.transferButton}>
            <Text style={{color: 'white', fontSize: 16}}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={exportDb} style={[styles.transferButton, {marginLeft: 20}]}>
            <Text style={{color: 'white', fontSize: 16}}>Receive</Text>
        </TouchableOpacity>
        </View>

        
      </View>
        <View style={styles.namesContainer}>{showNames()}</View>
        <Text style={{alignSelf: 'flex-start', margin: 25, fontWeight: 'bold', fontSize: 30}}>Cloud Apps</Text>
        <FlatList 
        renderItem={({item}) => <CloudItem title={item.title} logo={item.logo} />}
        data={DATA_ITEMS}
        horizontal={true} 
        style={{flex:1, marginLeft: 10, marginRight: 25}}
        />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
    margin: 8,
  },
  headerContainer: {
    flexDirection: "row",
    marginTop: 80,
    marginLeft: 20,
    justifyContent: "space-between",
  },
  headerText: {
    fontWeight: "700",
    fontSize: 35,
    alignSelf: "flex-start",
    flex: 1,
  },
  profileIcon: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "black",
    alignSelf: "center",
    marginRight: 35,
  },
  transferButton: {
    backgroundColor: '#8178E1', width: '35%', alignItems: 'center', borderRadius: 18, paddingVertical: 10
  },
  cloudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    maxHeight: '20%',
    backgroundColor: '#dadada',
    borderRadius: 10, 
    marginLeft: 15
  },
  logo: {
    height: 50,
    width: 50,
    marginRight: 10,
  },
  title: {
    fontWeight: '500',
    fontSize: 15,
  },
});
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Footer from './components/Footer';
import Gameboard from './components/Gameboard';
import Header from './components/Header';
import styles from './styles/style';

export default function App() {
  return (
    <View style={styles.container}>
      <Header></Header>
      <Gameboard />
      <Footer></Footer>
      <StatusBar style="auto" />
    </View>
  );
}


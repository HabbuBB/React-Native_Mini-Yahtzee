import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/style';

export default function Footer() {
  return(
      <View style={styles.footer}>
          <Text style={styles.author}>
              Author: Aleksi Hannula
          </Text>

      </View>
  );
}

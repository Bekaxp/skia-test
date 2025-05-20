import {StyleSheet, View} from 'react-native';

import {Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Demo} from './examples';

export function Skia() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title} variant="displaySmall">
        Skia examples
      </Text>

      <Demo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
  },
});

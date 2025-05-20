import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Skia} from './skia';

export function App() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <View style={styles.root}>
          <Skia />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

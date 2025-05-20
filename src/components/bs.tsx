import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

interface Props extends React.PropsWithChildren {
  title: string;
}

export function Bs({title, children}: Props) {
  const [open, setOpen] = useState<0 | -1>(-1);

  const handlePress = () => {
    setOpen(prev => (prev === -1 ? 0 : -1));
  };

  useEffect(() => {
    console.log('open', open);
  }, [open]);

  return (
    <View style={styles.root}>
      <Button mode="contained" onPress={handlePress}>
        {title}
      </Button>

      <BottomSheet
        style={styles.bs}
        backgroundStyle={{backgroundColor: '#f3f3f3'}}
        snapPoints={['80%']}
        index={open}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        backdropComponent={() => null}
        keyboardBlurBehavior="restore"
        onClose={open !== -1 ? handlePress : undefined}>
        <BottomSheetView style={styles.bsContainer}>
          {open !== -1 ? children : null}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bs: {
    flex: 1,
  },
  bsContainer: {
    flex: 1,
  },
});

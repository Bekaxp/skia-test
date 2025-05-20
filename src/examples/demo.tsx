import {Text} from 'react-native-paper';

import {Bs} from '@/components';
import {
  Canvas,
  DashPathEffect,
  Fill,
  Group,
  Image,
  Line,
  Mask,
  Rect,
  useImage,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {LayoutChangeEvent, StyleSheet, useWindowDimensions} from 'react-native';
import {useEffect, useState} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';

export function Demo() {
  const skiaImage = useImage('https://picsum.photos/1200/800');
  const [size, setSize] = useState({width: 0, height: 0});
  const [clampedPos, setClampedPos] = useState({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });
  const [pos, setPos] = useState({x: 0, y: 0});
  const [scaleValue, setScaleValue] = useState(1);
  const [focusSize, setFocusSize] = useState({width: 0, height: 0});
  const {width} = useWindowDimensions();

  // Shared values for rectangle position
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const endScale = useSharedValue(1);

  useAnimatedReaction(
    () => ({x: x.value, y: y.value}),
    newPos => {
      runOnJS(setPos)(newPos);
    },
  );

  useAnimatedReaction(
    () => scale.value,
    newScale => {
      runOnJS(setScaleValue)(newScale);
    },
  );

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate(event => {
      if (skiaImage) {
        x.value = Math.min(
          Math.max(startX.value + event.translationX, clampedPos.minX),
          clampedPos.maxX,
        );
        y.value = Math.min(
          Math.max(startY.value + event.translationY, clampedPos.minY),
          clampedPos.maxY,
        );
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      if (skiaImage) {
        const minScaleW = size.width / imageSize.width;
        const minScaleH = size.height / imageSize.height;
        const minScale = Math.min(minScaleW, minScaleH);

        scale.value = Math.min(
          3,
          Math.max(minScale, endScale.value * event.scale),
        );
      }
    })
    .onEnd(() => {
      endScale.value = scale.value;
    });

  const gestures = Gesture.Simultaneous(dragGesture, pinchGesture);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width: w, height} = event.nativeEvent.layout;

    // width - container padding
    setSize({width: w - 32, height});
  };

  useEffect(() => {
    if (skiaImage && size.width > 0) {
      const imgWidth = skiaImage.width();
      const imgHeight = skiaImage.height();

      if (imgWidth && imgHeight) {
        const scaleFactor = imgWidth / size.width;

        if (scaleFactor >= 1) {
          // If the image is larger than the container, scale it down
          setScaleValue(size.width / imgWidth);
          setFocusSize({
            width: size.width,
            height: imgHeight * (size.width / imgWidth),
          });
        }

        if (scaleFactor < 1) {
          // If the image is smaller than the container, scale it up
          setScaleValue(1 / scaleFactor);
          setFocusSize({
            width: size.width,
            height: imgHeight * (1 / scaleFactor),
          });
        }

        setImageSize({width: imgWidth, height: imgHeight});
        setClampedPos({
          minX: Math.min(0, size.width - imgWidth),
          maxX: Math.max(0, size.width - imgWidth),
          minY: Math.min(0, size.height - imgHeight),
          maxY: Math.max(0, size.height - imgHeight),
        });
      }

      setPos({x: x.value, y: y.value});
    }
  }, [size, skiaImage]);

  return (
    <Bs title="Demo">
      {skiaImage && (
        <GestureHandlerRootView
          style={styles.canvasContainer}
          onLayout={handleLayout}>
          <GestureDetector gesture={gestures}>
            <Canvas
              style={{
                width: focusSize.width,
                height: focusSize.height,
                overflow: 'hidden',
              }}>
              <Image
                image={skiaImage}
                x={pos.x}
                y={pos.y}
                width={imageSize.width}
                height={imageSize.height}
                fit="cover"
                transform={[{scale: scaleValue}]}
              />

              {/* Focus zone - what should be cropped... */}
              <Mask
                mode="luminance"
                mask={
                  <Group>
                    <Fill color="white" />
                    <Rect
                      x={20}
                      y={20}
                      width={focusSize.width - 40}
                      height={focusSize.height - 40}
                      style="fill"
                    />
                  </Group>
                }>
                {/* Dark overlay */}
                <Rect
                  x={0}
                  y={0}
                  width={focusSize.width}
                  height={focusSize.height}
                  color="rgba(0,0,0,0.8)"
                />
              </Mask>

              {/* Grid effect inside the focused rectangle */}
              <Group>
                {Array.from({length: 3}).map((_, i) => {
                  const xStep = (focusSize.width - 40) / 3;
                  const yStep = (focusSize.height - 40) / 3;

                  return (
                    <Group key={i}>
                      {/* Vertical grid lines */}
                      <Line
                        p1={{x: 20 + xStep * i, y: 20}}
                        p2={{
                          x: 20 + xStep * i,
                          y: focusSize.height - 20,
                        }}
                        color="#00FF0080"
                        strokeWidth={1}>
                        <DashPathEffect intervals={[6, 8]} />
                      </Line>
                      {/* Horizontal grid lines */}
                      <Line
                        p1={{x: 20, y: 20 + yStep * i}}
                        p2={{x: focusSize.width - 20, y: 20 + yStep * i}}
                        color="#00FF0080"
                        strokeWidth={1}>
                        <DashPathEffect intervals={[6, 8]} />
                      </Line>
                    </Group>
                  );
                })}
              </Group>

              <Rect
                x={20}
                y={20}
                width={focusSize.width - 40}
                height={focusSize.height - 40}
                style="stroke"
                color="#00FF00"
                strokeWidth={1}
              />
            </Canvas>
          </GestureDetector>
        </GestureHandlerRootView>
      )}
    </Bs>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    paddingInline: 16,
  },
});

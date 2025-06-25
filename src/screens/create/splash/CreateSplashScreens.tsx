import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Props = { onDone: () => void };

const splashData = [
  { title: 'Splash Screen 1', desc: 'This is splash screen 1.' },
  { title: 'Splash Screen 2', desc: 'This is splash screen 2.' },
  { title: 'Splash Screen 3', desc: 'This is splash screen 3.' },
];

export default function CreateSplashScreens({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const isLast = idx === splashData.length - 1;

  const goTo = (i: number) => {
    pagerRef.current?.setPage(i);
    setIdx(i);
  };

  // Padding for iOS notch/safe area
  const topPad = Platform.OS === 'ios' ? 44 : 24;

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={['#7B68EE', '#004ba0']}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-6">
        {/* Top right close button, with extra padding for iOS notch */}
        <View style={{ position: 'absolute', top: topPad, right: 0, zIndex: 10, paddingRight: 16 }}>
          <TouchableOpacity onPress={onDone} style={{ padding: 12 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={{ fontSize: 28, color: '#fff' }}>&#10005;</Text>
          </TouchableOpacity>
        </View>
        <PagerView
          style={{ flex: 1, width: '100%' }}
          initialPage={0}
          ref={pagerRef}
          onPageSelected={e => setIdx(e.nativeEvent.position)}
        >
          {splashData.map((item, i) => (
            <View key={i} className="flex-1 justify-center items-center w-full" style={{ width }}>
              <Text className="text-3xl font-bold mb-4 text-white">{item.title}</Text>
              <Text className="text-lg text-gray-100 mb-8 text-center">{item.desc}</Text>
              {/* Only show Get Started button on last page */}
              {isLast && i === splashData.length - 1 && (
                <TouchableOpacity
                  onPress={onDone}
                  style={{ backgroundColor: '#fff', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, marginTop: 32 }}
                >
                  <Text style={{ color: '#7B68EE', fontWeight: 'bold', fontSize: 18 }}>Get Started</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </PagerView>
        {/* Swipe indicator: animated dots and chevrons as buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32, marginTop: 8 }}>
          {/* Left chevron as previous button */}
          <TouchableOpacity
            onPress={() => idx > 0 && goTo(idx - 1)}
            disabled={idx === 0}
            style={{ marginRight: 8, opacity: idx === 0 ? 0.4 : 1, padding: 8 }}
          >
            <Text style={{ fontSize: 24, color: '#fff' }}>&#10094;</Text>
          </TouchableOpacity>
          {/* Dots */}
          {splashData.map((_, i) => (
            <View
              key={i}
              style={{
                width: idx === i ? 16 : 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: idx === i ? '#fff' : 'rgba(255,255,255,0.5)'
              }}
            />
          ))}
          {/* Right chevron as next button */}
          <TouchableOpacity
            onPress={() => !isLast && goTo(idx + 1)}
            disabled={isLast}
            style={{ marginLeft: 8, opacity: isLast ? 0.4 : 1, padding: 8 }}
          >
            <Text style={{ fontSize: 24, color: '#fff' }}>&#10095;</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 
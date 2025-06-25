import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';

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

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <PagerView
        style={{ flex: 1, width: '100%' }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={e => setIdx(e.nativeEvent.position)}
      >
        {splashData.map((item, i) => (
          <View key={i} className="flex-1 justify-center items-center w-full" style={{ width }}>
            <Text className="text-3xl font-bold mb-4">{item.title}</Text>
            <Text className="text-lg text-gray-600 mb-8 text-center">{item.desc}</Text>
          </View>
        ))}
      </PagerView>
      <View className="flex-row justify-between w-full mb-8">
        <TouchableOpacity onPress={onDone} className="px-4 py-2 rounded bg-gray-300">
          <Text>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (isLast ? onDone() : goTo(idx + 1))}
          className="px-4 py-2 rounded bg-brand-500"
        >
          <Text className="text-white">{isLast ? 'Start' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-center mb-4">
        {splashData.map((_, i) => (
          <View key={i} className={`w-2 h-2 rounded-full mx-1 ${i === idx ? 'bg-brand-500' : 'bg-gray-300'}`} />
        ))}
      </View>
    </SafeAreaView>
  );
} 
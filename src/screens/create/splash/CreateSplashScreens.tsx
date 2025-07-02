import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import CreateSplash1 from '../../../../assets/icons/create_splash_1.svg';
import CreateSplash2 from '../../../../assets/icons/create_splash_2.svg';
import CreateSplash3 from '../../../../assets/icons/create_splash_3.svg';
import CreateSplash4 from '../../../../assets/icons/create_splash_4.svg';

const { width } = Dimensions.get('window');

type Props = { onDone: () => void };

const splashIcons = [CreateSplash1, CreateSplash2, CreateSplash3, CreateSplash4];
const splashData = [
  {
    title: 'Welcome to your anise Builder.',
    desc: 'Creating your powerful new group is simple. Just follow these 3 steps:\n\n1. Choose your starting template.\n2. Name & customize your Anise.\n3. Review & launch your group.'
  },
  {
    title: 'Pick Your Perfect\nStarting Point.',
    desc: "Select from our curated templates, each designed to quickly match your group's unique purpose, from managing funds to community projects."
  },
  {
    title: 'Tailor Every Detail for\nYour Group.',
    desc: 'From giving your Anise a name to setting up shared funds, defining how decisions are made, and choosing how members join – customize every aspect with ease.'
  },
  {
    title: 'Launch Your Vision. Fully\nYours.',
    desc: 'Once launched, your Anise is live!\n\nExperience full transparency and control, built exactly to your vision in just a few simple steps.'
  },
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
      colors={['#1A0C27', '#1A0C77']}
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
          {splashData.map((item, i) => {
            const IconComponent = splashIcons[i];
            const isLastSlide = i === splashData.length - 1;
            // Set SVG size: bigger for all slides
            const svgWidth = 320;
            const svgHeight = 260;
            // Set text padding for slides 2 and 3
            const textPadding = (i === 1 || i === 2) ? { paddingHorizontal: 24 } : {};
            return (
              <View key={i} className="flex-1 justify-center items-center w-full" style={{ width }}>
                {IconComponent && (
                  <View style={{ alignItems: 'center', width: svgWidth + 40, marginTop: 24, marginBottom: 32 }}>
                    <IconComponent width={svgWidth} height={svgHeight} />
                  </View>
                )}
                <Text className="text-3xl font-bold mb-4 text-white text-center">{item.title}</Text>
                <Text className="text-lg text-gray-100 mb-8 text-center" style={textPadding}>{item.desc}</Text>
                {isLastSlide ? (
                  <View style={{ minHeight: 64, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={onDone}
                      style={{ backgroundColor: '#fff', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, marginTop: 32, opacity: idx === splashData.length - 1 ? 1 : 0, position: 'relative', zIndex: 1 }}
                      disabled={idx !== splashData.length - 1}
                    >
                      <Text style={{ color: '#7B68EE', fontWeight: 'bold', fontSize: 18 }}>Start Here</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ minHeight: 64 }} />
                )}
              </View>
            );
          })}
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
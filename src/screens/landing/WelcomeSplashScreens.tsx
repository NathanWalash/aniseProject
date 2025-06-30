import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform, Animated } from 'react-native';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import SplashIcon1 from '../../../assets/icons/1_splash_icon.svg';
import SplashIcon2 from '../../../assets/icons/2_splash_icon.svg';
import SplashIcon3 from '../../../assets/icons/3_splash_icon.svg';
import SplashIcon4 from '../../../assets/icons/4_splash_icon.svg';

const { width } = Dimensions.get('window');

type Props = { onDone: () => void };

const splashIcons = [SplashIcon1, SplashIcon2, SplashIcon3, SplashIcon4];
const splashData = [
  {
    title: 'Welcome to anise.org!',
    head: 'Organising made simpler.',
    desc: 'Join us in powering community-led organisations.\n\nanise gives democratic groups the tools to orgnaise, share responsibility, and make decisions without heavy admin.'
  },
  {
    title: 'Decentralised organisations...',
    desc: '• ...are structured like smart group chats\n\n• ...are run by members, not managers\n\n• ...are governed through collective decisions\n\n• ...are transparent and cost-effective'
  },
  {
    title: 'Collaborate. Contribute.\nCreate Change.',
    desc: "Some organisations are so simple they don't need expensive management and leadership, but can suffer from poor governance.\n\nanise is a platform for democratic organisations to thrive."
  },
  { title: 'Begin your journey!',
    desc: 'Whether you are joining an existing anise or starting a new one, we are here to support your community...' },
];

export default function WelcomeSplashScreens({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const isLast = idx === splashData.length - 1;

  useEffect(() => {
    fadeAnim.setValue(0);
    buttonFadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (isLast) {
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 400,
          delay: 400,
          useNativeDriver: true,
        }).start();
      }
    });
    if (!isLast) {
      buttonFadeAnim.setValue(0);
    }
  }, [idx]);

  const goTo = (i: number) => {
    pagerRef.current?.setPage(i);
    setIdx(i);
  };

  const topPad = Platform.OS === 'ios' ? 44 : 24;

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={['#7B68EE', '#004ba0']}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-6">
        {/* Top right close button */}
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
            return (
              <View className="flex-1 justify-center items-center w-full" style={{ width, alignItems: 'center', justifyContent: 'center' }} key={i}>
                <View style={{ alignItems: 'center', width: 240 }}>
                  <IconComponent width={220} height={180} />
                </View>
                <Text className={`font-bold mb-6 text-white px-8${i === 1 || i === 0 ? ' text-center' : ''}`} style={{ fontSize: 32 }}>{item.title}</Text>
                {i === 1 ? (
                  <View className="px-8 w-full items-center">
                    {item.desc.split('• ').filter(Boolean).map((point, idx) => (
                      <Text key={idx} className="text-gray-100 mb-8 text-left w-full" style={{ fontSize: 20, maxWidth: 400 }}>
                        {'• ' + point.trim()}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-100 mb-10 text-center px-8" style={{ fontSize: 20 }}>{item.desc}</Text>
                )}
                {/* Get Started button: only in last page, but always rendered with opacity */}
                {i === splashData.length - 1 && (
                  <Animated.View style={{ opacity: buttonFadeAnim }}>
                    <TouchableOpacity
                      onPress={onDone}
                      style={{ backgroundColor: '#fff', borderRadius: 24, paddingVertical: 16, paddingHorizontal: 40, marginTop: 36 }}
                      disabled={idx !== splashData.length - 1}
                    >
                      <Text style={{ color: '#7B68EE', fontWeight: 'bold', fontSize: 22 }}>Get Started</Text>
                    </TouchableOpacity>
                  </Animated.View>
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
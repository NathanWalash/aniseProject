import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Modal, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import QRIcon from '../../../assets/icons/QR_icon.svg';

const groups = [
  {
    name: 'Surrey Car Insurance',
    price: '£50',
    period: '/month',
    members: 157,
    creator: 'John Smith',
    created: '10 June 2025',
  },
  {
    name: 'Biker Holiday Pot',
    price: '£275',
    period: '/one-off',
    members: 5657,
    creator: 'John Smith',
    created: '14 May 2005',
  },
  {
    name: 'School Insurance',
    price: '£50,000',
    period: '/yearly',
    members: 10,
    creator: 'John Smith',
    created: '1 January 2025',
  },
  {
    name: 'Travel Insurance',
    price: '£120',
    period: '/yearly',
    members: 320,
    creator: 'Jane Doe',
    created: '5 March 2023',
  },
  {
    name: 'Pet Insurance',
    price: '£30',
    period: '/month',
    members: 80,
    creator: 'Alice Smith',
    created: '12 July 2022',
  },
  {
    name: 'Home Insurance',
    price: '£400',
    period: '/yearly',
    members: 45,
    creator: 'Bob Brown',
    created: '20 August 2021',
  },
  {
    name: 'Gadget Cover',
    price: '£15',
    period: '/month',
    members: 210,
    creator: 'Charlie Green',
    created: '2 February 2024',
  },
  {
    name: 'Cycling Club',
    price: '£60',
    period: '/yearly',
    members: 150,
    creator: 'Daisy Blue',
    created: '18 November 2020',
  },
  {
    name: 'Student Health',
    price: '£200',
    period: '/yearly',
    members: 500,
    creator: 'Eve White',
    created: '9 September 2019',
  },
  {
    name: 'Community Fund',
    price: '£10',
    period: '/month',
    members: 1000,
    creator: 'Frank Black',
    created: '1 January 2018',
  },
];

const FILTERS = ['All', 'Most Recent', 'Most Popular', 'More'];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [privateCode, setPrivateCode] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: false,
    fees: false,
    groupSize: false,
    voting: false,
  });
  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCloseAdvanced = () => {
    setShowAdvanced(false);
    setOpenSections({ category: false, fees: false, groupSize: false, voting: false });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    if (currentY < 20) {
      setShowFullHeader(true);
    } else {
      setShowFullHeader(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F7] px-2 pt-2">
      {/* Collapsible Header */}
      {showFullHeader && (
        <View className="items-center mb-2 mt-6">
          <Text className="text-2xl font-bold text-center text-[#23202A] mb-2">Explore and Join Public Groups</Text>
        </View>
      )}
      {/* Prominent Inputs */}
      {showFullHeader && (
        <>
          <TextInput
            className="bg-white rounded-xl px-5 py-4 mb-3 text-lg border border-gray-300 shadow-sm mx-2"
            placeholder="Search groups..."
            placeholderTextColor="#B3AFC2"
            value={search}
            onChangeText={setSearch}
          />
          <View className="flex-row items-center mx-2 mb-3 bg-white rounded-lg border border-gray-300 shadow-sm" style={{ height: 44 }}>
            <TextInput
              className="flex-1 px-4 text-base"
              placeholder="Enter private group code..."
              placeholderTextColor="#B3AFC2"
              value={privateCode}
              onChangeText={setPrivateCode}
              style={{ height: 44, backgroundColor: 'transparent' }}
            />
            <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => {/* TODO: open QR code scanner */}}>
              <QRIcon width={28} height={28} />
            </TouchableOpacity>
          </View>
        </>
      )}
      {/* Search Bar (always visible) */}
      {!showFullHeader && (
        <TextInput
          className="bg-white rounded-xl px-5 py-4 mb-3 text-lg border border-gray-300 shadow-sm mx-2"
          placeholder="Search groups..."
          placeholderTextColor="#B3AFC2"
          value={search}
          onChangeText={setSearch}
        />
      )}
      {/* Filters (always visible) */}
      <View className="flex-row mt-2 mb-4 px-2 space-x-2 justify-between">
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              if (f === 'More') setShowAdvanced(true);
              else setFilter(f);
            }}
            className={`px-4 py-2 rounded-full ${filter === f ? 'bg-[#3B2364]' : 'bg-white border border-gray-300'}`}
          >
            <Text className={`${filter === f ? 'text-white' : 'text-[#23202A]'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Advanced Filter Modal */}
      <Modal
        visible={showAdvanced}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseAdvanced}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'space-between', marginTop: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#23202A' }}>Filters</Text>
            <TouchableOpacity onPress={handleCloseAdvanced} style={{ padding: 4 }}>
              <Text style={{ fontSize: 28, color: '#23202A' }}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => toggleSection('category')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
              <Text style={{ fontSize: 28, marginRight: 8, color: '#23202A' }}>{openSections.category ? '-' : '+'}</Text>
              <Text style={{ fontSize: 22, color: '#23202A' }}>Category</Text>
            </TouchableOpacity>
            {openSections.category && (
              <View style={{ backgroundColor: '#f6f6f6', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
                <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' }}><Text style={{ fontSize: 18, color: '#888', textAlign: 'center' }}>Phone Insurance</Text></TouchableOpacity>
                <TouchableOpacity style={{ padding: 12 }}><Text style={{ fontSize: 18, color: '#888', textAlign: 'center' }}>Car Insurance</Text></TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => toggleSection('fees')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
              <Text style={{ fontSize: 28, marginRight: 8, color: '#23202A' }}>{openSections.fees ? '-' : '+'}</Text>
              <Text style={{ fontSize: 22, color: '#23202A' }}>Fees</Text>
            </TouchableOpacity>
            {openSections.fees && (
              <View style={{ backgroundColor: '#f6f6f6', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
                <Text style={{ fontWeight: 'bold', color: '#23202A', marginBottom: 4 }}>Minimum Fee:</Text>
                <TextInput style={{ backgroundColor: '#eee', borderRadius: 6, padding: 8, marginBottom: 8 }} placeholder="(GBP)" placeholderTextColor="#aaa" />
                <Text style={{ fontWeight: 'bold', color: '#23202A', marginBottom: 4 }}>Maximum Fee:</Text>
                <TextInput style={{ backgroundColor: '#eee', borderRadius: 6, padding: 8, marginBottom: 8 }} placeholder="(GBP)" placeholderTextColor="#aaa" />
                <Text style={{ fontWeight: 'bold', color: '#23202A', marginBottom: 4 }}>Frequence:</Text>
                <View style={{ backgroundColor: '#eee', borderRadius: 6, marginBottom: 8 }}>
                  <Text style={{ padding: 8, color: '#888' }}>One-off Payment</Text>
                </View>
              </View>
            )}
            <TouchableOpacity onPress={() => toggleSection('groupSize')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
              <Text style={{ fontSize: 28, marginRight: 8, color: '#23202A' }}>{openSections.groupSize ? '-' : '+'}</Text>
              <Text style={{ fontSize: 22, color: '#23202A' }}>Group Size</Text>
            </TouchableOpacity>
            {openSections.groupSize && (
              <View style={{ backgroundColor: '#f6f6f6', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
                <Text style={{ fontWeight: 'bold', color: '#23202A', marginBottom: 4 }}>Minimum Size:</Text>
                <TextInput style={{ backgroundColor: '#eee', borderRadius: 6, padding: 8, marginBottom: 8 }} placeholder="Max" placeholderTextColor="#aaa" />
                <Text style={{ fontWeight: 'bold', color: '#23202A', marginBottom: 4 }}>Maximum Size:</Text>
                <TextInput style={{ backgroundColor: '#eee', borderRadius: 6, padding: 8, marginBottom: 8 }} placeholder="Min" placeholderTextColor="#aaa" />
              </View>
            )}
            <TouchableOpacity onPress={() => toggleSection('voting')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
              <Text style={{ fontSize: 28, marginRight: 8, color: '#23202A' }}>{openSections.voting ? '-' : '+'}</Text>
              <Text style={{ fontSize: 22, color: '#23202A' }}>Voting System</Text>
            </TouchableOpacity>
            {openSections.voting && (
              <View style={{ backgroundColor: '#f6f6f6', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: '#ddd' }}>
                <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', padding: 12 }}>Token-Weighted Voting</Text>
              </View>
            )}
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Pressable style={{ borderWidth: 1, borderColor: '#23202A', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 }} onPress={() => setShowAdvanced(false)}>
                <Text style={{ color: '#23202A', fontSize: 18 }}>Filter</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
      {/* Group List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 12 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {groups.map((group, idx) => (
          <View key={idx} className="bg-white rounded-xl p-4 mb-4 shadow-sm px-3">
            <View className="flex-row items-center mb-2">
              <View className="w-7 h-7 bg-gray-200 rounded-full items-center justify-center mr-2">
                <Text className="text-lg">👥</Text>
              </View>
              <Text className="font-bold text-lg flex-1 text-[#23202A]">{group.name}</Text>
              <Text className="font-bold text-lg text-[#23202A]">{group.price}</Text>
              <Text className="text-base text-gray-500">{group.period}</Text>
            </View>
            <Text className="text-gray-500 mb-1">{group.members} members</Text>
            <Text className="text-xs text-gray-500 mb-1">By <Text className="font-bold text-[#23202A]">{group.creator}</Text></Text>
            <Text className="text-xs text-gray-500 mb-2">Created on {group.created}</Text>
            <TouchableOpacity className="bg-[#140B33] rounded-lg py-3 mt-1" activeOpacity={0.85}><Text className="text-white text-center font-bold text-lg">Preview & Join</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 
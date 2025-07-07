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
    mandate: 'To provide affordable car insurance for Surrey residents by pooling resources and negotiating better rates.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Biker Holiday Pot',
    price: '£275',
    period: '/one-off',
    members: 5657,
    creator: 'John Smith',
    created: '14 May 2005',
    mandate: 'To help bikers save together for group holidays and adventures.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'School Insurance',
    price: '£50,000',
    period: '/yearly',
    members: 10,
    creator: 'John Smith',
    created: '1 January 2025',
    mandate: 'To ensure all students and staff are protected with comprehensive school insurance.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Travel Insurance',
    price: '£120',
    period: '/yearly',
    members: 320,
    creator: 'Jane Doe',
    created: '5 March 2023',
    mandate: 'To provide group travel insurance for frequent travelers at a reduced cost.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Pet Insurance',
    price: '£30',
    period: '/month',
    members: 80,
    creator: 'Alice Smith',
    created: '12 July 2022',
    mandate: 'To offer affordable pet insurance for all types of pets.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Home Insurance',
    price: '£400',
    period: '/yearly',
    members: 45,
    creator: 'Bob Brown',
    created: '20 August 2021',
    mandate: 'To protect homes and belongings through collective insurance.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Gadget Cover',
    price: '£15',
    period: '/month',
    members: 210,
    creator: 'Charlie Green',
    created: '2 February 2024',
    mandate: 'To insure gadgets and electronics for group members.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Cycling Club',
    price: '£60',
    period: '/yearly',
    members: 150,
    creator: 'Daisy Blue',
    created: '18 November 2020',
    mandate: 'To provide insurance and support for cycling enthusiasts.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Student Health',
    price: '£200',
    period: '/yearly',
    members: 500,
    creator: 'Eve White',
    created: '9 September 2019',
    mandate: 'To ensure students have access to affordable health insurance.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'Community Fund',
    price: '£10',
    period: '/month',
    members: 1000,
    creator: 'Frank Black',
    created: '1 January 2018',
    mandate: 'To support community members in times of need through a shared fund.',
    isCharity: false,
    creatorDescription: null
  },
  {
    name: 'LA Wildfire Fund',
    price: 'Any',
    period: '/donation',
    members: 3200,
    creator: 'anise',
    created: '15 April 2024',
    mandate: 'To provide rapid, transparent, and community-driven financial support to those affected by wildfires in Los Angeles.',
    isCharity: true,
    creatorDescription: 'LA Wildfire Fund is a non-profit Charity DAO. All proceeds go directly to wildfire relief efforts in Los Angeles. Join to see where your donations end up!'
  },
];

const groupDescriptions = [
  'A group for Surrey residents to get affordable car insurance together. Share costs and enjoy exclusive benefits.',
  'Join fellow bikers to save for the ultimate holiday adventure. One-off payment, big memories!',
  'School insurance for students and staff. Secure, reliable, and tailored for educational needs.',
  'Travel the world with peace of mind. Our group offers comprehensive yearly travel insurance.',
  'Protect your furry friends with our pet insurance group. Affordable monthly plans for all pets.',
  'Home insurance made easy for everyone. Join and get covered for less.',
  'Gadget lovers unite! Cover your devices for a small monthly fee.',
  'Cycling enthusiasts can now get yearly cover for all their rides.',
  'Student health insurance for peace of mind during your studies.',
  'A community fund for everyone. Contribute a little, help a lot.',
  'LA Wildfire Fund is a non-profit Charity DAO. All proceeds go directly to wildfire relief efforts in Los Angeles. Join to see where your donations end up!',
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
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);
  const wildfireRaised = '£42,500'; // Example amount already raised
  const wildfireDefaultAmount = 'Any amount';
  const wildfireDefaultFrequency = 'One-off, Weekly, Monthly';

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

  // Filtering logic
  let filteredGroups = groups;
  if (filter === 'Most Recent') {
    filteredGroups = [...groups].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()); //Needs to be properly fixed, can be done when configured by 'create
  } else if (filter === 'Most Popular') {
    filteredGroups = [...groups].sort((a, b) => b.members - a.members);
  } else if (filter !== 'All') {
    // Add more filter logic for other filters if needed
  }
  if (search.trim()) {
    filteredGroups = filteredGroups.filter(group =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.mandate.toLowerCase().includes(search.toLowerCase())
    );
  }

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
        {filteredGroups.map((group, idx) => (
          <View
            key={idx}
            className={`rounded-xl p-4 mb-4 shadow-sm px-3 ${group.isCharity ? '' : 'bg-white'}`}
            style={group.isCharity ? { backgroundColor: '#F6F3FA', borderWidth: 2, borderColor: '#3B2364' } : {}}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-7 h-7 bg-gray-200 rounded-full items-center justify-center mr-2">
                <Text className="text-lg">👥</Text>
              </View>
              <Text className="font-bold text-lg flex-1 text-[#23202A]">{group.name}</Text>
              {group.isCharity && (
                <View style={{ backgroundColor: '#F59E42', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Charity DAO</Text>
                </View>
              )}
              <Text style={{ color: group.isCharity ? '#3B2364' : '#23202A', fontWeight: 'bold', fontSize: 18 }}>{group.price}</Text>
              <Text style={{ color: group.isCharity ? '#3B2364' : '#6B7280', fontSize: 16 }}>{group.period}</Text>
            </View>
            <Text style={{ color: group.isCharity ? '#3B2364' : '#6B7280', marginBottom: 4 }}>{group.members} members</Text>
            <Text style={{ color: group.isCharity ? '#3B2364' : '#6B7280', fontSize: 12, marginBottom: 4 }}>By <Text style={{ fontWeight: 'bold', color: group.isCharity ? '#3B2364' : '#23202A' }}>{group.creator}</Text></Text>
            <Text style={{ color: group.isCharity ? '#3B2364' : '#6B7280', fontSize: 12, marginBottom: 8 }}>Created on {group.created}</Text>
            <TouchableOpacity className="bg-[#140B33] rounded-lg py-3 mt-1" activeOpacity={0.85} onPress={() => setSelectedGroupIdx(idx)}>
              <Text className="text-white text-center font-bold text-lg">Preview & Join</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {/* Group Details Modal */}
      <Modal
        visible={selectedGroupIdx !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedGroupIdx(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
          {/* Removed glassmorphism overlay for solid card */}
          <View style={{
            backgroundColor: '#FAF8FC',
            borderRadius: 28,
            paddingVertical: 28,
            paddingHorizontal: 28,
            width: '92%',
            maxWidth: 420,
            shadowColor: '#3B2364',
            shadowOpacity: 0.10,
            shadowRadius: 24,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(123,104,238,0.08)',
          }}>
            {selectedGroupIdx !== null && (
              <>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#23202A', marginBottom: 10, fontFamily: 'System', letterSpacing: 0.2 }}>{groups[selectedGroupIdx].name}</Text>
                <Text style={{ color: '#6B7280', fontSize: 17, marginBottom: 18, fontFamily: 'System', lineHeight: 24 }}>{groupDescriptions[selectedGroupIdx]}</Text>
                {groups[selectedGroupIdx].isCharity && groups[selectedGroupIdx].creatorDescription && (
                  <Text style={{ color: '#F59E42', fontStyle: 'italic', marginBottom: 12 }}>{groups[selectedGroupIdx].creatorDescription}</Text>
                )}
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#3B2364', marginBottom: 2, fontFamily: 'System' }}>Mandate</Text>
                <Text style={{ color: '#23202A', fontSize: 15, marginBottom: 22, fontFamily: 'System', lineHeight: 22 }}>{groups[selectedGroupIdx].mandate}</Text>
                <View style={{ height: 1.5, backgroundColor: '#ECE6F6', marginVertical: 14, borderRadius: 1 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
                  <Text style={{ color: '#23202A', fontSize: 17, fontWeight: 'bold', fontFamily: 'System' }}>{groups[selectedGroupIdx].price} {groups[selectedGroupIdx].period}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={{ color: '#23202A', fontSize: 17, fontWeight: 'bold', fontFamily: 'System' }}>{groups[selectedGroupIdx].members}</Text>
                    <Text style={{ color: '#888', fontSize: 12, marginLeft: 4, marginBottom: 1 }}>contributors</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#3B2364', marginBottom: 2, fontFamily: 'System' }}>Created by</Text>
                <Text style={{ color: '#23202A', fontSize: 15, marginBottom: 26, fontFamily: 'System' }}><Text style={{ fontWeight: 'bold' }}>{groups[selectedGroupIdx].creator}</Text> - {groups[selectedGroupIdx].created}</Text>
                {groups[selectedGroupIdx].name === 'LA Wildfire Fund' && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: '#3B2364', fontWeight: 'bold', marginBottom: 2 }}>Suggested Donation: <Text style={{ fontWeight: 'normal' }}>{wildfireDefaultAmount}</Text></Text>
                    <Text style={{ color: '#3B2364', fontWeight: 'bold', marginBottom: 2 }}>Frequency: <Text style={{ fontWeight: 'normal' }}>{wildfireDefaultFrequency}</Text></Text>
                    <Text style={{ color: '#3B2364', fontWeight: 'bold' }}>Already Raised: <Text style={{ fontWeight: 'normal' }}>{wildfireRaised}</Text></Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#3B2364', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 20, marginRight: 10, shadowColor: '#3B2364', shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }}
                    onPress={() => {/* TODO: Request to join logic */}}
                  >
                    <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: '500', letterSpacing: 0.2 }}>Request to Join</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#ECE6F6', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 18, marginLeft: 10 }}
                    onPress={() => {/* TODO: Message owner logic */}}
                  >
                    <Text style={{ color: '#3B2364', fontSize: 18, textAlign: 'center', fontWeight: '500', letterSpacing: 0.2 }}>Enquire Further</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 22 }} onPress={() => setSelectedGroupIdx(null)}>
                  <Text style={{ color: '#6B7280', fontSize: 17, fontWeight: '500', letterSpacing: 0.2 }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 
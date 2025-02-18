import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, TextInput, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import * as Location from 'expo-location';
import { fetchNearbyActivities } from '~/utils/FetchActivities';
import { filterActivitiesByDate } from '~/utils/FilterActivitiesByDate';

export default function ActivityListScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 默认筛选 "即将到来"
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [status, requestPermission] = Location.useForegroundPermissions();

  useEffect(() => {
    if (status && !status.granted && status.canAskAgain) {
      requestPermission();
    }
  }, [status]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchNearbyActivities(
          location.coords.latitude,
          location.coords.longitude
        );

        // 筛选掉已经过期的活动
        const upcomingActivities = data.filter(
          (activity: { date: string | number | Date }) => new Date(activity.date) >= new Date()
        );
        setActivities(upcomingActivities); // 设置已筛选的活动
        setFilteredActivities(upcomingActivities); // 初始显示未来的活动
      } catch (error) {
        console.error('Unexpected error:', error);
        setErrorMsg('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [location]);

  useEffect(() => {
    const filteredData = filterActivitiesByDate(activities, filter);
    setFilteredActivities(filteredData);
  }, [filter, activities]);

  useEffect(() => {
    const filteredData = activities.filter((activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredActivities(filteredData);
  }, [searchQuery, activities]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: any }) => (
    <Link href={`/activity/${item.id}`} asChild>
      <Pressable>
        <View className="mb-4 rounded-lg border p-4 shadow-md">
          <Image source={{ uri: item.image_uri }} className="mb-4 h-40 w-full rounded-md" />
          <Text className="text-xl font-semibold">{item.title}</Text>
          <Text className="text-sm text-gray-500">{formatDate(item.date)}</Text>
          <Text className="text-sm text-gray-500">{item.location}</Text>
          <Text className="text-sm text-gray-700">
            {item.attendee_count} 人已加入，距离你: {Math.round(item.dist_meters / 1000)} km
          </Text>
        </View>
      </Pressable>
    </Link>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>活动正在加载中...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 p-4">
        {/* 输入框：查找活动 */}
        <TextInput
          style={{
            height: 40,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            paddingLeft: 10,
            marginBottom: 10,
          }}
          placeholder="搜索活动"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* 分类按钮 */}
        <View className="mb-4 flex-row justify-between">
          {['upcoming', 'today', 'tomorrow', 'weekend'].map((btnFilter) => (
            <Pressable
              key={btnFilter}
              onPress={() => setFilter(btnFilter)}
              style={{
                backgroundColor: filter === btnFilter ? 'red' : 'white',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                elevation: 3, // 增加立体效果
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}>
              <Text
                style={{
                  color: filter === btnFilter ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                {btnFilter === 'upcoming'
                  ? '即将到来'
                  : btnFilter === 'today'
                    ? '今天'
                    : btnFilter === 'tomorrow'
                      ? '明天'
                      : '周末'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 活动列表 */}
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}

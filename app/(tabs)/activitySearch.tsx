import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { fetchNearbyActivities } from '~/utils/FetchActivities';
import { filterActivitiesByDate } from '~/utils/FilterActivitiesByDate';
import ActivityList from '../searchActivity/activityList';
import ActivityMap from '../searchActivity/activityMap';

export default function ActivitySearchScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 默认筛选 "即将到来"
  const [categoryFilter, setTypeFilter] = useState('all'); // 默认筛选 "即将到来"
  const [searchQuery, setSearchQuery] = useState('');
  const [status, requestPermission] = Location.useForegroundPermissions();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list'); // 用于控制视图模式

  useEffect(() => {
    if (status && !status.granted && status.canAskAgain) {
      requestPermission();
    }
  }, [status]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('请求获取用户位置失败');
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
    let filteredData = activities;

    // **1️⃣ 按时间筛选**
    if (filter === 'upcoming') {
      filteredData = activities.filter((activity) => new Date(activity.date) >= new Date());
      console.log(filteredData);
    } else {
      filteredData = filterActivitiesByDate(activities, filter);
    }

    // **2️⃣ 按搜索关键词筛选**
    if (searchQuery) {
      filteredData = filteredData.filter((activity) =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // **3️⃣ 按活动类型筛选**
    if (categoryFilter !== 'all') {
      console.log(categoryFilter);
      filteredData = filteredData.filter((activity) => activity.type === categoryFilter);
      console.log(filteredData);
    }

    // **更新最终筛选的活动列表**
    setFilteredActivities(filteredData);
  }, [filter, searchQuery, categoryFilter, activities]);

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
      <View style={{ paddingHorizontal: 16 }}>
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

        <View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', marginBottom: 10 }}>
            {['upcoming', 'today', 'tomorrow', 'weekend', 'next week', 'this month'].map(
              (btnFilter) => (
                <Pressable
                  key={btnFilter}
                  onPress={() => setFilter(btnFilter)}
                  style={{
                    backgroundColor: filter === btnFilter ? 'red' : 'white',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    marginRight: 16, // 给每个按钮加上间距，防止紧贴
                  }}>
                  <Text
                    style={{
                      color: filter === btnFilter ? 'white' : 'black',
                      fontWeight: 'bold',
                    }}>
                    {btnFilter === 'upcoming'
                      ? '推荐'
                      : btnFilter === 'today'
                        ? '今天'
                        : btnFilter === 'tomorrow'
                          ? '明天'
                          : btnFilter === 'weekend'
                            ? '周末'
                            : btnFilter === 'next week'
                              ? '下周'
                              : '本月'}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row' }}>
            {['all', 'outdoor', 'drink', 'sport', 'art', 'movie'].map((btnFilter) => (
              <Pressable
                key={btnFilter}
                onPress={() => setTypeFilter(btnFilter)}
                style={{
                  backgroundColor: categoryFilter === btnFilter ? 'red' : 'white',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  marginRight: 16, // 给每个按钮加上间距，防止紧贴
                }}>
                <Text
                  style={{
                    color: categoryFilter === btnFilter ? 'white' : 'black',
                    fontWeight: 'bold',
                  }}>
                  {btnFilter === 'all'
                    ? '全部'
                    : btnFilter === 'outdoor'
                      ? '户外'
                      : btnFilter === 'drink'
                        ? '畅饮'
                        : btnFilter === 'sport'
                          ? '运动'
                          : btnFilter === 'art'
                            ? '艺术'
                            : '电影'}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
      <View style={{ flex: 1, marginTop: 10 }}>
        {/* 根据当前视图模式渲染不同的组件 */}
        {viewMode === 'list' ? (
          <ActivityList activities={filteredActivities} onSelectActivity={() => {}} />
        ) : (
          <ActivityMap />
        )}
      </View>

      {/* 底部切换视图按钮 */}
      <View style={styles.toggleButtonContainer}>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {viewMode === 'list' ? '活动地图' : '活动列表'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleButtonContainer: {
    position: 'absolute',
    bottom: 10, // 距离底部一定距离
    left: Dimensions.get('window').width / 2 - 60, // 计算出水平居中的位置
    width: 120, // 适当设置宽度
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

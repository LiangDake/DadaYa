import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Dimensions,
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
    const filteredData = filterActivitiesByDate(activities, filter);
    setFilteredActivities(filteredData);
  }, [filter, activities]);

  useEffect(() => {
    const filteredData = activities.filter((activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredActivities(filteredData);
  }, [searchQuery, activities]);

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
      <View style={{ flex: 0.14, paddingHorizontal: 16 }}>
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
        <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          {['upcoming', 'today', 'tomorrow', 'weekend'].map((btnFilter) => (
            <Pressable
              key={btnFilter}
              onPress={() => setFilter(btnFilter)}
              style={{
                backgroundColor: filter === btnFilter ? 'red' : 'white',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                elevation: 3,
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
                  ? '为你推荐'
                  : btnFilter === 'today'
                    ? '今天'
                    : btnFilter === 'tomorrow'
                      ? '明天'
                      : '周末'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 0 }}>
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

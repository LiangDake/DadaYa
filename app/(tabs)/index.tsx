import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  Share,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons'; // 引入图标库

export default function IndexScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming'); // 当前显示活动的类型

  // 获取用户及报名的活动
  const fetchUserAndActivities = async () => {
    setLoading(true);

    // 获取当前用户
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(userData.user);
    const userId = userData.user.id;

    // 获取用户报名的活动 ID
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('activity_id')
      .eq('user_id', userId);

    if (attendanceError || !attendanceData.length) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const activityIds = attendanceData.map((a) => a.activity_id);

    // 获取活动详细信息
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .in('id', activityIds);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    setActivities(activitiesData || []);
    setLoading(false);
  };

  // 初始加载数据
  useEffect(() => {
    fetchUserAndActivities();
  }, []);

  // 下拉刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserAndActivities();
    setRefreshing(false);
  }, []);

  // 切换显示类别
  const handleTabChange = (tab: 'upcoming' | 'completed') => {
    setActiveTab(tab);
  };

  // 根据活动日期过滤活动
  const filteredActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const now = new Date();
    if (activeTab === 'upcoming') {
      return activityDate > now; // 只显示未来的活动
    } else {
      return activityDate <= now; // 只显示过去的活动
    }
  });

  // 排序活动
  const sortedActivities = filteredActivities.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
  });

  // 计算活动的星期几和剩余天数
  const getDayOfWeek = (date: string) => {
    const day = new Date(date).getDay();
    const daysOfWeek = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return daysOfWeek[day];
  };

  // 计算活动的星期几和剩余天数
  const getDayOfHour = (date: string) => {
    const day = new Date(date).getHours();
    return day;
  };

  const getDaysUntilEvent = (date: string) => {
    const today = new Date();
    const eventDate = new Date(date);
    const timeDifference = eventDate.getTime() - today.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    // 如果是已完成的活动，返回“X天前”或不显示
    if (daysDifference < 0 && activeTab === 'completed') {
      return `${Math.abs(daysDifference)}天前`;
    }

    return daysDifference >= 0 ? `${daysDifference}天后` : '';
  };

  // 分享功能
  const handleShare = async (activity: any) => {
    try {
      await Share.share({
        message: `Check out this activity: ${activity.title}\nDetails: ${activity.description}`,
      });
    } catch (error) {
      console.error('Error sharing activity', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
        <Text className="mt-4 text-gray-500">正在加载...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {user ? (
        <>
          <Text className="mb-4 text-xl font-bold">欢迎回来，{user.email}</Text>

          {/* 分类按钮 */}
          <View className="mb-4 flex-row">
            <Pressable
              onPress={() => handleTabChange('upcoming')}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              className={`mr-4 rounded p-2 ${activeTab === 'upcoming' ? 'bg-red-500 text-white' : 'text-red bg-white'}`}>
              <Text>已报名的活动</Text>
            </Pressable>
            <Pressable
              onPress={() => handleTabChange('completed')}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              className={`rounded p-2 ${activeTab === 'completed' ? 'bg-red-500 text-white' : 'text-red bg-white'}`}>
              <Text>已完成的活动</Text>
            </Pressable>
          </View>

          {/* 活动列表 */}
          <FlatList
            data={sortedActivities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                className="mb-4 rounded-lg p-4 shadow-md"
                onPress={() => router.push(`/activity/${item.id}`)}>
                <Image source={{ uri: item.image_uri }} className="mb-4 h-40 w-full rounded-md" />
                <Text className="text-xl font-semibold">{item.title}</Text>
                {/* <Text className="text-sm text-gray-500">
                  {getDayOfWeek(item.date)} · {getDaysUntilEvent(item.date)}
                </Text> */}
                <Text className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('zh-CN', {
                    month: 'numeric',
                  })}
                  {new Date(item.date).toLocaleDateString('zh-CN', {
                    day: 'numeric',
                  })}{' '}
                  {new Date(item.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {getDaysUntilEvent(item.date)}
                </Text>

                <Text className="text-sm text-gray-500">活动地点: {item.location}</Text>

                <Pressable
                  onPress={() => handleShare(item)}
                  className="absolute right-5 top-5 rounded-full bg-gray-400 p-1">
                  <MaterialIcons name="upload" size={24} color="white" />
                </Pressable>
                <Text className="text-sm text-gray-500"></Text>
                <View style={{ height: 2, backgroundColor: '#e0e0e0', marginHorizontal: -16 }} />
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="mt-4 text-center text-gray-500">您还没有报名任何活动。</Text>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </>
      ) : (
        <>
          <Text className="text-lg text-gray-700">请登录以继续</Text>
          <Button title="登录" onPress={() => navigation.replace('(auth)/login')} />
          <Button
            title="注册"
            onPress={() => navigation.replace('(auth)/signup')}
            className="mt-2"
          />
        </>
      )}
      {/* 圆形添加按钮 */}
      <Pressable
        onPress={() => navigation.navigate('createActivity/index')} // 跳转到 createActivity.tsx
        className="absolute bottom-10 right-10 h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-lg">
        <Text className="text-6xl text-white">+</Text>
      </Pressable>
    </View>
  );
}

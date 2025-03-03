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
  SafeAreaView,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { supabase } from '~/utils/supabase';
import ActivityList from '../../components/activityList';
import toggleButtonStyles from 'components/style/ButtonStyles'; // 引入样式文件
import { styles } from '~/components/HeaderButton';
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

    const userId = userData.user.id;

    // 获取报名成员信息（包括头像）
    const { data: joinedData, error: joinedError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (joinedError) {
      console.error('获取用户失败:', joinedError.message);
    } else {
      setUser(joinedData);
    }

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
        <Text className="mt-4 text-gray-500">正在加载...</Text>
      </View>
    );
  }

  return (
    <View>
      {user ? (
        <>
          {/* 分类按钮 */}
          <View className="mb-4 flex-row" style={{ paddingHorizontal: 10, marginTop: 10 }}>
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

            <Pressable onPress={() => router.push(`/modal`)}>
              <Image
                source={{ uri: user.avatar_url }}
                className="absolute left-20 h-12 w-12 rounded-full border-2 border-white"
              />
            </Pressable>
          </View>
          {/* 活动列表 */}
          <ActivityList
            activities={filteredActivities}
            onSelectActivity={() => {}}
            hideDetails={true}
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
        className="absolute bottom-20 right-10 h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-lg">
        <Text className="text-6xl text-white">+</Text>
      </Pressable>
    </View>
  );
}

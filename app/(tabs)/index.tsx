import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { supabase } from '~/utils/supabase';

export default function IndexScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

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

  // 处理登出
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigation.replace('(auth)/login');
  };

  // 下拉刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserAndActivities();
    setRefreshing(false);
  }, []);

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
          <Text className="mb-2 text-lg font-bold">您已报名的活动：</Text>

          <FlatList
            data={activities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                className="mb-4 rounded-lg border p-4 shadow-md"
                onPress={() => router.push(`/activity/${item.id}`)}>
                <Image source={{ uri: item.image_uri }} className="mb-4 h-40 w-full rounded-md" />
                <Text className="text-xl font-semibold">{item.title}</Text>
                <Text className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleString()}
                </Text>
                <Text className="text-sm text-gray-500">{item.location}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="mt-4 text-center text-gray-500">您还没有报名任何活动。</Text>
            } // 为空时显示
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // 确保支持下拉刷新
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

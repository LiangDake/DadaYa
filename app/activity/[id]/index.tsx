import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { supabase } from '~/utils/supabase';
import MapView, { Marker } from 'react-native-maps';

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // 获取活动详情 & 用户报名状态
  useEffect(() => {
    const fetchActivityAndStatus = async () => {
      setLoading(true);

      // 获取当前用户
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(userData.user);
      const userId = userData.user.id;

      // 获取活动详情
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (activityError) {
        Alert.alert('获取活动失败', activityError.message);
        setLoading(false);
        return;
      }

      setActivity(activityData);

      if (activityData?.latitude && activityData?.longitude) {
        const latitude = activityData.latitude;
        const longitude = activityData.longitude;
        setLatitude(latitude);
        setLongitude(longitude);
      }

      // 检查用户是否已报名
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_id', id)
        .single();

      setIsJoined(!!attendanceData);
      setLoading(false);
    };

    fetchActivityAndStatus();
  }, [id]);

  // 处理报名
  const handleJoinActivity = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('attendance')
      .insert([{ user_id: user.id, activity_id: id }]);

    if (error) {
      Alert.alert('报名失败', '请重试');
    } else {
      setIsJoined(true);
    }
  };

  // 处理取消报名
  const handleCancelActivity = async () => {
    if (!user) return;

    Alert.alert('确认取消报名？', '您确定要取消报名此活动吗？', [
      { text: '否', style: 'cancel' },
      {
        text: '是',
        onPress: async () => {
          const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('user_id', user.id)
            .eq('activity_id', id);

          if (error) {
            Alert.alert('取消失败', '请重试');
          } else {
            setIsJoined(false);
          }
        },
      },
    ]);
  };

  // 打开地图
  const openMap = (latitude: number, longitude: number) => {
    const appleMapURL = `maps://?q=${latitude},${longitude}`;
    const gaodeMapURL = `iosamap://viewMap?lat=${latitude}&lon=${longitude}&dev=0`;

    Alert.alert(
      '选择地图应用',
      '请选择您要使用的地图应用：',
      [
        {
          text: '苹果地图',
          onPress: () => Linking.openURL(appleMapURL),
        },
        {
          text: '高德地图',
          onPress: () => Linking.openURL(gaodeMapURL),
        },
        { text: '取消', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
        <Text className="mt-4 text-gray-500">加载中...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>活动未找到。</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="p-4">
        <Image source={{ uri: activity.image_uri }} className="mb-4 h-40 w-full rounded-md" />
        <Text className="mb-4 text-2xl font-bold">{activity.title}</Text>
        <Text className="text-sm text-gray-500">
          {new Date(activity.date).toLocaleString()}至{new Date(activity.end_date).toLocaleString()}
        </Text>

        <Link href={`/activity/${activity.id}/attendance`} className="text-lg" numberOfLines={2}>
          点击查看参与者
        </Link>
        <Text className="mt-2 text-sm">活动介绍: {activity.description}</Text>

        {/* 点击活动地点跳转到地图 */}
        {latitude && longitude && (
          <Pressable onPress={() => openMap(latitude, longitude)}>
            <Text className="mt-2 text-blue-500">活动地点: {activity.location}</Text>
          </Pressable>
        )}

        {/* 集成地图 */}
        {latitude && longitude && (
          <MapView
            style={{ height: 300, borderRadius: 10, marginTop: 20 }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker
              coordinate={{ latitude, longitude }}
              title={activity.title}
              description={activity.location}
            />
          </MapView>
        )}
      </ScrollView>

      {/* Footer 按钮 */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t-2 border-gray-300 p-5 pb-10">
        <Text className="text-xl font-semibold">免费</Text>

        {isJoined ? (
          <Pressable className="rounded-md bg-gray-500 p-5 px-8" onPress={handleCancelActivity}>
            <Text className="text-lg font-bold text-white">取消报名</Text>
          </Pressable>
        ) : (
          <Pressable className="rounded-md bg-red-500 p-5 px-8" onPress={handleJoinActivity}>
            <Text className="text-lg font-bold text-white">加入并登记</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

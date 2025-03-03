import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, Pressable } from 'react-native';
import MapView, { Callout, CalloutSubview, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '~/utils/supabase'; // 你的 Supabase 客户端
import * as Location from 'expo-location';
import { Image } from 'react-native';
import { Link, router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ActivityMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [lastRegion, setLastRegion] = useState<any>(region); // 用于保存上次的区域

  // 获取当前地理位置
  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false); // 在权限被拒绝时更新加载状态
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false); // 成功获取位置后更新加载状态
      } catch (error) {
        setErrorMsg('Error getting location');
        setLoading(false); // 获取位置失败时更新加载状态
      }
    };

    getCurrentLocation();
  }, []);

  // 触发活动数据获取
  const fetchActivities = async () => {
    if (!region || !region.latitude || !region.longitude) return; // 确保有有效的区域数据

    try {
      setLoading(true);
      const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

      // 计算地图视图的最小和最大经纬度
      const min_lat = latitude - latitudeDelta / 2;
      const max_lat = latitude + latitudeDelta / 2;
      const min_long = longitude - longitudeDelta / 2;
      const max_long = longitude + longitudeDelta / 2;

      // 调用 Supabase RPC 函数，获取当前视图区域内的活动
      const { data, error } = await supabase.rpc('coming_activities_in_view', {
        min_lat,
        min_long,
        max_lat,
        max_long,
      });

      if (error) {
        setErrorMsg('Error fetching activities');
        console.error(error);
      } else {
        setActivities(data);
      }
    } catch (error) {
      setErrorMsg('Error fetching activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 判断区域变化是否超过阈值
  const onRegionChange = (newRegion: any) => {
    const deltaLat = Math.abs(newRegion.latitude - lastRegion.latitude);
    const deltaLong = Math.abs(newRegion.longitude - lastRegion.longitude);

    if (deltaLat > 0.05 || deltaLong > 0.05) {
      setRegion(newRegion); // 更新区域
      setLastRegion(newRegion); // 更新上次区域
    }
  };

  // 格式化活动时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // 渲染标记
  const renderMarkers = () => {
    return activities.map((activity) => {
      if (!activity.latitude || !activity.longitude) {
        return null; // 如果没有有效的经纬度，跳过
      }

      return (
        <Marker
          key={activity.id}
          coordinate={{
            latitude: activity.latitude,
            longitude: activity.longitude,
          }}>
          <Callout style={{ width: 200, height: 160 }}>
            <CalloutSubview
              style={{ flex: 1 }}
              onPress={() => {
                router.push(`/activity/${activity.id}`);
              }}>
              <Link href={`/activity/${activity.id}`} asChild>
                <Pressable>
                  <View className="mb-4 rounded-lg p-4 shadow-md" style={{ width: 200 }}>
                    <Image
                      source={{ uri: activity.image_uri }}
                      style={{ height: 80, width: '100%', borderRadius: 8 }}
                    />
                    <Text style={{ fontSize: 16, fontWeight: '600', marginVertical: 8 }}>
                      {activity.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#888' }}>{formatDate(activity.date)}</Text>
                    <Text style={{ fontSize: 12, color: '#888' }}>{activity.location}</Text>
                  </View>
                </Pressable>
              </Link>
            </CalloutSubview>
          </Callout>
        </Marker>
      );
    });
  };

  // 如果正在加载
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 如果出现错误
  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 使按钮浮动在地图上方 */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={fetchActivities}>
          <Text style={styles.buttonText}>搜索此区域</Text>
        </Pressable>
      </View>
      <MapView
        style={{ width, height }}
        region={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={true}>
        {renderMarkers()}
      </MapView>
    </View>
  );
}

// 按钮浮动在地图上方的样式
const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: 20, // 控制按钮的垂直位置
    left: '50%', // 水平居中
    transform: [{ translateX: -width / 6 }], // 微调居中位置
    zIndex: 10, // 保证按钮在地图之上
    width: width / 3, // 设置按钮宽度
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 20, // 圆角边框
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

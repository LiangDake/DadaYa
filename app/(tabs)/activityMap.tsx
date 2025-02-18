import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Callout, CalloutSubview, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '~/utils/supabase'; // 你的 Supabase 客户端
import * as Location from 'expo-location';
import { Image, Pressable } from 'react-native';
import { Link, router, useNavigation } from 'expo-router';
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

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    };

    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

        // 计算地图视图的最小和最大经纬度
        const min_lat = latitude - latitudeDelta / 2;
        const max_lat = latitude + latitudeDelta / 2;
        const min_long = longitude - longitudeDelta / 2;
        const max_long = longitude + longitudeDelta / 2;

        // 调用 Supabase RPC 函数，获取当前视图区域内的活动
        const { data, error } = await supabase.rpc('activities_in_view', {
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
    const deltaLat = Math.abs(region.latitude - lastRegion.latitude);
    const deltaLong = Math.abs(region.longitude - lastRegion.longitude);

    if (deltaLat > 0.03 || deltaLong > 0.03) {
      fetchActivities();
      setLastRegion(region); // 更新 lastRegion
    }
  }, [region]);

  const onRegionChange = (newRegion: any) => {
    setRegion(newRegion);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
          <Callout style={{ width: 200 }}>
            <CalloutSubview
              style={{ flex: 1 }}
              onPress={() => {
                router.push(`/activity/${activity.id}`);
              }}>
              <Link href={`/activity/${activity.id}`} asChild>
                <Pressable>
                  <View className="mb-4 rounded-lg border p-4 shadow-md" style={{ width: 200 }}>
                    <Image
                      source={{ uri: activity.image_uri }}
                      style={{ height: 80, width: '100%', borderRadius: 8 }}
                    />
                    <Text style={{ fontSize: 16, fontWeight: '600', marginVertical: 4 }}>
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ width, height }} region={region} onRegionChangeComplete={onRegionChange}>
        {renderMarkers()}
      </MapView>
    </View>
  );
}

import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // 引入 MapView 和 Marker

import { getSuggestions, retrieveDetails } from '~/utils/AddressAutocomplete';
import { supabase } from '~/utils/supabase';

export default function AddressAutocomplete({ onSelected }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]); // 初始化为空数组
  const [selectedLocation, setSelectedLocation] = useState();
  const [accessToken, setAccessToken] = useState('');
  const [latitude, setLatitude] = useState(null); // 存储纬度
  const [longitude, setLongitude] = useState(null); // 存储经度

  useEffect(() => {
    // 获取当前 session
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        return;
      }
      setAccessToken(data.session?.access_token); // 设置 access_token
    };

    fetchSession();
  }, []);

  const search = async () => {
    const data = await getSuggestions(input, accessToken);
    // 确保 suggestions 是一个数组
    setSuggestions(data && Array.isArray(data) ? data : []);
  };

  const onSuggestionClick = async (suggestion) => {
    setSelectedLocation(suggestion);
    setInput(suggestion.name);
    setSuggestions([]);

    const details = await retrieveDetails(suggestion.id); // 获取更多详细信息
    onSelected(details);

    // 提取经纬度并更新状态
    const [long, lat] = suggestion.location.split(',').map(parseFloat);
    setLatitude(lat);
    setLongitude(long);
  };

  // 默认的天安门经纬度
  const defaultLatitude = 39.9042;
  const defaultLongitude = 116.4074;

  return (
    <View>
      <View className="flex flex-row items-center gap-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="活动地点"
          className="flex-1 rounded-md border border-gray-200 p-3"
        />
        <FontAwesome onPress={search} name="search" size={24} color="black" />
      </View>

      <View className="gap-2">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((item) => (
            <Pressable
              onPress={() => onSuggestionClick(item)}
              key={item.id}
              className="rounded border border-gray-300 p-2">
              <Text className="font-bold">{item.name}</Text>
              <Text>{item.address}</Text>
            </Pressable>
          ))
        ) : (
          <Text className="p-2 text-gray-500">暂无建议</Text>
        )}
      </View>

      {/* 集成地图 */}
      <MapView
        style={{ height: 400, borderRadius: 10, marginTop: 20 }}
        region={{
          latitude: latitude ?? defaultLatitude, // 如果 latitude 为 null 或 undefined 使用默认值
          longitude: longitude ?? defaultLongitude, // 如果 longitude 为 null 或 undefined 使用默认值
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={(region) => {
          setLatitude(region.latitude); // 更新地图中心点的纬度
          setLongitude(region.longitude); // 更新地图中心点的经度
        }}>
        <Marker
          coordinate={{
            latitude: latitude ?? defaultLatitude,
            longitude: longitude ?? defaultLongitude,
          }}
          title={selectedLocation?.name}
          description={selectedLocation?.address}
        />
      </MapView>
    </View>
  );
}

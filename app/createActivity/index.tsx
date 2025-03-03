// createActivity.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { Link, useNavigation } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { uploadImageToSupabase } from '~/utils/ImageUpload';
import { pickImage, takePhoto } from '~/components/ImagePicker';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Warning: TNodeChildrenRenderer: Support for defaultProps',
  'Warning: TRenderEngineProvider: Support for defaultProps',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps',
  'Warning: bound renderChildren: Support for defaultProps',
]);

export default function CreateActivityScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [location, setLocation] = useState(null);

  const [type, setType] = useState(null); // 存储选择的类型

  const [imageUri, setImageUri] = useState('');

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    // 如果当前时间的分钟已经大于0，调整到下一个整点
    if (now.getMinutes() > 0) {
      now.setHours(now.getHours() + 1); // 跳到下一个小时
    }
    now.setMinutes(0, 0, 0); // 将分钟和秒设置为0
    return now;
  });

  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // 将分钟和秒设置为0
    now.setHours(now.getHours() + 2); // 设定结束时间为当前时间的下两个小时的整点
    return now;
  });

  // 删除地点
  const handleLocationDelete = () => {
    setLocation(null); // 删除地点
  };
  // 删除类型
  const handleTypeDelete = () => {
    setType(null); // 删除地点
  };
  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (!error) setUser(userData.user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleCreateActivity = async () => {
    if (!title || !startDate || !endDate || !imageUri) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    setSaving(true);
    let imageUrl = '';
    if (imageUri) {
      console.log(imageUri);
      imageUrl = await uploadImageToSupabase(imageUri);
      console.log(imageUrl);
    }
    console.log(type);
    const [long, lat] = location.location.split(',').map(parseFloat);

    try {
      const { error } = await supabase.from('activities').insert([
        {
          title,
          description: description,
          date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          location: location.name,
          image_uri: imageUrl,
          host_id: user.id,
          longitude: long,
          latitude: lat,
          location_point: `POINT(${long} ${lat})`,
          type: type,
        },
      ]);

      setSaving(false);

      if (error) {
        Alert.alert('创建失败', error.message);
      } else {
        Alert.alert('成功', '活动创建成功');
        navigation.replace('(tabs)');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('创建失败', '发生意外错误');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-700">请登录以创建活动</Text>
        <Pressable
          className="mt-4 rounded-md bg-red-500 px-6 py-3"
          onPress={() => navigation.replace('(auth)/login')}>
          <Text className="text-lg font-bold text-white">去登录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <Text className="mb-4 text-xl font-bold">创建活动</Text>
          <TextInput
            className="mb-6 rounded-md bg-gray-200 p-6"
            placeholder="活动标题"
            value={title}
            onChangeText={setTitle}
          />
          <Pressable
            className="mb-6 rounded-md bg-gray-200 p-6"
            onPress={() =>
              navigation.navigate('createActivity/ActivityDescription', {
                description,
                setDescription,
              })
            }>
            {description ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text className="font-bold text-gray-700">{`活动介绍`}</Text>
                <Text className="text-blue-700" numberOfLines={1} ellipsizeMode="tail">
                  {description.length > 6 ? `${description.substring(0, 6)}...` : description}
                </Text>
              </View>
            ) : (
              <Text className="font-bold text-gray-700">活动介绍</Text>
            )}
          </Pressable>

          <Pressable
            className="mb-6 rounded-md bg-gray-200 p-6"
            onPress={() =>
              navigation.navigate('createActivity/ActivityDate', {
                startDate,
                endDate,
                setStartDate,
                setEndDate,
              })
            }>
            {startDate ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text className="font-bold text-gray-700">{'活动时间'}</Text>
                <Text className="text-gray-700">
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-
                  {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}｜
                  {endDate.toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <Text className="font-bold text-gray-700">活动时间</Text>
            )}
          </Pressable>

          <Pressable
            className="mb-6 rounded-md bg-gray-200 p-6"
            onPress={() => pickImage(setImageUri)}>
            {imageUri ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text className="font-bold text-gray-700">{'更改封面'}</Text>
                <Image source={{ uri: imageUri }} style={{ width: 177, height: 100 }} />
              </View>
            ) : (
              <Text className="font-bold text-gray-700">{'选择封面'}</Text>
            )}
          </Pressable>

          {/* 选择活动地点 */}
          <Pressable
            className="mb-6 rounded-md bg-gray-200 p-6"
            onPress={() =>
              navigation.navigate('createActivity/ActivityLocation', {
                setLocation, // 传递 setLocation 函数
              })
            }>
            {location ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text className="font-bold text-gray-700">活动地点</Text>
                <Text className="text-gray-700">{location.name}</Text>
                {/* 删除地点按钮 */}
                <Pressable onPress={handleLocationDelete}>
                  <Text style={{ color: '#ff4d4d', fontSize: 20 }}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Text className="font-bold text-gray-700">活动地点</Text>
            )}
          </Pressable>
          {/* 选择类别 */}
          <Pressable
            className="mb-6 rounded-md bg-gray-200 p-6"
            onPress={() =>
              navigation.navigate('createActivity/ActivityTypes', {
                setType,
              })
            }>
            {type ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text className="font-bold text-gray-700">活动类别</Text>
                <Text className="text-blue-700">#{type}</Text>
                {/* 删除类别按钮 */}
                <Pressable onPress={handleTypeDelete}>
                  <Text style={{ color: '#ff4d4d', fontSize: 15 }}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Text className="font-bold text-gray-700">活动类别</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {saving && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          className="w-11/12 rounded-md bg-red-500 p-4"
          onPress={handleCreateActivity}
          disabled={saving}>
          <Text className="text-center text-lg font-bold text-white">创建活动</Text>
        </Pressable>
      </View>
    </View>
  );
}

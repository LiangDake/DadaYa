// createActivity.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Image,
} from 'react-native';
import { Link, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '~/utils/supabase';
import AddressAutocomplete from '~/components/AddressAutocomplete';
import { uploadImageToSupabase } from '~/utils/ImageUpload';
import { pickImage, takePhoto } from '~/components/ImagePicker'; // 引用图片上传工具

export default function CreateActivityScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (!error) setUser(userData.user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleCreateActivity = async () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('错误', '结束时间必须晚于开始时间');
      return;
    }

    setSaving(true);
    let imageUrl = '';
    if (imageUri) {
      imageUrl = await uploadImageToSupabase(imageUri);
    }
    const [long, lat] = location.location.split(',').map(parseFloat);

    const { error } = await supabase.from('activities').insert([
      {
        title,
        description,
        date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: location.address,
        image_uri: imageUrl,
        host_id: user.id,
        longitude: long,
        latitude: lat,
        location_point: `POINT(${long} ${lat})`,
      },
    ]);

    setSaving(false);

    if (error) {
      Alert.alert('创建失败', error.message);
    } else {
      Alert.alert('成功', '活动创建成功');
      navigation.replace('(tabs)');
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <View style={{ flex: 1, padding: 22 }}>
            <Text className="mb-4 text-xl font-bold">创建新活动</Text>
            <TextInput
              className="mb-3 rounded-md border p-2"
              placeholder="活动标题"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="mb-3 h-32 rounded-md border p-2"
              placeholder="活动描述"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Pressable
              className="mb-3 rounded-md border bg-gray-200 p-2"
              onPress={() => setShowStartPicker(true)}>
              <Text className="text-gray-700">{`开始时间: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`}</Text>
            </Pressable>
            <Pressable
              className="mb-3 rounded-md border bg-gray-200 p-2"
              onPress={() => setShowEndPicker(true)}>
              <Text className="text-gray-700">{`结束时间: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`}</Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                    const endDate = new Date(selectedDate);
                    endDate.setHours(endDate.getHours() + 1); // 增加一小时
                    setEndDate(endDate);
                  }
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
            <Pressable
              className="mb-3 rounded-md border bg-gray-200 p-2"
              onPress={() => pickImage(setImageUri)}>
              <Text className="text-gray-700">{imageUri ? '更改图片' : '选择图片'}</Text>
            </Pressable>
            {imageUri ? (
              <View>
                <Text>已选图片:</Text>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 100, height: 100, marginVertical: 10 }}
                />
              </View>
            ) : null}
            <AddressAutocomplete onSelected={(location) => setLocation(location)} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

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

      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          className="w-11/12 rounded-md bg-red-500 p-4"
          onPress={handleCreateActivity}
          disabled={saving}>
          <Text className="text-center text-lg font-bold text-white">创建活动</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Pressable, TextInput, View, Text } from 'react-native';
import Toast from 'react-native-toast-message'; // 引入 Toast 组件

import Avatar from 'components/Avatar';
import { supabase } from '~/utils/supabase';
import { useNavigation } from 'expo-router'; // 用于页面导航

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user) {
        setUser(data.user);
        getProfile(data.user.id);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // 登出处理函数
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // 调用 Supabase 登出
      setUser(null); // 清除当前用户
      navigation.replace('(auth)/login'); // 跳转到登录页面
    } catch (error: any) {
      console.error('Error logging out:', error.message);
    }
  };

  async function getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name`)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setFullName(data.full_name);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to fetch profile',
      });
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user found!');

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url: avatarUrl,
        full_name: fullName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      // 显示成功 Toast 提示
      Toast.show({
        type: 'success',
        text1: '更新成功',
        text2: '你的身份已更新！',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '更新失败',
        text2: error instanceof Error ? error.message : '请重试！',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 gap-3 bg-white p-5">
      <Stack.Screen options={{ title: 'Messages' }} />

      {user ? (
        <>
          <View className="items-center">
            <Avatar
              size={200}
              url={avatarUrl}
              onUpload={(url: string) => {
                setAvatarUrl(url);
                updateProfile();
              }}
            />
          </View>

          <TextInput
            editable={false}
            value={user.email}
            placeholder="email"
            autoCapitalize="none"
            className="rounded-md border border-gray-200 p-3 text-gray-600"
          />

          <TextInput
            onChangeText={setFullName}
            value={fullName}
            placeholder="Full Name"
            autoCapitalize="none"
            className="rounded-md border border-gray-200 p-3"
          />

          <TextInput
            onChangeText={setUsername}
            value={username}
            placeholder="Username"
            autoCapitalize="none"
            className="rounded-md border border-gray-200 p-3"
          />

          <TextInput
            onChangeText={setWebsite}
            value={website}
            placeholder="Website"
            autoCapitalize="none"
            className="rounded-md border border-gray-200 p-3"
          />

          <Pressable
            onPress={updateProfile}
            disabled={loading}
            className="items-center rounded-md border-2 border-red-500 p-3 px-8">
            <Text className="text-lg font-bold text-red-500">Save</Text>
          </Pressable>

          <Button
            title="Log Out"
            onPress={handleSignOut} // 调用登出函数
            className="mt-4"
          />
        </>
      ) : (
        <Text className="text-center text-lg">请登录以继续</Text>
      )}

      {/* 全局 Toast 组件 */}
      <Toast />
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '~/utils/supabase'; // 引入 Supabase 配置
import { useRouter } from 'expo-router'; // 使用 expo-router 中的 useRouter 钩子

export default function LoginScreen() {
  const router = useRouter(); // 使用 useRouter() 获取路由对象
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 登录处理函数
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        router.replace('/(tabs)'); // 使用 router.replace 跳转到首页
      }
    } catch (error: any) {
      setError(error.message); // 显示错误信息
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="mb-4 text-xl font-bold">请输入用户名和密码</Text>

      <TextInput
        className="mb-2 w-full border p-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="mb-4 w-full border p-2"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text className="mb-4 text-red-500">{error}</Text>}

      <Button title={loading ? '正在登录...' : '登录'} onPress={handleLogin} disabled={loading} />
      <Text className="mt-4">
        还没有账号？{' '}
        <Text className="text-blue-500" onPress={() => router.replace('/(auth)/signup')}>
          点击注册
        </Text>
      </Text>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '~/utils/supabase'; // 引入 Supabase 配置
import { useNavigation } from 'expo-router'; // 用于页面导航

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 注册处理函数
  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        navigation.replace('(auth)/login'); // 注册成功，跳转到登录页面
      }
    } catch (error: any) {
      setError(error.message); // 显示错误信息
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="mb-4 text-xl font-bold">请输入邮箱和密码以注册</Text>

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

      <Button title={loading ? '注册中...' : '注册'} onPress={handleSignUp} disabled={loading} />
      <Text className="mt-4">
        已经有账号了？{' '}
        <Text className="text-blue-500" onPress={() => navigation.replace('(auth)/login')}>
          登录
        </Text>
      </Text>
    </View>
  );
}

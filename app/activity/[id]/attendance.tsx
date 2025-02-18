import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import { supabase } from '~/utils/supabase';

export default function EventAttendance() {
  const { id } = useLocalSearchParams(); // 获取活动 ID
  const [attendees, setAttendees] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchAttendees();
  }, [id]);

  const fetchAttendees = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*, profiles(*)')
      .eq('activity_id', id);

    setAttendees(data);
  };

  const handleUserClick = async (userId: string) => {
    // 假设当前用户的 ID 从 supabase.auth 获取
    const {
      data: { user },
    } = await supabase.auth.getUser(); // 使用正确的解构方式
    const currentUserId = user?.id; // 获取当前用户 ID

    if (!currentUserId || currentUserId == userId) return;

    // 生成 chatboxId，确保 sender_id 和 receiver_id 顺序一致
    const chatboxId = [currentUserId, userId].sort().join('+');
    // 使用 params 传递动态参数
    router.push({
      pathname: `/message/${chatboxId}`, // 跳转到 chatbox 页面
      params: { chatboxId, activityId: id }, // 传递 chatboxId 和 activityId
    });
  };

  return (
    <FlatList
      data={attendees}
      renderItem={({ item }) => (
        <View className="p-3">
          <TouchableOpacity onPress={() => handleUserClick(item.user_id)}>
            <Text className="font-bold">{item.profiles.username || 'User'}</Text>
          </TouchableOpacity>
        </View>
      )}
      keyExtractor={(item) => item.user_id}
    />
  );
}

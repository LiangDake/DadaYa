import { useEffect, useState } from 'react';
import { FlatList, Text, View, TouchableOpacity, Image } from 'react-native';
import { supabase } from '~/utils/supabase';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

// 定义聊天框类型
interface ChatBox {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
}

export default function MessageList() {
  const [chatBoxes, setChatBoxes] = useState<ChatBox[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChatBoxes = async () => {
      // 获取当前用户信息
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('Error fetching user:', userError?.message);
        return;
      }

      const userId = userData.user.id; // 当前用户的 ID
      // 获取当前用户参与的所有消息
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat boxes:', error.message);
        return;
      }
      // 根据 sender_id 和 receiver_id 组合来展示聊天框
      const chatBoxMap = new Map<string, ChatBox>();

      // 使用 for...of 循环，允许在循环中使用 await
      for (const message of data || []) {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const chatBoxId = [userId, otherUserId].join('+'); // 排序以确保聊天框唯一

        if (!chatBoxMap.has(chatBoxId)) {
          // 获取头像和用户名
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', otherUserId)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            return;
          }

          chatBoxMap.set(chatBoxId, {
            id: chatBoxId,
            name: profileData?.username || `User ${otherUserId}`,
            avatarUrl:
              profileData?.avatar_url ||
              'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/images/1.jpg', // 这里需要设置默认头像URL
            lastMessage: message.content,
            lastMessageTime: message.created_at,
          });
        } else {
          const chatBox = chatBoxMap.get(chatBoxId);
          if (chatBox && new Date(message.created_at) > new Date(chatBox.lastMessageTime)) {
            chatBox.lastMessage = message.content;
            chatBox.lastMessageTime = message.created_at;
          }
        }
      }

      setChatBoxes(Array.from(chatBoxMap.values()));
    };

    fetchChatBoxes();
  }, []);

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={chatBoxes}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/message/${item.id}`)}>
            <View className="mb-2 flex-row items-center rounded-lg bg-gray-200 p-4">
              <Image
                source={{ uri: item.avatarUrl }}
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
              />
              <View className="flex-1">
                <Text className="font-semibold">{item.name}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" className="text-gray-600">
                  {item.lastMessage}
                </Text>
              </View>
              <Text className="text-gray-400">
                {new Date(item.lastMessageTime).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

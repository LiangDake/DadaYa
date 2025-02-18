import { useEffect, useState } from 'react';
import { FlatList, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '~/utils/supabase';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function Messages() {
  const { id: chatBoxId } = useLocalSearchParams(); // 获取路由参数
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('Error fetching user', userError);
        setLoading(false);
        return;
      }

      setCurrentUserId(userData.user.id);
      setLoading(false);

      if (chatBoxId) {
        // 提取出两个用户的 ID
        const [userId1, userId2] = chatBoxId.split('+');
        const otherUserId = userId1 === userData.user.id ? userId2 : userId1; // 判断哪个是当前用户
        fetchMessages(userData.user.id, otherUserId);
      }
    };

    fetchUser();
  }, [chatBoxId]);

  const fetchMessages = async (currentUserId: string, otherUserId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('sender_id', [otherUserId, currentUserId])
      .in('receiver_id', [otherUserId, currentUserId])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error.message);
    } else {
      setMessages(data as Message[]);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '' || !currentUserId) return;

    const [userId1, userId2] = chatBoxId.split('+');
    const otherUserId = userId1 === currentUserId ? userId2 : userId1; // 获取对方的用户 ID

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUserId,
            receiver_id: otherUserId,
            content: message,
          },
        ])
        .select('*');

      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        setMessage('');
      }
    } finally {
      setSending(false); // 允许按钮点击
    }
  };

  useEffect(() => {
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;

          if (
            newMessage &&
            (newMessage.sender_id === currentUserId || newMessage.receiver_id === currentUserId)
          ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } else {
            console.warn('Ignored invalid message payload:', newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [currentUserId]);

  const groupMessagesByTime = (messages: Message[]) => {
    const groupedMessages: any[] = [];
    let lastTimestamp = 0;

    messages.forEach((message, index) => {
      const messageTime = new Date(message.created_at).getTime();
      const timeDifference = messageTime - lastTimestamp;

      if (timeDifference >= 5 * 60 * 1000) {
        // 每隔5分钟插入一个时间戳
        groupedMessages.push({ type: 'timestamp', time: messageTime });
      }

      groupedMessages.push(message);
      lastTimestamp = messageTime;
    });

    return groupedMessages;
  };

  const renderItem = ({ item }: { item: Message | { type: string; time: number } }) => {
    if (item.type === 'timestamp') {
      return (
        <View className="my-2 items-center">
          <Text className="text-sm text-gray-500">{new Date(item.time).toLocaleString()}</Text>
        </View>
      );
    }

    return (
      <View
        className={`mb-2 flex-row items-start ${
          item.sender_id === currentUserId ? 'justify-end' : 'justify-start'
        }`}>
        {/* 如果是发送者的消息，显示右边的头像 */}
        {item.sender_id !== currentUserId && (
          <Image
            source={{ uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/images/2.jpg' }} // TODO: 获取接收者头像
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
        )}

        <View
          className={`max-w-[70%] rounded-lg p-4 ${
            item.sender_id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
          <Text>{item.content}</Text>
        </View>

        {/* 如果是接收者的消息，显示左边的头像 */}
        {item.sender_id === currentUserId && (
          <Image
            source={{ uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/images/1.jpg' }} // TODO: 获取发送者头像
            style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 10 }}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  const groupedMessages = groupMessagesByTime(messages);

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={groupedMessages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <View className="mt-4 flex-row items-center">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 rounded-md border p-3"
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={sending}
          className="ml-2 rounded-md bg-blue-500 p-3">
          <Text className="text-center text-white">{sending ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

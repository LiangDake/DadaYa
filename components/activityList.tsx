import React, { useEffect, useState } from 'react';
import { FlatList, View, Image, Text, Pressable, Share } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';
import AvatarList from '~/components/AvatarList';

interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  image_uri: string;
  dist_meters: number;
  attendee_count: number;
}

interface ActivityListProps {
  activities: Activity[];
  onSelectActivity: (id: string) => void;
  hideDetails?: boolean;
}

const getDaysUntilEvent = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  const timeDifference = eventDate.getTime() - today.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  if (daysDifference < 0) {
    return `${Math.abs(daysDifference)}天前`;
  }
  return daysDifference >= 0 ? `${daysDifference}天后` : '';
};

// 分享功能
const handleShare = async (activity: Activity) => {
  try {
    await Share.share({
      message: `Check out this activity: ${activity.title}\nDetails: ${activity.location}`,
    });
  } catch (error) {
    console.error('Error sharing activity', error);
  }
};

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onSelectActivity,
  hideDetails = false,
}) => {
  const [userAvatars, setUserAvatars] = useState<{ [key: string]: any[] }>({});

  // 获取所有活动的参与者头像
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarsMap: { [key: string]: any[] } = {};
      for (const activity of activities) {
        const { data } = await supabase
          .from('attendance')
          .select('user_id, profiles(avatar_url)')
          .eq('activity_id', activity.id);

        if (data) {
          avatarsMap[activity.id] = data;
        }
      }
      setUserAvatars(avatarsMap);
    };

    fetchAvatars();
  }, [activities]);

  const renderItem = ({ item }: { item: Activity }) => (
    <Link href={`/activity/${item.id}`} asChild>
      <Pressable onPress={() => onSelectActivity(item.id)}>
        <View className="relative p-4">
          <View>
            {/* 活动封面 */}
            <Image source={{ uri: item.image_uri }} className="mb-4 h-60 w-full rounded-md" />
            {!hideDetails && (
              <View className="absolute bottom-11 left-1">
                <AvatarList users={userAvatars[item.id] || []} />
              </View>
            )}
            {!hideDetails && (
              <Text className="bold absolute bottom-5 left-1 text-sm text-white">
                {item.attendee_count} 人已加入
              </Text>
            )}
          </View>

          {/* 活动信息 */}
          <Text className="text-xl font-semibold">{item.title}</Text>
          <Text className="text-sm text-gray-500">
            {new Date(item.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}{' '}
            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
            {getDaysUntilEvent(item.date)}
          </Text>

          {!hideDetails && (
            <Text className="text-sm text-gray-500">
              {item.location} 距离你: {Math.round(item.dist_meters / 1000)} km
            </Text>
          )}
          {hideDetails && <Text className="text-sm text-gray-500">{item.location}</Text>}

          {/* 分享按钮 */}
          <Pressable
            onPress={() => handleShare(item)}
            className="absolute right-5 top-5 rounded-full bg-gray-400 p-1">
            <MaterialIcons name="upload" size={24} color="white" />
          </Pressable>
        </View>
        <View style={{ height: 2, backgroundColor: '#e0e0e0', marginHorizontal: -16 }} />
      </Pressable>
    </Link>
  );

  return <FlatList data={activities} keyExtractor={(item) => item.id} renderItem={renderItem} />;
};

export default ActivityList;

// ActivityList.tsx
import React from 'react';
import { FlatList, View, Image, Text, Pressable, Share } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  image_uri: string;
  attendee_count: number;
  dist_meters: number;
}

interface ActivityListProps {
  activities: Activity[];
  onSelectActivity: (id: string) => void;
  hideDetails?: boolean;
}

// 计算活动的星期几和剩余天数
const getDayOfWeek = (date: string) => {
  const day = new Date(date).getDay();
  const daysOfWeek = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return daysOfWeek[day];
};

// 计算活动的星期几和剩余天数
const getDayOfHour = (date: string) => {
  const day = new Date(date).getHours();
  return day;
};

const getDaysUntilEvent = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  const timeDifference = eventDate.getTime() - today.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  // 如果是已完成的活动，返回“X天前”或不显示
  if (daysDifference < 0) {
    return `${Math.abs(daysDifference)}天前`;
  }
  return daysDifference >= 0 ? `${daysDifference}天后` : '';
};

// 分享功能
const handleShare = async (activity: any) => {
  try {
    await Share.share({
      message: `Check out this activity: ${activity.title}\nDetails: ${activity.description}`,
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <Link href={`/activity/${item.id}`} asChild>
      <Pressable onPress={() => onSelectActivity(item.id)}>
        <View className="p-4">
          <Image source={{ uri: item.image_uri }} className="mb-4 h-60 w-full rounded-md" />
          <Text className="text-xl font-semibold">{item.title}</Text>
          <Text className="text-sm text-gray-500">
            {new Date(item.date).toLocaleDateString('zh-CN', {
              month: 'numeric',
            })}
            {new Date(item.date).toLocaleDateString('zh-CN', {
              day: 'numeric',
            })}{' '}
            {new Date(item.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {getDaysUntilEvent(item.date)}
          </Text>

          <Text className="text-sm text-gray-500">{item.location}</Text>
          <Pressable
            onPress={() => handleShare(item)}
            className="absolute right-5 top-5 rounded-full bg-gray-400 p-1">
            <MaterialIcons name="upload" size={24} color="white" />
          </Pressable>

          {!hideDetails && (
            <Text className="text-sm text-gray-700">
              {item.attendee_count} 人已加入，距离你: {Math.round(item.dist_meters / 1000)} km
            </Text>
          )}
        </View>
        <View style={{ height: 2, backgroundColor: '#e0e0e0', marginHorizontal: -16 }} />
      </Pressable>
    </Link>
  );

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

export default ActivityList;

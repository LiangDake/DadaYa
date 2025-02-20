// ActivityList.tsx
import React from 'react';
import { FlatList, View, Image, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

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
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onSelectActivity }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <Link href={`/activity/${item.id}`} asChild>
      <Pressable onPress={() => onSelectActivity(item.id)}>
        <View className="mb-4 rounded-lg p-4 shadow-md">
          <Image source={{ uri: item.image_uri }} className="mb-4 h-40 w-full rounded-md" />
          <Text className="text-xl font-semibold">{item.title}</Text>
          <Text className="text-sm text-gray-500">{formatDate(item.date)}</Text>
          <Text className="text-sm text-gray-500">{item.location}</Text>
          <Text className="text-sm text-gray-700">
            {item.attendee_count} 人已加入，距离你: {Math.round(item.dist_meters / 1000)} km
          </Text>
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

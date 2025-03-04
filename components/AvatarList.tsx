import React from 'react';
import { ScrollView, Image, Pressable } from 'react-native';
import { router, useNavigation } from 'expo-router';

interface AvatarListProps {
  users: { user_id: string; profiles?: { avatar_url?: string } }[];
}

const AvatarList: React.FC<AvatarListProps> = ({ users }) => {
  const navigation = useNavigation();

  return (
    <ScrollView horizontal className="mt-4 flex-row">
      {users.slice(0, 3).map((user, index) =>
        user.profiles?.avatar_url ? (
          <Pressable key={user.user_id} onPress={() => router.push(`/(tabs)/messageList`)}>
            <Image
              source={{ uri: user.profiles.avatar_url }}
              className="h-12 w-12 rounded-full border-2 border-white"
              style={{
                marginLeft: index === 0 ? 0 : -20, // 让头像部分重叠
              }}
            />
          </Pressable>
        ) : null
      )}
    </ScrollView>
  );
};

export default AvatarList;

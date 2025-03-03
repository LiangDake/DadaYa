import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Button } from 'react-native';
import { supabase } from '~/utils/supabase';

const ActivityTypes = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { setType } = route.params || {};
  const [activityTypes, setSupTypes] = useState<any[]>([]);
  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const { data, error } = await supabase.from('activity_types').select();
        if (error) {
          throw error;
        }
        setSupTypes(data || []);
      } catch (error) {
        console.error('无法查到类别:', error.message);
      }
    };

    fetchActivityTypes();
  }, []); // 依赖数组为空，确保只执行一次

  // 保存并返回的逻辑
  const handleSaveAndGoBack = (selectedType) => {
    if (setType) {
      setType(selectedType); // 传递所选类别
    }
    navigation.goBack(); // 返回上一页面
  };

  return (
    <View style={{ flex: 1, padding: 22 }}>
      <Text style={{ fontSize: 24 }}>选择活动类型</Text>
      <FlatList
        data={activityTypes}
        keyExtractor={(item) => item.id} // 确保 key 唯一
        renderItem={({ item }) => (
          <Pressable
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
            }}
            onPress={() => handleSaveAndGoBack(item.name)}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default ActivityTypes;

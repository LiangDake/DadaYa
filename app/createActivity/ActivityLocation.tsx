import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AddressAutocomplete from '~/components/AddressAutocomplete';

const ActivityLocation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { setLocation } = route.params; // 从上个页面接收 setLocation 函数
  const [location, setSelectedLocation] = useState(null); // 用于存储选中的地址

  // 选择地址时更新状态
  const handleLocationSelect = (selectedLocation) => {
    setSelectedLocation(selectedLocation); // 更新选中的地址
    setLocation(selectedLocation); // 调用传递过来的 setLocation 函数
  };

  // 保存并返回的逻辑
  const handleSaveAndGoBack = () => {
    if (!location) {
      // 如果没有选择地点，弹出提示
      Alert.alert('提示', '请选择一个地点', [{ text: 'OK' }]);
      return;
    }

    // 如果选择了地点，则保存并返回
    navigation.goBack(); // 返回上一页面
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
      <View style={styles.container}>
        <Text style={styles.title}>选择活动地点</Text>

        {/* 集成 AddressAutocomplete 组件 */}
        <AddressAutocomplete onSelected={handleLocationSelect} />

        {/* 显示当前选中的地址 */}
        {location && (
          <View style={styles.selectedLocation}>
            <Text style={styles.selectedText}>已选择地点:</Text>
            <Text>{location.name}</Text>
            <Text>{location.address}</Text>
          </View>
        )}

        {/* 保存并返回按钮 */}
        <Pressable
          style={[styles.saveButton, !location && styles.disabledButton]} // 如果没有选择地址，禁用按钮
          onPress={handleSaveAndGoBack}
          disabled={!location} // 如果没有选择地址，禁用按钮
        >
          <Text style={styles.saveButtonText}>保存并返回</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  selectedLocation: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedText: {
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3', // 灰色背景表示禁用状态
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ActivityLocation;

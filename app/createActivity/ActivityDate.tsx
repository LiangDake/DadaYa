import React, { useState } from 'react';
import { View, Text, Platform, Pressable, StyleSheet, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDate = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // 从 route.params 获取 startDate 和 endDate
  const { startDate, endDate, setStartDate, setEndDate } = route.params;
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const toggleStartPicker = () => {
    setShowStartPicker((prev) => !prev); // 切换显示状态
    setShowEndPicker(false); // 隐藏结束时间选择器
  };

  const toggleEndPicker = () => {
    setShowEndPicker((prev) => !prev); // 切换显示状态
    setShowStartPicker(false); // 隐藏开始时间选择器
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.dateContainer} onPress={toggleStartPicker}>
        <Text style={styles.dateText}>
          {`开始时间: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`}
        </Text>
      </Pressable>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              const newEndDate = new Date(selectedDate);
              newEndDate.setHours(newEndDate.getHours() + 1); // 增加一小时
              setEndDate(newEndDate);
              // 使用 navigation.setParams 更新返回的时间
              navigation.setParams({
                startDate: selectedDate,
                endDate: newEndDate,
              });
            }
          }}
        />
      )}

      <Pressable style={styles.dateContainer} onPress={toggleEndPicker}>
        <Text style={styles.dateText}>
          {`结束时间: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`}
        </Text>
      </Pressable>

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={startDate} // 结束时间不能早于开始时间
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate); // 使用 navigation.setParams 更新返回的结束时间
              navigation.setParams({
                endDate: selectedDate,
              });
            }
          }}
        />
      )}

      <Pressable className="rounded-md bg-red-500 p-4" onPress={() => navigation.goBack()}>
        <Text className="text-center text-lg font-bold text-white">保存时间</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  dateContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ActivityDate;

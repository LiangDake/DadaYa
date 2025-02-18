import React from 'react';
import { View, Text, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTimePickerModal = ({ visible, onClose, selectedDate, setSelectedDate }) => {
  return (
    visible && (
      <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
        <View className="w-11/12 rounded-lg bg-white p-5">
          <Text className="mb-3 text-lg">选择时间</Text>
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="default"
            onChange={(event, date) => date && setSelectedDate(date)}
          />
          <Pressable onPress={onClose} className="mt-4 rounded-md bg-red-500 p-3">
            <Text className="text-center text-white">确定</Text>
          </Pressable>
        </View>
      </View>
    )
  );
};

export default DateTimePickerModal;

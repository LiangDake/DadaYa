import { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';

const TextInputModal = ({ onSave, placeholder, initialValue }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSave = () => {
    if (!inputValue.trim()) {
      Toast.show({
        type: 'error',
        text1: '输入不能为空',
        text2: '请输入有效的内容',
      });
      return;
    }
    onSave(inputValue);
    Toast.show({
      type: 'success',
      text1: '保存成功',
      text2: '信息已保存',
    });
  };

  return (
    <View className="rounded-md bg-white p-5 shadow-md">
      <Text className="mb-3 text-lg">请输入信息</Text>
      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={placeholder}
        autoCapitalize="none"
        className="mb-4 rounded-md border border-gray-200 p-3"
      />
      <Pressable
        onPress={handleSave}
        className="mb-3 items-center rounded-md border-2 border-red-500 p-3 px-8">
        <Text className="text-lg font-bold text-red-500">保存</Text>
      </Pressable>
      <Pressable
        onPress={() => setInputValue('')}
        className="items-center rounded-md border-2 border-gray-200 p-3">
        <Text className="text-lg font-bold text-gray-500">清空</Text>
      </Pressable>
    </View>
  );
};

export default TextInputModal;

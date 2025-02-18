import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { pickImage } from '~/components/ImagePicker'; // 图片选择工具

const ImagePickerModal = ({ visible, onClose, setImageUri }) => {
  const handleImagePick = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri);
      onClose();
    }
  };

  return (
    visible && (
      <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
        <View className="w-11/12 rounded-lg bg-white p-5">
          <Text className="mb-3 text-lg">选择图片</Text>
          <Pressable onPress={handleImagePick} className="mb-3 rounded-md bg-blue-500 p-3">
            <Text className="text-center text-white">选择图片</Text>
          </Pressable>
          {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />}
          <Pressable onPress={onClose} className="mt-4 rounded-md bg-red-500 p-3">
            <Text className="text-center text-white">关闭</Text>
          </Pressable>
        </View>
      </View>
    )
  );
};

export default ImagePickerModal;

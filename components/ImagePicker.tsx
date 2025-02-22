// utils/ImagePickerUtil.tsx
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
export const pickImage = async (setImageUri: React.Dispatch<React.SetStateAction<string>>) => {
  // 请求相机权限
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (permissionResult.granted === false) {
    Alert.alert('没有权限', '我们需要您的相机权限');
    return;
  }

  // 弹出图片选择器
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], // 选择图片
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.7,
  });

  // 确保用户选择了图片
  if (!result.canceled && result.assets?.length > 0) {
    const uri = result.assets[0].uri;
    // 压缩图片，调整质量或分辨率
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // 可选：调整图片大小（例如：宽度为800px）
      { compress: 0.7 } // 压缩图片，0.7表示70%的质量
    );
    setImageUri(manipulatedImage.uri); // 更新图片 URI
  }
};

export const takePhoto = async (setImageUri: React.Dispatch<React.SetStateAction<string>>) => {
  // 请求相机权限
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (permissionResult.granted === false) {
    Alert.alert('没有权限', '我们需要您的相机权限');
    return;
  }

  // 启动拍照
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.cancelled) {
    setImageUri(result.uri); // 设置拍照后的图片 URI
  }
};

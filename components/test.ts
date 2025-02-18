import React from 'react';
import { Button, Alert } from 'react-native';
import OSS from 'aliyun-oss-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const uploadImageToAliyun = async (uri: string) => {
  try {
    // 配置阿里云 OSS
    const client = new OSS({
      accessKeyId: 'your-access-key-id',
      accessKeySecret: 'your-access-key-secret',
      bucket: 'your-bucket-name',
      region: 'oss-cn-hangzhou', // 或者你实际的 OSS 区域
    });

    // 获取文件名和扩展名
    const fileExt = uri.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error('无法获取文件扩展名');
    }

    const path = `activity_image_${Date.now()}.${fileExt}`;

    // 上传图片到阿里云 OSS
    const result = await client.put(path, uri); // 这里传入本地文件路径

    if (result.res.status === 200) {
      // 上传成功，获取图片的公开 URL
      const publicUrl = `https://${result.bucket}.oss-cn-hangzhou.aliyuncs.com/${path}`;
      console.log('图片已上传，URL:', publicUrl);
      return publicUrl;
    } else {
      throw new Error('图片上传失败');
    }
  } catch (error) {
    console.error('图片上传失败', error);
    throw error;
  }
};

const chooseImageAndUpload = () => {
  // 打开图片库，选择图片
  launchImageLibrary({}, async (response) => {
    if (response.didCancel) {
      Alert.alert('用户取消选择图片');
    } else if (response.errorCode) {
      Alert.alert('图片选择失败', response.errorMessage);
    } else {
      const uri = response.assets[0].uri; // 获取图片 URI
      console.log('选择的图片 URI:', uri);

      // 调用上传函数
      try {
        const uploadedUrl = await uploadImageToAliyun(uri);
        Alert.alert('图片上传成功', `图片 URL: ${uploadedUrl}`);
      } catch (error) {
        Alert.alert('上传失败', error.message);
      }
    }
  });
};

export default function App() {
  return <Button title="选择图片并上传" onPress={chooseImageAndUpload} />;
}

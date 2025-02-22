import { Client, Databases, ID, Storage } from 'react-native-appwrite';
const endpoint = 'https://cloud.appwrite.io/v1';
const projectId = '67b95a95002edf553826';
const bucketId = '67b95b880009a6296c08';
// 初始化客户端
const client = new Client()
  .setEndpoint(endpoint) // Appwrite 服务器的 URL
  .setProject(projectId); // 你的项目 ID

// 初始化 Storage 服务
const storage = new Storage(client);

export const uploadImageToSupabase = async (uri: string) => {
  try {
    // 1. 获取图片的二进制数据
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `activity_image_${Date.now()}.png`; // 文件名可以根据需求设置
    const fileSize = blob.size; // 文件大小
    const fileType = blob.type; // 文件类型

    // 2. 构造文件对象
    const file = {
      name: fileName,
      type: fileType,
      size: fileSize,
      uri: uri, // 如果你希望使用文件 URI，可以传递
    };
    console.log('start uploading');
    // 2. 使用 Appwrite Storage 上传文件
    const result = await storage.createFile(
      bucketId, // bucketId
      ID.unique(), // fileId
      file // file
    );
    const fileId = result.$id;

    // 3. 返回文件的公开 URL
    const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}&mode=admin`;
    console.log('图片已上传，URL:', fileUrl);
    return fileUrl; // 返回文件的 URL
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error; // 抛出错误
  }
};

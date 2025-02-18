import { supabase } from '~/utils/supabase';

export const uploadImageToSupabase = async (uri: string) => {
  try {
    // 获取图片扩展名
    const fileExt = uri.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error('无法获取文件扩展名');
    }

    // 获取图片文件路径
    const path = `activity_image_${Date.now()}.${fileExt}`;

    // 使用 fetch 获取图片并转为 ArrayBuffer
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    // 上传图片到 Supabase 存储桶
    const { data, error } = await supabase.storage
      .from('activity_images')
      .upload(path, arrayBuffer, {
        contentType: `image/${fileExt}`,
      });

    if (error) {
      throw error;
    }

    // 获取图片的公开 URL
    const { data: publicData } = supabase.storage.from('activity_images').getPublicUrl(path);

    const publicUrl = publicData.publicUrl;
    console.log('图片已上传，URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('图片上传失败', error);
    throw error;
  }
};

// // const OSS = require('ali-oss');
// import OSS from 'ali-oss';
// export const uploadImageToAliyun = async (uri: string) => {
//   try {
//     // 获取图片扩展名
//     const fileExt = uri.split('.').pop()?.toLowerCase();
//     if (!fileExt) {
//       throw new Error('无法获取文件扩展名');
//     }

//     // 获取图片文件路径
//     const path = `activity_image_${Date.now()}.${fileExt}`;

//     // 使用 fetch 获取图片并转为 ArrayBuffer
//     const response = await fetch(uri);
//     const arrayBuffer = await response.arrayBuffer();

//     // 初始化阿里云 OSS 客户端
//     const client = new OSS({
//       region: 'oss-cn-beijing', // 区域，如 oss-cn-hangzhou
//       accessKeyId: 'LTAI5t6KfMNLR8suz8g9ARY7',
//       accessKeySecret: 'sYANkC8HKtdBbt4YmDegMS30zPVDYi',
//       bucket: 'meetup-activity-images',
//     });

//     // 自定义请求头
//     const headers = {
//       'x-oss-storage-class': 'Standard', // 存储类型
//       'x-oss-object-acl': 'public-read-write', // 访问权限
//       'x-oss-forbid-overwrite': 'true', // 禁止覆盖
//     };

//     // 上传图片到阿里云 OSS
//     const result = await client.put(path, new OSS.Buffer(arrayBuffer), { headers });

//     if (result.res.status !== 200) {
//       throw new Error('图片上传失败');
//     }

//     // 获取图片的公开 URL
//     const publicUrl = `https://${result.bucket}.oss-cn-beijing.aliyuncs.com/${path}`;
//     console.log('图片已上传，URL:', publicUrl);
//     return publicUrl;
//   } catch (error) {
//     console.error('图片上传失败', error);
//     throw error;
//   }
// };

// const OSS = require('ali-oss');
// const path = require('path');

// const client = new OSS({
//   // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
//   region: 'oss-cn-beijing', // 区域，如 oss-cn-hangzhou
//   accessKeyId: 'LTAI5t6KfMNLR8suz8g9ARY7',
//   accessKeySecret: 'sYANkC8HKtdBbt4YmDegMS30zPVDYi',
//   bucket: 'meetup-activity-images',
// });

// // 自定义请求头
// const headers = {
//   // 指定Object的存储类型。
//   'x-oss-storage-class': 'Standard',
//   // 指定Object的访问权限。
//   'x-oss-object-acl': 'public-read-write',
//   // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
//   'x-oss-forbid-overwrite': 'true',
// };

// async function put() {
//   try {
//     // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
//     // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
//     const result = await client.put(
//       'ni.png',
//       path.normalize('/Users/liangdake/Downloads/ni.jpg'),
//       // 自定义headers
//       { headers }
//     );
//     console.log(result);
//   } catch (e) {
//     console.log(e);
//   }
// }

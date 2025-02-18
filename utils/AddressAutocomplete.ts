const API_BASE_URL = 'https://restapi.amap.com/v3/place/text';
const apiKey = 'e64f8fbf85db54ba2baa440b9d44c9e4'; // 使用你的高德 API 密钥

export async function getSuggestions(input: string, session_token: string) {
  // 构建请求 URL，添加关键词（input）和城市（默认为上海）
  const url = `${API_BASE_URL}?key=${apiKey}&keywords=${input}&city=上海&extensions=all`;

  const response = await fetch(url);

  if (!response.ok) {
    console.error('API request failed with status:', response.status);
    return { suggestions: [] }; // 如果请求失败，返回空数组
  }

  const json = await response.json();

  // 返回响应中的地点建议数据（如果有的话）
  if (json.pois) {
    return json.pois.map((poi) => ({
      id: poi.id,
      name: poi.name,
      address: poi.address,
      location: poi.location,
      type: poi.type,
      tel: poi.tel,
    }));
  }

  return [];
}

export const retrieveDetails = async (id: string) => {
  const url = `https://restapi.amap.com/v3/place/detail?key=${apiKey}&id=${id}`;

  const response = await fetch(url);

  if (!response.ok) {
    console.error('API request failed with status:', response.status);
    return null; // 如果请求失败，返回 null
  }

  const json = await response.json();

  // 如果有详细信息，则返回
  if (json.pois && json.pois.length > 0) {
    const poi = json.pois[0]; // 取第一个地点的详细信息
    return {
      name: poi.name,
      address: poi.address,
      location: poi.location,
      tel: poi.tel,
      website: poi.website,
      photos: poi.photos,
      biz_ext: poi.biz_ext,
      rating: poi.biz_ext?.rating || null,
    };
  }

  return null;
};

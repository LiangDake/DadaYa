import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Pressable, TextInput } from 'react-native';
import { useNavigation } from 'expo-router';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
const ActivityDescriptionScreen = () => {
  const [description, setDescription] = useState('');
  const editorRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();

  // 从父页面传递过来的初始描述和 setDescription
  const { description: initialDescription, setDescription: parentSetDescription } =
    route.params || {};

  useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription); // 设置初始值
    }
  }, [initialDescription]);

  const handleSave = () => {
    if (parentSetDescription) {
      parentSetDescription(description); // 更新父页面的描述
    }
    navigation.goBack(); // 返回上一页
  };

  // 将富文本编辑器的内容传回父组件
  const handleEditorChange = (text: string) => {
    setDescription(text);
  };

  return (
    <View style={{ flex: 1, padding: 22 }}>
      <TextInput
        className="h-96 rounded-md border p-2"
        placeholder="活动描述"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Pressable
        style={{
          marginTop: 16,
          borderRadius: 12,
          padding: 16,
          backgroundColor: '#ff4d4d',
          alignItems: 'center',
        }}
        onPress={handleSave}>
        <Text style={{ color: 'white', fontSize: 16 }}>保存并返回</Text>
      </Pressable>
    </View>
  );
};

export default ActivityDescriptionScreen;

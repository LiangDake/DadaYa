// ModalWrapper.tsx (用于包装 Modal 组件，统一管理弹窗显示)
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const ModalWrapper = ({ visible, onClose, children }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
        <View className="w-11/12 rounded-lg bg-white p-5">
          <TouchableOpacity onPress={onClose} className="absolute right-3 top-3">
            <Text className="text-xl text-gray-500">X</Text>
          </TouchableOpacity>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default ModalWrapper;

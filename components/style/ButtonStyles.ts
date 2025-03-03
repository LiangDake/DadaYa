import { StyleSheet } from 'react-native';

const toggleButtonStyles = StyleSheet.create({
  toggleButtonContainer: {
    position: 'absolute',
    bottom: 20, // 距离底部的间距
    alignSelf: 'center', // 水平居中
  },
  toggleButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default toggleButtonStyles;

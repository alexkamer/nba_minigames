import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface HintButtonProps {
  label: string;
  onPress: () => void;
  disabled: boolean;
  revealed: boolean;
}

const HintButton: React.FC<HintButtonProps> = ({
  label,
  onPress,
  disabled,
  revealed,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        revealed && styles.revealed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, revealed && styles.revealedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: Colors.wrong,
    opacity: 0.5,
  },
  revealed: {
    backgroundColor: Colors.exact,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  revealedText: {
    color: Colors.text,
  },
});

export default HintButton;

// constants/theme.js
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const COLORS = {
  screenBackgroundGradientStart: '#EADCCF',
  screenBackgroundGradientEnd: '#C8B5A6',
  headerBackground: '#D3C5B7',
  headerTintColor: '#5A4032',
  textPrimary: '#3D2B1F',
  textSecondary: '#6B5B4E',
  textLight: '#8B796B',
  cardBackground: '#FDFBF7',
  cardBorderColor: '#DCD0C0',
  shadowColor: 'rgba(40, 30, 20, 0.2)',
  primary: '#A68A6E',
  accent: '#897066',
  overlay: 'rgba(0, 0, 0, 0.75)',
  white: '#FFFFFF',
  error: '#B85C5C',
  buttonGradientStart: "#D3C5B7",
  buttonGradientEnd: "#A68A6E",
  buttonBorderColor: '#5A4032',
  buttonTextAndIcon: '#FFFFFF',
  // Для модальных окон
  modalOverlayBackground: 'rgba(40, 30, 20, 0.6)',
  modalContentBackground: '#FDFBF7',
  modalTitleText: '#3D2B1F',
  modalBodyText: '#5A4032',
  modalInputBorder: '#DCD0C0',
  modalInputBackground: '#FFFFFF',
  modalButtonPrimaryBackground: '#A68A6E',
  modalButtonPrimaryText: '#FFFFFF',
  modalButtonSecondaryBackground: '#EAE0D5',
  modalButtonSecondaryText: '#5A4032',
  modalItemHoverBackground: '#F0E8DD',
};

export const SIZES = {
  padding: 16,
  radius: 12,
  // Размеры шрифтов
  h1: 26, h2: 22, h3: 18, title: 20, body: 16, caption: 12, small: 10,
  // Размеры кнопок и инпутов
  buttonHeight: 50, inputHeight: 48,
  // Размеры экрана
  width, height,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.textPrimary, lineHeight: SIZES.h1 * 1.2 },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.textPrimary, lineHeight: SIZES.h2 * 1.2 },
  h3: { fontSize: SIZES.h3, fontWeight: '600', color: COLORS.textPrimary, lineHeight: SIZES.h3 * 1.3 },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.textPrimary, lineHeight: SIZES.title * 1.2 },
  bodyRegular: { fontSize: SIZES.body, fontWeight: 'normal', color: COLORS.textPrimary, lineHeight: SIZES.body * 1.5 },
  bodyBold: { fontSize: SIZES.body, fontWeight: 'bold', color: COLORS.textPrimary, lineHeight: SIZES.body * 1.5 },
  detailLabel: { fontSize: SIZES.caption, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', lineHeight: SIZES.caption * 1.3 },
  detailValue: { fontSize: SIZES.body, fontWeight: 'normal', color: COLORS.textPrimary, lineHeight: SIZES.body * 1.4 },
  caption: { fontSize: SIZES.caption, fontWeight: 'normal', color: COLORS.textSecondary, lineHeight: SIZES.caption * 1.3 },
  error: { fontSize: SIZES.body, fontWeight: 'normal', color: COLORS.error, lineHeight: SIZES.body * 1.4 },
  noFiles: { fontSize: SIZES.body, fontWeight: 'normal', color: COLORS.textSecondary, lineHeight: SIZES.body * 1.4 },
  modalTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.modalTitleText },
  modalBody: { fontSize: SIZES.body, color: COLORS.modalBodyText, lineHeight: SIZES.body * 1.4 },
  modalButtonText: { fontSize: SIZES.body, fontWeight: '600' },
  modalInputText: { fontSize: SIZES.body, color: COLORS.textPrimary },
  modalEmptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SIZES.padding * 2},
};
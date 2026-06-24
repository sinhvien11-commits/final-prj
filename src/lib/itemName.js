// Tên món hiển thị theo ngôn ngữ: 'en' và có nameEn → dùng nameEn, ngược lại fallback name.
export function itemName(item, language) {
  return language === 'en' && item?.nameEn ? item.nameEn : item?.name
}

export const createSlug = (title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
  return slug;
};

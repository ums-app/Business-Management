
export default {
    ProductImages: (fileId) => 'Product_Images/' + fileId,
    UserImages: (email) => 'User_Images/' + email,
    DefaultImages: (id) => 'Default_Images/' + id,
    Files: (fileName) => 'Files/' + fileName
}
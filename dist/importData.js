"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const sanityClient_js_1 = require("./sanityClient.js");
const { v4: uuidv4 } = require("uuid");

async function uploadImagesToSanity(imageUrls) {
    try {
        if (!imageUrls || imageUrls.length === 0) {
            return []; // Return an empty array if no images are provided
        }

        const imageRefs = [];

        for (const imageUrl of imageUrls) {
            try {
                const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);

                // Upload the image to Sanity
                const asset = await sanityClient_js_1.client.assets.upload('image', buffer, {
                    filename: imageUrl.split('/').pop(), // Extract the filename
                });

                console.log('Image uploaded successfully:', asset);

                // Store the reference ID and generate a unique _key for each image
                imageRefs.push({
                    _type: 'image',
                    _key: uuidv4(), // Generate a unique key for each image
                    asset: {
                        _type: 'reference',
                        _ref: asset._id, // Reference the uploaded image asset
                    },
                });
            } catch (error) {
                console.error(`❌ Failed to upload image: ${imageUrl}`, error);
            }
        }

        return imageRefs;
    } catch (error) {
        console.error('❌ Error uploading images:', error);
        throw error;
    }
}
async function importData() {
    try {
        // Fetch data from external API
        const response = await axios_1.default.get('https://67827093c51d092c3dcf814c.mockapi.io/products');
        const products = response.data;
        console.log(products);
        // Iterate over the products
        for (const product of products) {
            let imageRefs = [];

            // Upload images and get asset references if images exist
            if (product.images && Array.isArray(product.images)) {
                imageRefs = await uploadImagesToSanity(product.images);
            }
            const sanityProduct = {
                _id: `mockapi-product-${product.id}`, // Ensure unique ID
                _type: 'product', // Replace with your Sanity schema type
                name: product.name,
                category: product.category || '',
                price: product.price,
                quantityAvailable: product.quantityAvailable,
                isAvailable: product.isAvailable,
                createdAt: product.createdAt,
                images: imageRefs.length > 0 ? imageRefs : [], // Array of image references or null

            };
            // Log the product before attempting to upload it to Sanity
            console.log('Uploading product:', sanityProduct);
            // Import data into Sanity
            await sanityClient_js_1.client.createOrReplace(sanityProduct);
            console.log(`✅ Imported product: ${sanityProduct.name}`);
        }
        console.log('✅ Data import completed!');
    }
    catch (error) {
        console.error('❌ Error importing data:', error);
    }
}
importData();

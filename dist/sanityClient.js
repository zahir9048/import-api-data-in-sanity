"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;

const client_1 = require("@sanity/client");
exports.client = (0, client_1.createClient)({
    projectId: "", // your project ID
    dataset: 'production'   , // Or your dataset name
    apiVersion: '2024-01-04', // Today's date or latest API version
    useCdn: false, // Disable CDN for real-time updates
    token: "", // your token
});

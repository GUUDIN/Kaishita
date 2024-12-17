import * as fs from 'fs';
import * as path from 'path';

import config from '../config/config';
import { Buy } from '~/classes/buy';
import { Product } from '~/classes/product';

export function getBuyWeight(buy: Buy): number{
    let totalWeight = 0;
    buy.productsBuy.forEach(product => {
        totalWeight += product.product.weight * product.quantity;
    });

    return totalWeight;
}

// CSV structure example:
// name,weight,price,image_href,description
// Chocolate,150,2.5,image/chocolate.png,Delicious dark chocolate

const productsCsvFilepath = config.paths.productListPath;
let products = parseCSVToProductList(productsCsvFilepath);
console.log("Product list");
console.log(products);

// Function that converts the CSV to a list of products
function parseCSVToProductList(csvFilePath: string): Product[] {
    // Read the content of CSV file
    const csvContent = fs.readFileSync(path.resolve(csvFilePath), 'utf-8');

    // Split the content into lines
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);

    // The first line is the header, so if it is empty return an error
    const header = lines.shift()?.split(',').map(col => col.trim());

    if (!header) {
        throw new Error(`Arquivo CSV ${productsCsvFilepath} vazio ou inválido`);
    }

    // Convert the lines into products
    const products: Product[] = lines.map(line => {
        const values = line.split(',').map(value => value.trim());

        const product: Product = {
            name: values[header.indexOf('name')],
            weight: parseFloat(values[header.indexOf('weight')]),
            price: parseFloat(values[header.indexOf('price')]),
            image_href: values[header.indexOf('image_href')] || undefined,
            description: values[header.indexOf('description')] || undefined,
        };

        return product;
    });

    return products;
}
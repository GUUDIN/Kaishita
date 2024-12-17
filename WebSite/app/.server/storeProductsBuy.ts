import fs from "fs";
import { Buy } from "~/classes/buy"
import config from "./config/config";

export function saveBuyToCSV(buy: Buy, filePath: string = config.paths.buyHistoryPath) {
    const header = !fs.existsSync(filePath) ? "Date,Time,Product Name,Quantity\n" : "";
  
    const rows = buy.productsBuy.map((productBuy) => {
      const date = buy.time.toISOString().split("T")[0];
      const time = buy.time.toISOString().split("T")[1].split(".")[0];
      return `${date},${time},${productBuy.product.name},${productBuy.quantity}`;
    });
  
    const csvContent = header + rows.join("\n") + "\n";
    fs.appendFileSync(filePath, csvContent, { encoding: "utf-8" });
    console.log(`Compra salva em ${filePath}`);
}

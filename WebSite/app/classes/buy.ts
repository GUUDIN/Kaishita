import { Product } from './product';

export class ProductBuy {
    constructor(public product: Product, public quantity: number){}
} 

export class Buy{
    public time: Date;
    constructor(public productsBuy: Array<ProductBuy>){
        this.time = new Date();
    }
}
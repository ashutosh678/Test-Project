import express  from "express";
import { totalmem } from "os";

const app = express();
app.use(express.json());

type PricingRule = {
    sku:String;
    price:number;
    quantityDiscount?:{
        quantity: number,
        discountedPrice: number,
    }
    bulkDiscount?:{
        quantity: number,
        discountedPrice: number,
    }
}

// mapping to keep track of the amount of item
type ItemCount= Record<string , number>

type Checkout = {
    scan : (item:string ) => void;
    total : () => number;
}

function createCheckout(pricingRules: PricingRule[]): Checkout {
    const scannedItems: string[] = [];
  
    function scan(item: string): void {
        scannedItems.push(item);
    }
  
    function countItems(): ItemCount {
        const itemCounts: ItemCount = {};
  
        for (const item of scannedItems) {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        }
        return itemCounts;
    }
  
    function total(): number {
        const itemCounts = countItems();
        let totalPrice = 0;
      
        for (const sku in itemCounts) {

            const count = itemCounts[sku];
            const pricingRule = getPricingRule(sku);
      
            if (pricingRule) {
                const { price, quantityDiscount, bulkDiscount } = pricingRule;
        
                if (bulkDiscount && count >= bulkDiscount.quantity) {
                    totalPrice += count * bulkDiscount.discountedPrice;
                } 
                else if (quantityDiscount && count ) {
                    console.log(count);
                    const discountedCount = Math.floor(count / 3) * 2;
                    const remainingCount = count % 3;
                    totalPrice += (discountedCount * price) + (remainingCount * price);
                } 
                else {
                    console.log("applying")
                    totalPrice += count * price;
                }
            }
        }
      
        return totalPrice;
    }
  
    function getPricingRule(sku: string): PricingRule | undefined {
        return pricingRules.find(rule => rule.sku === sku);
    }
  
    return {scan, total};
}

const pricingRules: PricingRule[] = [

    // putting bulDiscount and quantityDiscount will add flexibility to products and offers
    { sku: 'op10', price: 849.99 },
    { sku: 'op11', price: 949.99, bulkDiscount: { quantity: 5, discountedPrice: 899.99 } },
    { sku: 'buds', price: 129.99, quantityDiscount: { quantity: 3, discountedPrice: 259.98 } },
    { sku: 'wtch', price: 229.99 },
];
  
// Create checkout system
const co = createCheckout(pricingRules);

co.scan('buds');
co.scan('buds');
co.scan('buds');
co.scan('buds');
co.scan('buds');  // upto this the price must be 519.96
co.scan('op11');
co.scan('op11');
co.scan('op11');
co.scan('op11');
co.scan('op11');  // for oppo the price is 4499.95 but with buds it costs 5019.91
co.scan('wtch');
co.scan('wtch');
co.scan('wtch');
co.scan('wtch');  // working fine
co.scan('op10');
co.scan('op10');
co.scan('op10');
co.scan('op10');  // working fine price is 9339.83



app.get('/total', (req, res) => {
    const totalPrice = co.total();
    res.json({ total: totalPrice });
});
  






app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.listen(4001,()=>{
    console.log("Server is running on port 4001");
})


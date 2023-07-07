"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
function createCheckout(pricingRules) {
    const scannedItems = [];
    function scan(item) {
        scannedItems.push(item);
    }
    function countItems() {
        const itemCounts = {};
        for (const item of scannedItems) {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        }
        return itemCounts;
    }
    function total() {
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
                else if (quantityDiscount && count) {
                    console.log(count);
                    const discountedCount = Math.floor(count / 3) * 2;
                    const remainingCount = count % 3;
                    totalPrice += (discountedCount * price) + (remainingCount * price);
                }
                else {
                    console.log("applying");
                    totalPrice += count * price;
                }
            }
        }
        return totalPrice;
    }
    function getPricingRule(sku) {
        return pricingRules.find(rule => rule.sku === sku);
    }
    return { scan, total };
}
const pricingRules = [
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
co.scan('buds'); // upto this the price must be 519.96
co.scan('op11');
co.scan('op11');
co.scan('op11');
co.scan('op11');
co.scan('op11'); // for oppo the price is 4499.95 but with buds it costs 5019.91
co.scan('wtch');
co.scan('wtch');
co.scan('wtch');
co.scan('wtch'); // working fine
co.scan('op10');
co.scan('op10');
co.scan('op10');
co.scan('op10'); // working fine price is 9339.83
app.get('/total', (req, res) => {
    const totalPrice = co.total();
    res.json({ total: totalPrice });
});
app.get('/', (req, res) => {
    res.send("Hello World");
});
app.listen(4001, () => {
    console.log("Server is running on port 4001");
});
//# sourceMappingURL=app.js.map
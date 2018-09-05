let loadPromotions = require('./promotions');
let loadAllItems = require('./items');
let OrderItem = require('./OrderItem');
let Promotion = require('./Promotion');

module.exports = function bestCharge(selectedItems) {
  let orderItems = convertSelectedItemToOrderItem(selectedItems);
  let promotions = convertPromotionListToPromotionItem(orderItems);
  let total = orderItems.map(value => (value.count * value.price)).reduce((a, b) => a + b);
  let promotionTotal = calculatePromotionPrice(total, promotions);

  let header = displayHeader();
  let orderItemsString = displayOrderItem(orderItems);
  let promotionString = displayPromotion(promotions, promotionTotal);
  let footer = displayFooter(total, promotionTotal);

  return header+orderItemsString+promotionString+footer;
}

function displayFooter(total, promotionTotal) {
  return `总计：${total-promotionTotal}元
===================================\n`;
}
function displayHeader() {
  return "============= 订餐明细 =============\n";
}

function displayOrderItem(orderItems) {
  let result = orderItems.reduce((result, item) => result + `${item.name} x ${item.count} = ${item.count * item.price}元\n`, "");
  return result += "-----------------------------------\n";
}

function displayPromotion(promotions, promotionTotal) {

  if (!promotionTotal) {
    return "";
  }

  if (promotionTotal > 6) {
    return createPromotion1String(promotions, promotionTotal);
  } else {
    return createPromotion2String(promotions);
  }

}

function createPromotion1String(promotions, promotionTotal) {
  let promotionItems = promotions.map(value => value.name).join("，");
  return `使用优惠:\n指定菜品半价(${promotionItems})，省${promotionTotal}元\n-----------------------------------\n`;
}

function createPromotion2String(promotions) {
  return `使用优惠:
满30减6元，省6元
-----------------------------------\n`;
}

function convertSelectedItemToOrderItem(selectedItems) {
  let allItems = loadAllItems();

  return selectedItems.map(value => {
    let item = findItemById(allItems, value);
    let count = value.split("x")[1].replace(/\s*/g, "");
    return new OrderItem(item.id, item.name, item.price, count);
  });
}

function findItemById(allItems, value) {
  return allItems.find(item => {
    let countIdArray = value.split("x");
    return item.id === countIdArray[0].replace(/\s*/g, "");
  });
}

function convertPromotionListToPromotionItem(orderItems) {
  let promotionList = loadPromotions();

  let promotionItemList = [];
  orderItems.forEach(value => {
    promotionList.forEach(promotion => {
      if (promotion.items && promotion.items.includes(value.id)) {
        let promotionItem = new Promotion(value.id, value.name, value.price, promotion.type);
        promotionItemList.push(promotionItem);
      }
    })
  });

  return promotionItemList;
}


function calculatePromotionPrice(total, promotions) {
  if (!promotions.length) {
    return 0;
  }

  let priceWith1 = promotions.map(value => value.price / 2).reduce((a, b) => a + b, 0);
  return priceWith1 > 6 ? priceWith1 : 6;
}

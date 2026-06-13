export const STORE_NAME = 'Driftwood Home';

export const shipping = {
  regions: ['India', 'USA'],
  india: {
    deliveryDays: '3–5 business days',
    freeOver: '₹999',
    flatRate: '₹49',
  },
  usa: {
    deliveryDays: '7–14 business days',
    flatRate: '$15',
  },
  sameDayCutoff: '4pm IST on a business day',
};

export const returns = {
  windowDays: 30,
  condition: 'unused items with original tags',
  refundTimeline: '5–7 business days after we receive the item',
  refundMethod: 'original payment method',
  nonReturnable: ['final-sale items', 'personal-care items'],
};

export const support = {
  hours: 'Monday–Saturday, 9am–7pm IST',
  email: 'support@driftwoodhome.example',
  closedOn: 'national holidays',
};

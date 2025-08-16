import { body } from 'express-validator';

export const validateReturnOrder = [

  body('pickupAddress.building').notEmpty().trim(),
  body('pickupAddress.directions').optional().isLength({ max: 100 }).trim(),

  body('packages').isArray({ min: 1, max: 10 }),
  body('packages.*.size').isIn(['small', 'medium', 'large']),
  body('packages.*.dimensions').matches(/^\d+x\d+x\d+$/),
  body('packages.*.labelAttached').isBoolean(),

  body('schedule.date').isDate(),
  body('schedule.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('schedule.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .custom((endTime, { req }) => {
      const start = parseInt(req.body.schedule.startTime.replace(':', ''));
      const end = parseInt(endTime.replace(':', ''));
      return end > start && (end - start) >= 200;
    }),

  body('paymentMethod').isIn(['stripe_card', 'stripe_klarna', 'stripe_google_pay', 'paypal']),
  body('currency').optional().isIn(['EUR', 'USD'])
];
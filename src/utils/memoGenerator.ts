import { Order, StoreConfig } from '../types/store';
import { formatBangladeshDateTime } from './dateFormatter';

export const generateOrderMemoHtml = (order: Order, storeConfig: Partial<StoreConfig>): string => {
  const storeName = storeConfig?.storeName || 'RycreoShop';
  const storePhone = storeConfig?.contactPhone || storeConfig?.advanceDeliveryChargeNumber || '+880 1312-556660';
  const storeEmail = storeConfig?.contactEmail || 'rycreoshop@gmail.com';
  const orderDate = order.orderTimeFormatted || formatBangladeshDateTime(order.createdAt);
  
  const advancePaid = order.advancePaymentAmount || 0;
  const remainingDue = order.dueAmount !== undefined ? order.dueAmount : (order.totalAmount - advancePaid);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(order.orderNumber)}`;

  const itemsRows = order.items.map((item, idx) => {
    let imgUrl = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';
    let colorHex = '#38BDF8';
    if (item.selectedColor && item.product?.colors) {
      const col = item.product.colors.find(c => c.name === item.selectedColor);
      if (col) {
        if (col.image) imgUrl = col.image;
        if (col.hex) colorHex = col.hex;
      }
    }
    if (item.selectedVariation?.image) {
      imgUrl = item.selectedVariation.image;
    }

    const sizeColorHtml = [
      item.selectedSize ? `<span style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">Size: ${item.selectedSize}</span>` : null,
      item.selectedColor ? `<span style="font-weight: bold; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colorHex}; display: inline-block;"></span>Color: ${item.selectedColor}</span>` : null
    ].filter(Boolean).join(' ');

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${imgUrl}" alt="" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" />
            <div>
              <strong style="color: #0f172a; display: block; font-size: 13px;">${item.product?.title || 'Product Item'}</strong>
              <div style="margin-top: 4px; font-size: 11px;">${sizeColorHtml}</div>
            </div>
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; font-family: monospace; font-weight: bold;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-family: monospace;">
          ৳${item.price}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #0f172a;">
          ৳${item.price * item.quantity}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Cash Memo - #${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .memo-card {
      background: #ffffff;
      width: 100%;
      max-width: 680px;
      border-radius: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin: 0 auto;
    }

    .memo-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #0284c7;
    }

    .store-brand h1 {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .store-brand p {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .memo-badge {
      text-align: right;
    }

    .memo-badge .inv-no {
      background: #0284c7;
      color: #ffffff;
      font-family: monospace;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      display: inline-block;
      margin-bottom: 6px;
    }

    .memo-badge .inv-date {
      font-size: 11px;
      color: #cbd5e1;
      display: block;
    }

    .memo-body {
      padding: 32px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f1f5f9;
      padding: 20px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 800;
    }

    .info-box p {
      font-size: 13px;
      line-height: 1.5;
      color: #0f172a;
    }

    .info-box strong {
      font-weight: 700;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .items-table th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 800;
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }

    .totals-box {
      background: #f8fafc;
      border-radius: 14px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #475569;
      margin-bottom: 8px;
    }

    .total-row.grand {
      border-top: 2px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .payment-status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .status-card {
      padding: 14px;
      border-radius: 12px;
      text-align: center;
    }

    .status-card.paid {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    .status-card.due {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .status-card .st-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .status-card .st-value {
      font-size: 18px;
      font-weight: 800;
      font-family: monospace;
      margin-top: 2px;
    }

    .memo-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-note {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }

    .action-bar {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #0284c7;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #0369a1;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .memo-card {
        box-shadow: none;
        border: none;
        max-width: 100%;
      }
      .action-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <button class="btn btn-primary" onclick="window.print()">🖨️ মেমো প্রিন্ট / PDF সেভ করুন</button>
  </div>

  <div class="memo-card">
    <div class="memo-header">
      <div class="store-brand">
        <h1>${storeName}</h1>
        <p>Helpline: ${storePhone} | Email: ${storeEmail}</p>
      </div>
      <div class="memo-badge">
        <span class="inv-no">INVOICE #${order.orderNumber}</span>
        <span class="inv-date">Date: ${orderDate}</span>
      </div>
    </div>

    <div class="memo-body">
      <div class="info-grid">
        <div class="info-box">
          <h3>Customer Info (গ্রাহকের তথ্য)</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.phone} ${order.altPhone ? `(${order.altPhone})` : ''}</p>
        </div>
        <div class="info-box">
          <h3>Delivery Address (ডেলিভারি ঠিকানা)</h3>
          <p>${order.address}</p>
          <p><strong>${[order.upazila, order.district, order.division].filter(Boolean).join(', ')}</strong></p>
          <p><span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">Zone: ${order.cityRegion}</span></p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product Details (পণ্য বিবরণ)</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span style="font-family: monospace;">৳${order.subtotal}</span>
        </div>
        <div class="total-row">
          <span>Delivery Fee (${order.cityRegion}):</span>
          <span style="font-family: monospace;">৳${order.deliveryFee}</span>
        </div>
        ${order.discount > 0 ? `
        <div class="total-row" style="color: #059669; font-weight: 600;">
          <span>Coupon Discount (${order.couponCode || 'Voucher'}):</span>
          <span style="font-family: monospace;">-৳${order.discount}</span>
        </div>` : ''}
        ${order.prepaymentDiscount && order.prepaymentDiscount > 0 ? `
        <div class="total-row" style="color: #059669; font-weight: 600;">
          <span>Advance Discount:</span>
          <span style="font-family: monospace;">-৳${order.prepaymentDiscount}</span>
        </div>` : ''}
        <div class="total-row grand">
          <span>Total Bill (সর্বমোট মূল্য):</span>
          <span style="font-family: monospace; color: #0284c7;">৳${order.totalAmount}</span>
        </div>
      </div>

      <div class="payment-status-grid">
        <div class="status-card paid">
          <div class="st-title">${order.paymentMethod} (পরিশোধিত)</div>
          <div class="st-value">৳${advancePaid}</div>
        </div>
        <div class="status-card due">
          <div class="st-title">Payable on Delivery (বকেয়া)</div>
          <div class="st-value">৳${remainingDue}</div>
        </div>
      </div>

      ${order.paymentTrxId || order.senderPhone ? `
      <div style="background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; margin-bottom: 24px; color: #334155;">
        ${order.paymentTrxId ? `<div><strong>Trx ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7;">${order.paymentTrxId}</span></div>` : ''}
        ${order.senderPhone ? `<div><strong>Sender Phone:</strong> <span style="font-family: monospace; font-weight: 700;">${order.senderPhone}</span></div>` : ''}
      </div>` : ''}

      <div class="memo-footer">
        <div class="footer-note">
          <p><strong>ধন্যবাদ!</strong> ${storeName}-এ কেনাকাটা করার জন্য।</p>
          <p>পণ্য গ্রহণের সময় মেমো চেক করে নিন। যেকোনো সহায়তায় যোগাযোগ করুন ${storePhone}</p>
        </div>
        <img src="${qrCodeUrl}" alt="QR" style="width: 70px; height: 70px; border-radius: 8px; border: 1px solid #cbd5e1;" />
      </div>
    </div>
  </div>

</body>
</html>`;
};

export const downloadOrderMemo = (order: Order, storeConfig: Partial<StoreConfig>) => {
  const htmlContent = generateOrderMemoHtml(order, storeConfig);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Cash_Memo_${order.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

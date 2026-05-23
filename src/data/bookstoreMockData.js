const now = new Date()
const iso = (d) => d.toISOString()

export const BOOKSTORE_PRODUCT_TYPES = ['Physical Book', 'E-Book', 'Study Material']
export const BOOKSTORE_ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
]
export const BOOKSTORE_COMBO_TYPES = ['Book + Course', 'Book + Test Series', 'Book + Book']

let productSeq = 6
let orderSeq = 8
let comboSeq = 4
let bundleSeq = 3

export let MOCK_BOOKSTORE_PRODUCTS = [
  {
    id: 'BSP-001',
    name: 'UPSC Prelims GS Manual 2026',
    productType: 'Physical Book',
    description: 'Comprehensive GS manual with practice sets.',
    subject: 'General Studies',
    authorName: 'Dr. R. Sharma',
    isbn: '978-93-81234-01-1',
    language: 'English',
    originalPrice: 1299,
    discountPrice: 999,
    thumbnailUrl: '',
    previewPdfUrl: '',
    stockQuantity: 240,
    weight: '1.2 kg',
    dimensions: '24×18×3 cm',
    status: 'active',
    createdAt: iso(new Date(now - 86400000 * 30)),
  },
  {
    id: 'BSP-002',
    name: 'Indian Polity — Laxmikanth Companion',
    productType: 'Physical Book',
    description: 'Chapter-wise notes and MCQs aligned with Laxmikanth.',
    subject: 'Polity',
    authorName: 'Academy Editorial',
    isbn: '978-93-81234-02-8',
    language: 'English',
    originalPrice: 899,
    discountPrice: 749,
    thumbnailUrl: '',
    previewPdfUrl: '',
    stockQuantity: 18,
    weight: '0.9 kg',
    dimensions: '22×16×2.5 cm',
    status: 'active',
    createdAt: iso(new Date(now - 86400000 * 20)),
  },
  {
    id: 'BSP-003',
    name: 'Current Affairs Digest — Monthly PDF',
    productType: 'E-Book',
    description: 'Downloadable monthly digest with analysis.',
    subject: 'Current Affairs',
    authorName: 'Editorial Team',
    isbn: '978-93-81234-03-5',
    language: 'English',
    originalPrice: 299,
    discountPrice: 199,
    thumbnailUrl: '',
    previewPdfUrl: '/samples/preview.pdf',
    stockQuantity: 9999,
    weight: '—',
    dimensions: '—',
    status: 'active',
    createdAt: iso(new Date(now - 86400000 * 10)),
  },
  {
    id: 'BSP-004',
    name: 'Quantitative Aptitude Workbook',
    productType: 'Study Material',
    description: 'Topic-wise practice for banking & SSC.',
    subject: 'Quant',
    authorName: 'Prof. Mehta',
    isbn: '978-93-81234-04-2',
    language: 'Hindi',
    originalPrice: 650,
    discountPrice: 520,
    thumbnailUrl: '',
    previewPdfUrl: '',
    stockQuantity: 0,
    weight: '0.7 kg',
    dimensions: '21×15×2 cm',
    status: 'inactive',
    createdAt: iso(new Date(now - 86400000 * 5)),
  },
  {
    id: 'BSP-005',
    name: 'Ethics Case Studies Handbook',
    productType: 'Physical Book',
    description: 'GS-IV ethics cases with model answers.',
    subject: 'Ethics',
    authorName: 'Dr. Priya Nair',
    isbn: '978-93-81234-05-9',
    language: 'English',
    originalPrice: 1100,
    discountPrice: 880,
    thumbnailUrl: '',
    previewPdfUrl: '',
    stockQuantity: 52,
    weight: '1.0 kg',
    dimensions: '23×17×2.8 cm',
    status: 'active',
    createdAt: iso(new Date(now - 86400000 * 2)),
  },
]

export let MOCK_BOOKSTORE_ORDERS = [
  {
    id: 'BSO-1001',
    customerName: 'Aarav Patel',
    email: 'aarav@example.com',
    items: [{ productId: 'BSP-001', name: 'UPSC Prelims GS Manual 2026', qty: 1, price: 999 }],
    total: 999,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentGateway: 'Razorpay',
    shipmentId: 'SHP-7781',
    createdAt: iso(new Date(now - 86400000 * 2)),
  },
  {
    id: 'BSO-1002',
    customerName: 'Sneha Reddy',
    email: 'sneha@example.com',
    items: [
      { productId: 'BSP-002', name: 'Indian Polity — Laxmikanth Companion', qty: 2, price: 749 },
    ],
    total: 1498,
    status: 'Shipped',
    paymentStatus: 'Paid',
    paymentGateway: 'Cashfree',
    shipmentId: 'SHP-7782',
    createdAt: iso(new Date(now - 86400000 * 1)),
  },
  {
    id: 'BSO-1003',
    customerName: 'Rahul Verma',
    email: 'rahul@example.com',
    items: [{ productId: 'BSP-003', name: 'Current Affairs Digest', qty: 1, price: 199 }],
    total: 199,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentGateway: 'Razorpay',
    shipmentId: null,
    createdAt: iso(now),
  },
]

export let MOCK_BOOKSTORE_COMBOS = [
  {
    id: 'BSC-01',
    name: 'UPSC Foundation Combo',
    comboType: 'Book + Course',
    productIds: ['BSP-001', 'BSP-003'],
    originalTotal: 1198,
    comboPrice: 999,
    discountPercent: 17,
    status: 'active',
  },
  {
    id: 'BSC-02',
    name: 'Polity + Test Series',
    comboType: 'Book + Test Series',
    productIds: ['BSP-002'],
    originalTotal: 1499,
    comboPrice: 1199,
    discountPercent: 20,
    status: 'active',
  },
]

export let MOCK_BOOKSTORE_BUNDLES = [
  {
    id: 'BSB-01',
    name: 'Buy 2 Get 1 Free — GS Books',
    offerType: 'Buy X Get Y',
    buyQty: 2,
    getQty: 1,
    discountValue: null,
    productIds: ['BSP-001', 'BSP-005'],
    startsAt: iso(new Date(now - 86400000 * 7)),
    endsAt: iso(new Date(now + 86400000 * 23)),
    status: 'active',
  },
  {
    id: 'BSB-02',
    name: 'Flat ₹200 off Ethics',
    offerType: 'Flat Discount',
    buyQty: 1,
    getQty: 0,
    discountValue: 200,
    productIds: ['BSP-005'],
    startsAt: iso(new Date(now - 86400000 * 3)),
    endsAt: iso(new Date(now + 86400000 * 10)),
    status: 'active',
  },
]

export const MOCK_BOOKSTORE_PAYMENTS = [
  {
    id: 'PAY-9001',
    orderId: 'BSO-1001',
    gateway: 'Razorpay',
    amount: 999,
    status: 'Success',
    txnId: 'rzp_abc123',
    createdAt: iso(new Date(now - 86400000 * 2)),
  },
  {
    id: 'PAY-9002',
    orderId: 'BSO-1002',
    gateway: 'Cashfree',
    amount: 1498,
    status: 'Success',
    txnId: 'cf_xyz789',
    createdAt: iso(new Date(now - 86400000 * 1)),
  },
  {
    id: 'PAY-9003',
    orderId: 'BSO-1003',
    gateway: 'Razorpay',
    amount: 199,
    status: 'Failed',
    txnId: 'rzp_fail001',
    createdAt: iso(now),
  },
]

export const MOCK_BOOKSTORE_WALLET_TXNS = [
  { id: 'WT-01', user: 'Aarav Patel', type: 'credit', points: 50, reason: 'Order BSO-1001', createdAt: iso(new Date(now - 86400000 * 2)) },
  { id: 'WT-02', user: 'Sneha Reddy', type: 'debit', points: 100, reason: 'Redeemed on order', createdAt: iso(new Date(now - 86400000 * 1)) },
]

export const MOCK_BOOKSTORE_RECOMMENDATIONS = [
  { id: 'REC-1', type: 'Related Products', sourceProductId: 'BSP-001', targetProductIds: ['BSP-002', 'BSP-005'], status: 'active' },
  { id: 'REC-2', type: 'Frequently Bought Together', sourceProductId: 'BSP-002', targetProductIds: ['BSP-001'], status: 'active' },
]

export const MOCK_BOOKSTORE_INVOICES = [
  { id: 'INV-5001', orderId: 'BSO-1001', gstin: '29AABCU9603R1ZX', amount: 999, status: 'Generated', createdAt: iso(new Date(now - 86400000 * 2)) },
  { id: 'INV-5002', orderId: 'BSO-1002', gstin: '29AABCU9603R1ZX', amount: 1498, status: 'Generated', createdAt: iso(new Date(now - 86400000 * 1)) },
]

export const MOCK_INVENTORY_LOGS = [
  { id: 'LOG-1', productId: 'BSP-001', change: -2, reason: 'Order BSO-1001', stockAfter: 240, createdAt: iso(new Date(now - 86400000 * 2)) },
  { id: 'LOG-2', productId: 'BSP-002', change: +50, reason: 'Restock', stockAfter: 68, createdAt: iso(new Date(now - 86400000 * 1)) },
]

export function nextProductId() {
  productSeq += 1
  return `BSP-${String(productSeq).padStart(3, '0')}`
}

export function nextOrderId() {
  orderSeq += 1
  return `BSO-${1000 + orderSeq}`
}

export function nextComboId() {
  comboSeq += 1
  return `BSC-${String(comboSeq).padStart(2, '0')}`
}

export function nextBundleId() {
  bundleSeq += 1
  return `BSB-${String(bundleSeq).padStart(2, '0')}`
}

export function buildBookstoreDashboardPayload({ dateFrom, dateTo } = {}) {
  const products = MOCK_BOOKSTORE_PRODUCTS
  const orders = MOCK_BOOKSTORE_ORDERS
  const revenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.total, 0)

  return {
    stats: {
      totalRevenue: revenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCombos: MOCK_BOOKSTORE_COMBOS.length,
      pendingOrders: orders.filter((o) => o.status === 'Pending').length,
      deliveredOrders: orders.filter((o) => o.status === 'Delivered').length,
      lowStockProducts: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 20).length,
      topSellingProducts: 3,
    },
    revenueChart: [
      { label: 'Mon', amount: 4200 },
      { label: 'Tue', amount: 5100 },
      { label: 'Wed', amount: 3800 },
      { label: 'Thu', amount: 6200 },
      { label: 'Fri', amount: 7400 },
      { label: 'Sat', amount: 8900 },
      { label: 'Sun', amount: 5600 },
    ],
    productSalesChart: products.slice(0, 5).map((p) => ({
      label: p.name.slice(0, 12),
      units: Math.max(5, 120 - p.stockQuantity),
    })),
    orderTrends: [
      { label: 'W1', orders: 12 },
      { label: 'W2', orders: 18 },
      { label: 'W3', orders: 15 },
      { label: 'W4', orders: 22 },
    ],
    comboPerformance: MOCK_BOOKSTORE_COMBOS.map((c) => ({
      label: c.name.slice(0, 14),
      sales: Math.round(c.comboPrice / 100),
    })),
    recentOrders: orders,
    lowStockAlerts: products.filter((p) => p.stockQuantity <= 20 && p.stockQuantity >= 0),
    bestSellers: [...products]
      .sort((a, b) => b.originalPrice - a.originalPrice)
      .slice(0, 5)
      .map((p) => ({ ...p, unitsSold: Math.max(10, 100 - p.stockQuantity) })),
    filters: { dateFrom, dateTo },
  }
}

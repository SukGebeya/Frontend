import type { components } from './schema.js';

type Schemas = components['schemas'];
type Dto<Name extends string> = Schemas[`internal_http_handler.${Name}` & keyof Schemas];

export type User = Dto<'UserResponse'>;
export type Address = Dto<'AddressResponse'>;
export type Cart = Dto<'CartResponse'>;
export type CartItem = Dto<'CartItemResponse'>;
export type Product = Dto<'ProductResponse'>;
export type ProductDetail = Dto<'ProductDetailResponse'>;
export type ProductSummary = Dto<'ProductSummaryResponse'>;
export type Variant = Dto<'VariantResponse'>;
export type Shop = Dto<'ShopResponse'>;
export type Order = Dto<'OrderResponse'>;
export type OrderDetail = Dto<'OrderDetailResponse'>;
export type OrderItem = Dto<'OrderItemResponse'>;
export type Shipment = Dto<'ShipmentResponse'>;
export type MerchantProfile = Dto<'MerchantProfileResponse'>;
export type Dashboard = Dto<'MerchantDashboardResponse'>;
export type Wallet = Dto<'GetWalletResponse'>;
export type WalletTransaction = Dto<'TransactionResponse'>;
export type Payout = Dto<'PayoutResponse'>;
export type Bank = Dto<'BankResponse'>;
export type Tokens = Dto<'TokenResponse'>;

// The backend's shared PaginatedResponse leaves `items` untyped; endpoints using it document the item type.
export interface Paginated<T> {
	items: T[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}

export type OrderStatus =
	| 'pending_payment'
	| 'paid'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'disputed'
	| 'cancelled'
	| 'refunded';
